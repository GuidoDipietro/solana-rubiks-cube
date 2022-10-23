import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { assert } from 'chai';
import { Cube } from '../target/types/cube';
import { find_pda, fund, get_nth_cube } from './utils';

describe(`cube`, () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Cube as Program<Cube>;

    // Users
    const cuber: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const sponsor: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    // Sponsor info
    let sponsorData: anchor.web3.PublicKey;
    const sponsorName = `Guido & co.`;
    const sponsorDesc = `Visit us at http://fake.domain.com/`;

    // Challenge
    let cube: anchor.web3.PublicKey;
    let cube2: anchor.web3.PublicKey;
    const CUBE_SIZE: number = 8 + 2 * (1 * 8) + 2 * (1 * 12);
    const PRIZE = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

    // R' U' F R' B' L2 F2 L D2 L D2 R' B2 D F2 R2 D2 R U B F' U' R U2 L' D' U' R' U' F
    // Solution: D F' L' F U B' U2 F D2 L D2 R2 L2 F2 D L2 F2 U' R2 F2 B2 D'
    let scrambledCube: anchor.IdlTypes<Cube> = {
        co: [0, 2, 0, 0, 2, 1, 2, 2],
        cp: [3, 5, 6, 2, 4, 8, 7, 1],
        eo: [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1],
        ep: [5, 4, 6, 8, 11, 12, 3, 2, 7, 9, 1, 10],
    };

    before(async () => {
        // Fund accounts
        await fund(provider.connection, cuber.publicKey);
        await fund(provider.connection, sponsor.publicKey);

        // Derive sponsor data address
        sponsorData = await find_pda(
            [`SPONSOR`, sponsor.publicKey, sponsorName],
            program.programId
        );

        // Derive Cube address
        cube = await get_nth_cube(program.programId, sponsorData, 0);
        cube2 = await get_nth_cube(program.programId, sponsorData, 1);
    });

    it(`Can peek a cube`, async () => {
        // Call method and grab return
        const peekedCube = (await program.methods
            .peekCube(
                `R' U' F R' B' L2 F2 L D2 L D2 R' B2 D F2 R2 D2 R U B F' U' R U2 L' D' U' R' U' F`
            )
            .accounts({})
            .view()) as anchor.IdlTypes<Cube>;

        assert.deepEqual(peekedCube, scrambledCube);
    });

    it(`Creates scrambled cube`, async () => {
        // Call method
        const sponsor_BALANCE_I: number = await provider.connection.getBalance(
            sponsor.publicKey
        );

        await program.methods
            .initCube(sponsorName, sponsorDesc, scrambledCube, PRIZE)
            .accounts({ sponsor: sponsor.publicKey, sponsorData, cube })
            .signers([sponsor])
            .rpc();

        // Check if scrambled cube was created correctly
        let scrambledCube_struct = await program.account.cube.fetch(cube);
        assert.deepEqual(scrambledCube_struct, scrambledCube);

        // Check that prize is locked in cube (+ Rent lamports)
        const sponsor_BALANCE_F: number = await provider.connection.getBalance(
            sponsor.publicKey
        );
        const CUBE_BALANCE: number = await provider.connection.getBalance(cube);

        assert.isBelow(sponsor_BALANCE_F, sponsor_BALANCE_I);
        assert.equal(
            CUBE_BALANCE,
            (await provider.connection.getMinimumBalanceForRentExemption(
                CUBE_SIZE
            )) +
                1 * anchor.web3.LAMPORTS_PER_SOL
        );

        // Check sponsor data
        let sponsorData_struct = await program.account.sponsor.fetch(
            sponsorData
        );
        assert.equal(
            sponsorData_struct.owner.toBase58(),
            sponsor.publicKey.toBase58()
        );
        assert.equal(sponsorData_struct.name, sponsorName);
        assert.equal(sponsorData_struct.desc, sponsorDesc);
        assert.ok(sponsorData_struct.challengesCreated.eq(new anchor.BN(1)));
        assert.ok(sponsorData_struct.totalFund.eq(PRIZE));
    });

    it(`Creates another scrambled cube`, async () => {
        // Call method
        const sponsor_BALANCE_I: number = await provider.connection.getBalance(
            sponsor.publicKey
        );

        await program.methods
            .initCube(sponsorName, sponsorDesc, scrambledCube, PRIZE)
            .accounts({ sponsor: sponsor.publicKey, cube: cube2, sponsorData })
            .signers([sponsor])
            .rpc();

        // Check if scrambled cube was created correctly
        let scrambledCube_struct = await program.account.cube.fetch(cube2);
        assert.deepEqual(scrambledCube_struct, scrambledCube);

        // Check that prize is locked in cube (+ Rent lamports)
        const sponsor_BALANCE_F: number = await provider.connection.getBalance(
            sponsor.publicKey
        );
        const CUBE_BALANCE: number = await provider.connection.getBalance(
            cube2
        );

        assert.isBelow(sponsor_BALANCE_F, sponsor_BALANCE_I);
        assert.equal(
            CUBE_BALANCE,
            (await provider.connection.getMinimumBalanceForRentExemption(
                CUBE_SIZE
            )) +
                1 * anchor.web3.LAMPORTS_PER_SOL
        );

        // Check sponsor data
        let sponsorData_struct = await program.account.sponsor.fetch(
            sponsorData
        );
        assert.equal(
            sponsorData_struct.owner.toBase58(),
            sponsor.publicKey.toBase58()
        );
        assert.equal(sponsorData_struct.name, sponsorName);
        assert.equal(sponsorData_struct.desc, sponsorDesc);
        assert.ok(sponsorData_struct.challengesCreated.eq(new anchor.BN(2)));
        assert.ok(sponsorData_struct.totalFund.eq(PRIZE.mul(new anchor.BN(2))));
    });

    it(`Reverts if sponsor name or desc are too long`, async () => {
        try {
            const longName = `aaaaaaaaaabbbbbbbbbbccccccccccd`;
            const longSponsor = await find_pda(
                [`SPONSOR`, sponsor.publicKey, longName],
                program.programId
            );

            const accounts = {
                sponsor: sponsor.publicKey,
                sponsorData: longSponsor,
                cube: await get_nth_cube(program.programId, longSponsor, 0),
            };

            await program.methods
                .initCube(longName, sponsorDesc, scrambledCube, PRIZE)
                .accounts(accounts)
                .signers([sponsor])
                .rpc();

            assert.fail(`Should fail!`);
        } catch (error) {
            assert.equal(error.error.errorCode.code, `SponsorNameTooLong`);
        }

        try {
            await program.methods
                .initCube(
                    sponsorName,
                    `aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggggggggggh`,
                    scrambledCube,
                    PRIZE
                )
                .accounts({ sponsor: sponsor.publicKey })
                .signers([sponsor])
                .rpc();

            assert.fail(`Should fail!`);
        } catch (error) {
            assert.equal(error.error.errorCode.code, `SponsorDescTooLong`);
        }
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
