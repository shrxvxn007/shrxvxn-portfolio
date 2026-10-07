#!/usr/bin/env python3
"""
run_100m_backtest.py — committed evidence for the resume's
"100M+ order-book events" claim.

Generates a deterministic 100M-event ITCH file at /tmp, runs
`aster_replay --itch-file ... --speed batch` against it, parses
the Analytics block from replay stdout, and writes the captured
numbers to `tests/golden/analytics_100m.json`.

NOT a default CI test (too heavy to run on every PR). Use as a
manual reproduction / commit-evidence script.

Pipeline:
  1. Stream a deterministic 100M-event ITCH file to disk (~3 GB)
  2. Invoke aster_replay with --speed batch (no wall-clock pacing)
  3. Parse the printed Analytics block (regexes shared with
     scripts/check_replay_golden.py so we double-parse the same
     fields the strategy gate already understands)
  4. Persist the captured fields + tolerances as a golden JSON
     so callers (and your reviewer) can read the result without
     reproducing the run

Usage:
  python3 scripts/run_100m_backtest.py [--events 100000000]
                                       [--pool-size 2000000]
                                       [--keep-tmp]
  python3 scripts/run_100m_backtest.py --events 1000000 --pool-size 200000
                                       # smoke test (5-10s end-to-end)
"""
from __future__ import annotations

import argparse
import json
import os
import re
import struct
import subprocess
import sys
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_EVENTS = 100_000_000
DEFAULT_POOL_SIZE = 2_000_000
TMP_ITCH = Path("/tmp/aster_100m_backtest.itch")
GOLDEN_PATH = REPO_ROOT / "tests" / "golden" / "analytics_100m.json"
# 16 MB rolling-write buffer. At 62 B/pair this is ~270 k messages per
# flush; ~370 syscalls for 100 M events. Module-level so external smoke
# tests can introspect it.
CHUNK_BYTES = 16 * 1024 * 1024
# Scratch bytearray for 7-byte timestamp packing. Always written into
# before the per-message buffer copy, so we never allocate a `bytes(7)`
# inside the 100 M-iteration loop.
TS_SCRATCH = bytearray(8)


# ---------------------------------------------------------------------------
# Big-endian write helpers (mirror scripts/generate_test_itch.py conventions;
# kept local so this script is self-contained and runnable in isolation).
# ---------------------------------------------------------------------------

def u8(v: int) -> bytes:
    return struct.pack(">B", v & 0xFF)


def u16(v: int) -> bytes:
    return struct.pack(">H", v & 0xFFFF)


def u32(v: int) -> bytes:
    return struct.pack(">I", v & 0xFFFFFFFF)


def u48_be(v: int) -> bytes:
    if not 0 <= v < (1 << 56):
        raise ValueError(f"u48: value {v} out of range")
    return v.to_bytes(7, "big")


# ---------------------------------------------------------------------------
# Generator: alternating Bid/Ask Add orders that *cross* so fills happen
# (no fills => realized_pnl == 0 and Sharpe undefined). The first order rests
# alone; the second arrives with a price that crosses it and is consumed as
# the taker. Subsequent pairs match in lockstep. This is intentionally simple
# so the resulting analytics are stable across runs / hardware.
# ---------------------------------------------------------------------------

# Prices in the matching engine's fixed-point are USD * 1e5:
#   $99.00 ->  9_900_000
#   $101.00 -> 10_100_000
# Spread = $2.00 so every cross match is guaranteed.
SCALE = 100_000
PRICE_BID = 101 * SCALE  # willing to pay up to $101
PRICE_ASK = 99 * SCALE   # willing to accept $99 or higher
LOT_SIZE = 100           # shares per order
SYMBOL_ID = 0
SYMBOL_NAME = b"BMCH"


