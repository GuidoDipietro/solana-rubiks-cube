# Solana Rubik's Cube

Implementation of a Rubik's Cube in the Solana blockchain.

# Usage

The program has three instructions, wrapped in a TypeScript SDK:

-   `initCube(sponsor, cube, prize)`: allows a sponsor to create a challenge, which consists in a scrambled Rubik's Cube and a prize for the first one to solve it. The sponsor gets registered in the list of sponsors on-chain.
-   `trySolution(cubeAddress, solution)`: allows a user to try a solution on a challenge; if they solve it they get the prize and the challenge ends. The winner of each challenge gets registered in the list of winners on-chain.
-   `peekCube(moves)`: allows a user to see how a Rubik's Cube ends up, in array representation, after applying moves to a solved cube.

There is also a `initCubeWithScramble` method wrapping `initCube` even further, as well as some other useful stuff.

Check the file `client/cube-client.ts` to see the whole SDK.

# Running

Install [NodeJS and Yarn](https://classic.yarnpkg.com/lang/en/docs/install), [Anchor](https://book.anchor-lang.com/getting_started/installation.html), and generate a Solana keypair if you don't already have one.

To check if you have one run `solana-keygen pubkey ~/.config/solana/id.json`.  
If you don't have one generate it with `solana-keygen new --outfile ~/.config/solana/id.json`.

To interact with this program, run `yarn install`, edit the file in `tests/devnet-cube.ts` and run it using the following command:

```
ANCHOR_WALLET=path/to/wallet/id.json yarn run ts-mocha tests/devnet-cube.ts
```

Note that `path/to/wallet/id.json` will be `~/.config/solana/id.json` if you just generated the Keypair a moment ago.

Have fun!

# Challenges for this CTF

Who are the sponsors? Did any of them submit only challenges with no prizes?

Who have solved a challenge correctly?

Which challenges are there still ongoing?

Can you create a challenge yourself?

Can you solve any of the existing challenges?

Who earnt the most tokens by solving challenges so far?

# Notation

This program accepts non-wide, non-rotation moves as per the official [WCA notation](https://www.worldcubeassociation.org/regulations/#article-12-notation).
That is:

-   Valid move letters: `R, U, F, L, D, B`
-   Valid suffixes: `', 2, none`

Examples:

-   :white_check_mark: `R' U' F L2 U R2 U2 B2 U R2 U' B2 U' F' U' L F2 U' R2 F U B' U' R' U' F`
-   :x: `` R` U R` D ``
-   :x: `Rw U R' D`
-   :x: `r U R' D'`
-   :x: `R A B C D`
-   :x: `R U R' y F2 R2`

# Limitations

Due to the limited computational units, `trySolution()` reverts with move sequences of above ~300 moves unless an increase request is sent in the same transaction.  
Anyway, [300 is plenty](https://cube20.org/).
