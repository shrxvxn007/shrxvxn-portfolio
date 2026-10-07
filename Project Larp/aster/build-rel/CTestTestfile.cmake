# CMake generated Testfile for 
# Source directory: /Users/shrxvxn/Downloads/aster
# Build directory: /Users/shrxvxn/Downloads/aster/build-rel
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(test_engine "/Users/shrxvxn/Downloads/aster/build-rel/test_engine")
set_tests_properties(test_engine PROPERTIES  _BACKTRACE_TRIPLES "/Users/shrxvxn/Downloads/aster/CMakeLists.txt;129;add_test;/Users/shrxvxn/Downloads/aster/CMakeLists.txt;0;")
add_test(test_parser "/Users/shrxvxn/Downloads/aster/build-rel/test_parser")
set_tests_properties(test_parser PROPERTIES  _BACKTRACE_TRIPLES "/Users/shrxvxn/Downloads/aster/CMakeLists.txt;139;add_test;/Users/shrxvxn/Downloads/aster/CMakeLists.txt;0;")
add_test(test_replay "/Users/shrxvxn/Downloads/aster/build-rel/test_replay")
set_tests_properties(test_replay PROPERTIES  _BACKTRACE_TRIPLES "/Users/shrxvxn/Downloads/aster/CMakeLists.txt;149;add_test;/Users/shrxvxn/Downloads/aster/CMakeLists.txt;0;")
add_test(test_cli_flag_parser "python3" "/Users/shrxvxn/Downloads/aster/tests/test_cli_flag_parser.py")
set_tests_properties(test_cli_flag_parser PROPERTIES  WORKING_DIRECTORY "/Users/shrxvxn/Downloads/aster" _BACKTRACE_TRIPLES "/Users/shrxvxn/Downloads/aster/CMakeLists.txt;160;add_test;/Users/shrxvxn/Downloads/aster/CMakeLists.txt;0;")
add_test(test_ci_snapshot "python3" "/Users/shrxvxn/Downloads/aster/tests/test_ci_snapshot.py" "--repo-root" "/Users/shrxvxn/Downloads/aster")
set_tests_properties(test_ci_snapshot PROPERTIES  LABELS "ci" WORKING_DIRECTORY "/Users/shrxvxn/Downloads/aster" _BACKTRACE_TRIPLES "/Users/shrxvxn/Downloads/aster/CMakeLists.txt;193;add_test;/Users/shrxvxn/Downloads/aster/CMakeLists.txt;0;")
