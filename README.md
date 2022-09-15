# Solana Rubik's Cube

Implementation of a Rubik's Cube in the Solana blockchain.

# Usage

The program has two methods:

- `init_cube(scramble, prize)`: allows a user to create a challenge, which consists in a scrambled Rubik's Cube and a prize for the first one to solve it.
- `try_solution(solution)`: allows a user to try a solution on a challenge; if they solve it they get the prize and the challenge ends.

# Notation

This program accepts non-wide, non-rotation moves as per the official [WCA notation](https://www.worldcubeassociation.org/regulations/#article-12-notation).
That is:

- Valid move letters: `R, U, F, L, D, B`
- Valid suffixes: `', 2, none`

Examples:

- :white_check_mark: `R' U' F L2 U R2 U2 B2 U R2 U' B2 U' F' U' L F2 U' R2 F U B' U' R' U' F`  
- :x: ```R` U R` D```
- :x: `Rw U R' D`
- :x: `r U R' D'`
- :x: `R A B C D`
- :x: `R U R' y F2 R2`

# Limitations

Due to the limited computational units, `try_solution()` reverts with move sequences of above ~300 moves unless an increase request is sent in the same transaction.  
Anyway, [300 is plenty](https://cube20.org/).
