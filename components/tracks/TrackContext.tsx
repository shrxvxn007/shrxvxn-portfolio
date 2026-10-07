"use client";

import { createContext, useContext } from "react";

export type Track = "QUANT" | "ML" | "SWE";

export const TrackContext = createContext<Track>("QUANT");
export const useTrack = () => useContext(TrackContext);
