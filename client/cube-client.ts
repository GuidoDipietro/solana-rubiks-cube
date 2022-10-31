import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Cube } from '../target/types/cube';
import { Sponsor } from './types';

export class CubeSDK {
    program: Program<Cube>;
    provider: anchor.AnchorProvider;

    constructor() {
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

        // Set provider
        this.provider = provider;

        // Read program IDL from filesystem + instantiate from Devnet pubkey
        this.program = new Program<Cube>(
            JSON.parse(
                require(`fs`).readFileSync(`target/idl/cube.json`, `utf-8`)
            ),
            `8svjuExT5ko3asB3zJjcajE8LJ5pvjcJpc3njWAKu6dK`
        );
    }

    // Instructions and useful wrappers

    /**
     * init_cube instruction
     * Initializes a challenge (scrambled cube) and creates
     * sponsor data that is stored on-chain.
     *
     * @param sponsor Sponsor name and description
     * @param cube Cube arrays identifying a scramble
     * @param prize Prize to lock in this challenge (in lamports)
     * @returns Transaction signature promise
     */
    initCube = async (
        sponsor: Sponsor,
        cube: anchor.IdlTypes<Cube>,
        prize: number
    ): Promise<string> => {
        const sponsorDataPubkey = this.getSponsorDataPubkey(sponsor.name);
        const sponsorStruct = await this.program.account.sponsor.fetchNullable(
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
                sponsorData: this.getSponsorDataPubkey(sponsor.name),
                cube: this.getNthCubePubkey(sponsor.name, cubeNumber),
            })
            .rpc();

        console.log(
            `Initialized a cube at address ${this.getNthCubePubkey(
                sponsor.name,
                cubeNumber
            ).toBase58()}`
        );
        return txSig;
    };

    /**
     * init_cube instruction with a more friendly interface
     * Initializes a challenge (scrambled cube) and creates
     * sponsor data that is stored on-chain, using a cubeScamble as initial state.
     *
     * @param sponsor Sponsor name and description
     * @param cubeScramble Scramble for the challenge in WCA notation
     * @param prize Prize to lock in this challenge (in lamports)
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
     * @param challenge Public key of the existing challenge
     * @param moves Solution for the challenge in WCA notation
     * @returns Transaction signature promise
     */
    trySolution = async (
        challenge: anchor.web3.PublicKey | string,
        moves: string,
        name: string
    ): Promise<string> => {
        const challengePubkey =
            typeof challenge === `string`
                ? new anchor.web3.PublicKey(challenge)
                : challenge;

        let txSig: string;
        try {
            txSig = await this.program.methods
                .trySolution(moves, name)
                .accounts({
                    cuber: this.provider.wallet.publicKey,
                    cube: challengePubkey,
                })
                .rpc();
        } catch (error) {
            console.log(
                `Program returned error: ${error.error.errorCode.code}`
            );
            return error.error.errorCode.code;
        }

        console.log(`Cube solved successfully!`);
        return txSig;
    };

    /**
     * peek_cube instruction
     * Applies a sequence of moves to a solved cube and returns its array representation.
     *
     * @param moves Sequence of moves in WCA notation
     * @param challenge Optional address of an existing challenge to use as base state
     * @returns CO, CP, EO, EP arrays representing a Rubik's Cube
     */
    peekCube = async (
        moves: string,
        challenge?: anchor.web3.PublicKey | string
    ): Promise<anchor.IdlTypes<Cube>> => {
        // Add challenge as remaining account, if any
        let remainingAccounts: anchor.web3.AccountMeta[] = [];

        if (challenge != null) {
            const challengePubkey =
                typeof challenge === `string`
                    ? new anchor.web3.PublicKey(challenge)
                    : challenge;

            remainingAccounts.push({
                pubkey: challengePubkey,
                isSigner: false,
                isWritable: false,
            });
        }

        const cubeArrays = await this.program.methods
            .peekCube(moves)
            .accounts({})
            .remainingAccounts(remainingAccounts)
            .view();

        return cubeArrays;
    };

    // Other stuff

    getNthCubePubkey = (
        name: string,
        nth: number | anchor.BN,
        sponsor: anchor.web3.PublicKey | string = this.provider.wallet.publicKey
    ): anchor.web3.PublicKey => {
        const sponsorDataPubkey = this.getSponsorDataPubkey(name, sponsor);

        const [cubePubkey] = findProgramAddressSync(
            [
                Buffer.from(`CUBE`),
                sponsorDataPubkey.toBuffer(),
                new anchor.BN(nth).toArrayLike(Buffer, `le`, 8),
            ],
            this.program.programId
        );
        return cubePubkey;
    };

    getSponsorDataPubkey = (
        name: string,
        sponsor: anchor.web3.PublicKey | string = this.provider.wallet.publicKey
    ): anchor.web3.PublicKey => {
        const sponsorPubkey =
            typeof sponsor === `string`
                ? new anchor.web3.PublicKey(sponsor)
                : sponsor;

        const [sponsorDataPubkey] = findProgramAddressSync(
            [
                Buffer.from(`SPONSOR`),
                sponsorPubkey.toBuffer(),
                Buffer.from(name),
            ],
            this.program.programId
        );
        return sponsorDataPubkey;
    };

    getChallenges = async () => {
        return (await this.program.account.cube.all()).map((challenge) => {
            return {
                pubkey: challenge.publicKey.toBase58(),
                cube: {
                    co: `${challenge.account.co}`,
                    cp: `${challenge.account.cp}`,
                    eo: `${challenge.account.eo}`,
                    ep: `${challenge.account.ep}`,
                },
            };
        });
    };

    getSponsors = async () => {
        return (await this.program.account.sponsor.all()).map((sponsor) => {
            return {
                owner: sponsor.account.owner.toBase58(),
                name: sponsor.account.name,
                desc: sponsor.account.desc,
                challengesCreated: sponsor.account.challengesCreated.toString(),
                totalFund: sponsor.account.totalFund.toString(),
            };
        });
    };

    getWinners = async () => {
        return (await this.program.account.winner.all()).map((winner) => {
            return {
                winner: `${
                    winner.account.name
                } (${winner.account.winner.toBase58()})`,
                challengesWon: winner.account.challengesWon.toString(),
                cashedPrize: winner.account.cashedPrize.toString(),
            };
        });
    };

    getProvider = () => {
        return this.provider;
    };
}
