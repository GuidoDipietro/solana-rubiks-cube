import * as anchor from '@project-serum/anchor';

export const fund = async (
    conn: anchor.web3.Connection,
    pubkey: anchor.web3.PublicKey,
    fund: number = 50
) => {
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();

    await conn.confirmTransaction(
        {
            signature: await conn.requestAirdrop(
                pubkey,
                fund * anchor.web3.LAMPORTS_PER_SOL
            ),
            blockhash,
            lastValidBlockHeight,
        },
        `confirmed`
    );
};

export const get_nth_cube = async (
    programId: anchor.web3.PublicKey,
    sponsorDataPubkey: anchor.web3.PublicKey,
    nth: number
) => {
    return await find_pda(
        [`CUBE`, sponsorDataPubkey, new anchor.BN(nth).toBuffer('le', 8)],
        programId
    );
};

export const find_pda = async (
    seeds: (string | anchor.web3.PublicKey | Buffer)[],
    programId: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
    const [pda, _] = await anchor.web3.PublicKey.findProgramAddress(
        seeds.map((x) => to_buffer(x)),
        programId
    );

    return pda;
};

const to_buffer = (thing: string | anchor.web3.PublicKey | Buffer): Buffer => {
    if (Buffer.isBuffer(thing)) return thing;
    if (typeof thing === 'string') return Buffer.from(thing);
    return thing.toBuffer();
};
