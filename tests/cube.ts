import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { assert } from 'chai';
import { Cube } from '../target/types/cube';
import { find_pda, fund } from './utils';

describe(`cube`, () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Cube as Program<Cube>;

    // Users
    const cuber: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const challenger: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    // Challenge
    let cube: anchor.web3.PublicKey;
    const CUBE_SIZE: number = 8 + 2 * (1 * 8) + 2 * (1 * 12);
    const PRIZE = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

    // R' U' F R' B' L2 F2 L D2 L D2 R' B2 D F2 R2 D2 R U B F' U' R U2 L' D' U' R' U' F
    // Solution: D F' L' F U B' U2 F D2 L D2 R2 L2 F2 D L2 F2 U' R2 F2 B2 D'
    let scrambled_cube: anchor.IdlTypes<Cube> = {
        co: [0, 2, 0, 0, 2, 1, 2, 2],
        cp: [3, 5, 6, 2, 4, 8, 7, 1],
        eo: [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1],
        ep: [5, 4, 6, 8, 11, 12, 3, 2, 7, 9, 1, 10],
    };

    before(async () => {
        // Fund accounts
        await fund(provider.connection, cuber.publicKey);
        await fund(provider.connection, challenger.publicKey);

        // Derive Cube address
        cube = await find_pda(
            [`CUBE`, challenger.publicKey],
            program.programId
        );
    });

    it(`Creates scrambled cube`, async () => {
        // Call method
        const CHALLENGER_BALANCE_I: number =
            await provider.connection.getBalance(challenger.publicKey);

        await program.methods
            .initCube(scrambled_cube, PRIZE)
            .accounts({ challenger: challenger.publicKey, cube })
            .signers([challenger])
            .rpc();

        // Check if scrambled cube was created correctly
        let scrambled_cube_struct = await program.account.cube.fetch(cube);
        assert.deepEqual(scrambled_cube_struct, scrambled_cube);

        // Check that prize is locked in cube (+ Rent lamports)
        const CHALLENGER_BALANCE_F: number =
            await provider.connection.getBalance(challenger.publicKey);
        const CUBE_BALANCE: number = await provider.connection.getBalance(cube);

        assert.isBelow(CHALLENGER_BALANCE_F, CHALLENGER_BALANCE_I);
        assert.equal(
            CUBE_BALANCE,
            (await provider.connection.getMinimumBalanceForRentExemption(
                CUBE_SIZE
            )) +
                1 * anchor.web3.LAMPORTS_PER_SOL
        );
    });

    it(`Reverts if move sequence has invalid moves`, async () => {
        try {
            await program.methods
                .trySolution(`hi`)
                .accounts({ cuber: cuber.publicKey, cube })
                .signers([cuber])
                .rpc();
        } catch (error) {
            assert.equal(error.error.errorCode.code, `InvalidMove`);
            return;
        }

        assert.fail(`Should fail`);
    });

    it(`Reverts if cube is attempted to be solved with an incorrect sequence`, async () => {
        try {
            await program.methods
                .trySolution(`R U R' D F2 B2`)
                .accounts({ cuber: cuber.publicKey, cube })
                .signers([cuber])
                .rpc();
        } catch (error) {
            assert.equal(error.error.errorCode.code, `UnsolvedCube`);
            return;
        }

        assert.fail(`Should fail`);
    });

    it(`Solves cube`, async () => {
        const CUBER_BALANCE_I = await provider.connection.getBalance(
            cuber.publicKey
        );

        // Call method
        await program.methods
            .trySolution(
                `D F' L' F U B' U2 F D2 L D2 R2 L2 F2 D L2 F2 U' R2 F2 B2 D'`
            )
            .accounts({
                cuber: cuber.publicKey,
                cube,
            })
            .signers([cuber])
            .rpc();

        // Check balances got updated and Cube account is closed
        const CUBER_BALANCE_F = await provider.connection.getBalance(
            cuber.publicKey
        );
        assert.approximately(
            CUBER_BALANCE_I + PRIZE.toNumber(),
            CUBER_BALANCE_F,
            2500000
        );
        const cube_data = await provider.connection.getAccountInfo(cube);
        assert.isNull(cube_data);
    });
});