def iter_add_messages(num_events: int):
    """Yield raw Add-message bytes for `num_events` alternating Bids/Asks.

    OIDs increase monotonically; all Bids share oid=2k+1, Asks share
    oid=2k+2. Bid k matches Ask k (the second of each pair consumes
    the first as taker; both vanish). Aggregate events: num_events,
    fills: num_events // 2.
    """
    half = num_events // 2
    # Ts is 7-byte big-endian; spread over a wide range so analytics
    # has events to attach to. Increment by 100ns per order so 100M
    # events cover ~10 seconds of exchange time. (Replay is in batch
    # mode so this is purely for analytics timestamp bucketing.)
    for i in range(half):
        bid_oid = 2 * i + 1
        ask_oid = 2 * i + 2
        bts = u48_be(1_000_000_000 + 100 * bid_oid)  # bid arrives first, rests
        ats = u48_be(1_000_000_000 + 100 * ask_oid)  # ask crosses, fills
        bid = (
            u8(ord("A")) + bts
            + struct.pack(">Q", bid_oid)
            + u16(SYMBOL_ID)
            + u8(int(0))  # side = Buy = 0
            + struct.pack(">Q", PRICE_BID)
            + u32(LOT_SIZE)
        )
        ask = (
            u8(ord("A")) + ats
            + struct.pack(">Q", ask_oid)
            + u16(SYMBOL_ID)
            + u8(int(1))  # side = Sell = 1
            + struct.pack(">Q", PRICE_ASK)
            + u32(LOT_SIZE)
        )
        yield bid + ask


def write_header(f) -> None:
    f.write(b"ITCH")
    f.write(struct.pack(">II", 1, 1))  # version, symbol_count
    f.write(u8(len(SYMBOL_NAME)))
    f.write(SYMBOL_NAME)
    f.write(u16(SYMBOL_ID))


def write_system(f, code: str, ts: int) -> None:
    f.write(u8(ord("S")) + u48_be(ts) + u8(ord(code)))


# ---------------------------------------------------------------------------
# Analytics parser (regexes intentionally mirror scripts/check_replay_golden.py
# so any future tightening of the gate stays consistent with this evidence).
# ---------------------------------------------------------------------------

ANALYTICS_PATTERNS = {
    "realized_pnl":   r"Realized PnL:\s+(-?\d+\.\d+)",
    "unrealized_pnl": r"Unrealized PnL:\s+(-?\d+\.\d+)",
    "total_fees":     r"Total Fees:\s+(-?\d+\.\d+)",
    "net_pnl":        r"Net PnL:\s+(-?\d+\.\d+)",
    "max_drawdown":   r"Max Drawdown:\s+(-?\d+\.\d+)",
    "sharpe":         r"Sharpe:\s+(-?\d+\.\d+)",
    "sortino":        r"Sortino:\s+(-?\d+\.\d+)",
    "turnover":       r"Turnover:\s+(-?\d+\.\d+)",
    "avg_toxic_cost": r"Avg toxic cost:\s+(-?\d+\.\d+)",
}
RE_TOXIC = re.compile(
    r"Toxic fills:\s+(\d+)\s+/\s+(\d+)\s+\((\d+\.\d+)%\)"
)


def parse_analytics(stdout: str) -> dict:
    """Pull the Analytics block out of `stdout` and return a dict
    matching the schema of tests/golden/analytics_ci.json.
    """
    out: dict = {}
    for k, rx in ANALYTICS_PATTERNS.items():
        m = re.search(rx, stdout)
        if m:
            out[k] = float(m.group(1))
    m = RE_TOXIC.search(stdout)
    if m:
        out["toxic_fills"] = int(m.group(1))
        out["total_fills"] = int(m.group(2))
        out["toxic_pct"] = float(m.group(3))
    return out


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def _build_template():
    """Build a 62-byte template for a Bid/Ask pair with the *fixed* parts
    (type 'A', sym=0, side bytes, PRICE constants, qty=100) baked in and
    the *variable* parts (ts, oid) zeroed. The tight loop overrides only
    ts + oid with struct.pack_into into the bytearray, skipping thousands
    of struct.pack() allocations per second.

    Layout for one Add msg (31 bytes):
       offset 0: u8  type  ('A')
       offset 1: u7  ts    (zeroed; written in loop)
       offset 8: u8  oid   (zeroed; written in loop)
       offset 16: u2 sym   (filled below)
       offset 18: u1 side  (filled below)
       offset 19: u8 price (filled below; PRICE_BID or PRICE_ASK)
       offset 27: u4 qty   (filled below; LOT_SIZE)

    Layout for a Bid/Ask pair (62 bytes):
       offset  0..30:  bid msg (side=0, price=PRICE_BID)
       offset 31..61:  ask msg (side=1, price=PRICE_ASK)
    """
    bid_template = bytearray(31)
    bid_template[0] = ord('A')              # type
    struct.pack_into('>H', bid_template, 16, SYMBOL_ID)
    bid_template[18] = 0                    # side = Buy
    struct.pack_into('>Q', bid_template, 19, PRICE_BID)
    struct.pack_into('>I', bid_template, 27, LOT_SIZE)

    ask_template = bytearray(31)
    ask_template[0] = ord('A')
    struct.pack_into('>H', ask_template, 16, SYMBOL_ID)
    ask_template[18] = 1                    # side = Sell
    struct.pack_into('>Q', ask_template, 19, PRICE_ASK)
    struct.pack_into('>I', ask_template, 27, LOT_SIZE)

    return bid_template, ask_template


