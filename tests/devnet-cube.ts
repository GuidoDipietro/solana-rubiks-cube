// ANCHOR_WALLET=$ANCHOR_WALLET yarn run ts-mocha tests/devnet-cube.ts

import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { CubeSDK } from '../client/cube-client';
import { Cube } from '../target/types/cube';

describe(`cube`, () => {
    // Configure the client to use the Devnet cluster
    const connection = new anchor.web3.Connection(
        `https://api.devnet.solana.com`,
        { commitment: `confirmed` }
    );
    const provider = new anchor.AnchorProvider(
        connection,
        anchor.Wallet.local(),
        { commitment: `confirmed` }
    );
    anchor.setProvider(provider);

    // Create a CubeSDK
    const programSDK = new CubeSDK(
        new Program<Cube>(
            JSON.parse(
                require(`fs`).readFileSync(`target/idl/cube.json`, `utf-8`)
            ),
            `aJQboVi8BRg98ZYLkyun59madrxWjP3tpscvZ6jKmMU`
        ),
        provider
    );

    it(`Interact with Devnet live program`, async () => {
        const cube = await programSDK.peekCube(
            `R' U' F R' B' L2 F2 L D2 L D2 R' B2 D F2 R2 D2 R U B F' U' R U2 L' D' U' R' U' F`
        );

        console.log(cube);
    });
});
