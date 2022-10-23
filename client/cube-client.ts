import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Cube } from '../target/types/cube';
import { Sponsor } from './types';

export class CubeSDK {
    program: Program<Cube>;
    provider: anchor.AnchorProvider;

    constructor(program: Program<Cube>, provider: anchor.AnchorProvider) {
        this.program = program;
        this.provider = provider;
    }

    // Instructions and useful wrappers

    /**
     * init_cube instruction
     * Initializes a challenge (scrambled cube) and creates
     * sponsor data that is stored on-chain.
     *
     * @param sponsor Sponsor name and description
     * @param cube Cube arrays identifying a scramble
     * @param prize Prize to lock in this challenge
     * @returns Transaction signature promise
     */
    initCube = async (
        sponsor: Sponsor,
        cube: anchor.IdlTypes<Cube>,
        prize: number
    ): Promise<string> => {
        const sponsorDataPubkey = this.getSponsorDataPubkey(
            this.provider.wallet.publicKey,
            sponsor.name
        );
        const sponsorStruct = await this.program.account.sponsor.fetch(
            sponsorDataPubkey
        );

        const cubeNumber =
            sponsorStruct === null
                ? new anchor.BN(0)
                : sponsorStruct.challengesCreated;

        const txSig = await this.program.methods
            .initCube(
                sponsor.name,
                sponsor.description,
                cube,
                new anchor.BN(prize)
            )
            .accounts({
                sponsor: this.provider.wallet.publicKey,
                sponsorData: this.getSponsorDataPubkey(
                    this.provider.wallet.publicKey,
                    sponsor.name
                ),
                cube: this.getNthCubePubkey(sponsorDataPubkey, cubeNumber),
            })
            .rpc();

        return txSig;
    };

    /**
     * init_cube instruction with a more friendly interface
     * Initializes a challenge (scrambled cube) and creates
     * sponsor data that is stored on-chain, using a cubeScamble as initial state.
     *
     * @param sponsor Sponsor name and description
     * @param cubeScramble Scramble for the challenge in WCA notation
     * @param prize Prize to lock in this challenge
     * @returns Transaction signature promise
     */
    initCubeWithScramble = async (
        sponsor: Sponsor,
        cubeScramble: string,
        prize: number
    ): Promise<string> => {
        const cubeArrays = await this.program.methods
            .peekCube(cubeScramble)
            .accounts({})
            .view();

        return this.initCube(
            sponsor,
            cubeArrays as anchor.IdlTypes<Cube>,
            prize
        );
    };

    /**
     * try_solution instruction
     * Applies a sequence of moves to an existing challenge trying to beat it.
     *
     * @param challengePubkey Public key of the existing challenge
     * @param moves Solution for the challenge in WCA notation
     * @returns Transaction signature promise
     */
    trySolution = async (
        challengePubkey: anchor.web3.PublicKey,
        moves: string
    ): Promise<string> => {
        const txSig = await this.program.methods
            .trySolution(moves)
            .accounts({
                cuber: this.provider.wallet.publicKey,
                cube: challengePubkey,
            })
            .rpc();

        return txSig;
    };

    /**
     * peek_cube instruction
     * Applies a sequence of moves to a solved cube and returns its array representation.
     *
     * @param moves Sequence of moves in WCA notation
     * @returns CO, CP, EO, EP arrays representing a Rubik's Cube
     */
    peekCube = async (moves: string): Promise<anchor.IdlTypes<Cube>> => {
        const cubeArrays = await this.program.methods
            .peekCube(moves)
            .accounts({})
            .view();

        return cubeArrays;
    };

    // Other stuff

    getNthCubePubkey = (
        sponsor: anchor.web3.PublicKey,
        nth: number | anchor.BN
    ): anchor.web3.PublicKey => {
        const [cubePubkey] = findProgramAddressSync(
            [
                Buffer.from(`CUBE`),
                sponsor.toBuffer(),
                new anchor.BN(nth).toArrayLike(Buffer, `le`, 8),
            ],
            this.program.programId
        );
        return cubePubkey;
    };

    getSponsorDataPubkey = (
        sponsor: anchor.web3.PublicKey,
        name: string
    ): anchor.web3.PublicKey => {
        const [sponsorDataPubkey] = findProgramAddressSync(
            [Buffer.from(`SPONSOR`), sponsor.toBuffer(), Buffer.from(name)],
            this.program.programId
        );
        return sponsorDataPubkey;
    };
}