def generate_itch(path: Path, num_events: int) -> float:
    print(f"[gen] writing {num_events:,} events -> {path}", flush=True)
    t0 = time.time()
    # Single pre-allocated buffer + slice-flush. We CANNOT flush the whole
    # 16 MB on partial-buffer writes because `f.write(buf)` ignores the
    # logical `pos` and writes the underlying bytearray's full 16 MB
    # length \u2014 trailing bytes would be uninitialised/stale and the
    # parser would treat them as a malformed message type and exit
    # immediately, causing the replay to short-circuit on garbage.
    #   `f.write(buf[:pos])` is the only correct pure-Python form.
    #   The slice copy is C-level memcpy in CPython, ~10 ms per flush on
    #   16 MB, ~370 flushes for 100 M events = ~3.7 s wallclock overhead,
    #   well inside our budget.
    bid_tmpl, ask_tmpl = _build_template()
    buf = bytearray(CHUNK_BYTES)
    ts_scratch = TS_SCRATCH

    with path.open("wb") as f:
        # header + system open (fits comfortably in one f.write).
        f.write(b"ITCH")
        f.write(struct.pack(">II", 1, 1))
        f.write(b"\x04BMCH\x00\x00")
        f.write(b"S" + (1_000_000_000 - 1).to_bytes(7, "big") + b"O")

        pos = 0
        close_pairs = num_events // 2
        for i in range(close_pairs):
            bid_oid = 2 * i + 1
            ask_oid = 2 * i + 2
            bts_int = 1_000_000_000 + 100 * bid_oid
            ats_int = 1_000_000_000 + 100 * ask_oid

            # bid: copy template into buffer, then overwrite ts + oid.
            buf[pos:pos + 31] = bid_tmpl
            struct.pack_into(">Q", ts_scratch, 0, bts_int)
            buf[pos + 1:pos + 8] = ts_scratch[1:]   # 7-byte big-endian ts
            struct.pack_into(">Q", buf, pos + 8, bid_oid)

            # ask: same.
            buf[pos + 31:pos + 62] = ask_tmpl
            struct.pack_into(">Q", ts_scratch, 0, ats_int)
            buf[pos + 32:pos + 39] = ts_scratch[1:]
            struct.pack_into(">Q", buf, pos + 39, ask_oid)

            pos += 62
            # Flush whenever the next pair wouldn't fit. The slice flush
            # (`buf[:pos]`) is correct: only the filled prefix goes out,
            # no trailing garbage. The C-level memcpy in CPython handles
            # this efficiently.
            if pos + 62 > CHUNK_BYTES:
                f.write(buf[:pos])
                pos = 0

        if pos > 0:
            f.write(buf[:pos])
        f.write(b"S" + (1_000_000_000 + 100 * (num_events + 2))
                .to_bytes(7, "big") + b"C")

    elapsed = time.time() - t0
    size_gb = path.stat().st_size / 1e9
    print(f"[gen] wrote {size_gb:.2f} GB in {elapsed:.1f}s "
          f"({size_gb / elapsed * 1024:.1f} MB/s)", flush=True)
    return elapsed


def run_replay(itch_path: Path, pool_size: int,
               binary: str = "./build/aster_replay") -> tuple[str, float]:
    print(f"[run] {binary} --itch-file {itch_path} --speed batch "
          f"--pool-size {pool_size}", flush=True)
    t0 = time.time()
    proc = subprocess.run(
        [binary, "--itch-file", str(itch_path),
         "--speed", "batch", "--pool-size", str(pool_size)],
        capture_output=True, text=True,
        cwd=str(REPO_ROOT),
    )
    elapsed = time.time() - t0
    print(f"[run] completed in {elapsed:.1f}s "
          f"(exit {proc.returncode})", flush=True)
    if proc.returncode != 0:
        sys.stderr.write(
            f"aster_replay exited non-zero ({proc.returncode}); stderr tail:\n"
            + "\n".join(proc.stderr.splitlines()[-15:])
        )
    return proc.stdout, elapsed


def write_golden(data: dict, num_events: int,
                 gen_s: float, replay_s: float, target_path: Path):
    payload = {
        "_meta": {
            "source": ("scripts/run_100m_backtest.py --events {n} "
                       "--pool-size 2_000_000 --speed batch").format(
                           n=num_events),
            "captured": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "regenerated_with": (
                "python3 scripts/run_100m_backtest.py "
                "--events {n} --pool-size {p} --speed batch"
            ).format(n=num_events, p=2_000_000),
            "events": num_events,
            "expected_fills": num_events // 2,
            "wallclock_gen_s": round(gen_s, 3),
            "wallclock_replay_s": round(replay_s, 3),
            "tolerances": {
                "_comment": (
                    "Matches the tolerance profile used by "
                    "scripts/check_replay_golden.py for the 5-second "
                    "analytics_ci.json golden. Counts are exact; "
                    "currency fields are within 1e-4 absolute; ratios "
                    "/ Sharpes are within 1e-6 absolute. (Unlike the "
                    "5s golden, this file is informational — no live "
                    "CI gate — so the goal is reproducible evidence, "
                    "not byte-identical regeneration.)"
                ),
                "currency_abs": 0.0001,
                "ratio_abs": 1e-6,
                "counts_exact": 0,
            },
        },
    }
    payload.update(data)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(json.dumps(payload, indent=2, sort_keys=False))
    print(f"[ok] wrote golden -> {target_path}", flush=True)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--events", type=int, default=DEFAULT_EVENTS,
                        help=f"events to generate (default {DEFAULT_EVENTS:,})")
    parser.add_argument("--pool-size", type=int, default=DEFAULT_POOL_SIZE,
                        help=f"OrderPool capacity (default {DEFAULT_POOL_SIZE:,})")
    parser.add_argument("--keep-tmp", action="store_true",
                        help="don't delete /tmp/aster_100m_backtest.itch on success")
    parser.add_argument("--binary", default="./build/aster_replay",
                        help="path to aster_replay binary (default ./build/aster_replay)")
    parser.add_argument("--out", default=str(GOLDEN_PATH),
                        help=f"path to write the golden JSON "
                             f"(default tests/golden/analytics_100m.json)")
    args = parser.parse_args(argv)

    # Pre-flight: pool_size must comfortably exceed simultaneous live orders
    # for the alternating Bid/Ask pattern. With one resting bid per pair,
    # the live count is always ≤1 on each side, so 100k+ is plenty; the
    # default 2M leaves headroom for the MM's own quotes.
    if args.pool_size < 100_000:
        sys.stderr.write(
            f"refusing --pool-size {args.pool_size}: must be >= 100000 "
            f"so the synthetic feed + agent quotes fit\n"
        )
        return 2

    try:
        gen_s = generate_itch(TMP_ITCH, args.events)
        stdout, replay_s = run_replay(TMP_ITCH, args.pool_size, args.binary)
    finally:
        if not args.keep_tmp and TMP_ITCH.exists():
            tmp_bytes = TMP_ITCH.stat().st_size
            TMP_ITCH.unlink()
            print(f"[cleanup] removed {TMP_ITCH} ({tmp_bytes / 1e9:.2f} GB)",
                  flush=True)

    if not stdout:
        sys.stderr.write("replay returned no stdout; nothing to parse\n")
        return 1

    data = parse_analytics(stdout)
    if not data:
        sys.stderr.write(
            "could not parse analytics fields from replay stdout. Tail:\n"
            + "\n".join(stdout.splitlines()[-20:]) + "\n"
        )
        return 1

    write_golden(data, args.events, gen_s, replay_s, Path(args.out))

    # Oneliners for at-a-glance review of the captured run.
    print()
    print("=== captured analytics_100m.json summary ===")
    for k in ("realized_pnl", "unrealized_pnl", "total_fees", "net_pnl",
              "max_drawdown", "sharpe", "sortino", "turnover",
              "toxic_fills", "total_fills", "toxic_pct", "avg_toxic_cost"):
        if k in data:
            print(f"  {k:18s} = {data[k]}")
    print(f"  events:               {args.events:,}")
    print(f"  wallclock gen+replay: {gen_s + replay_s:.1f}s "
          f"(gen {gen_s:.1f}s + replay {replay_s:.1f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
