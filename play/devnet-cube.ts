import { CubeSDK } from '../client/cube-client';

const main = async () => {
    const programSDK = new CubeSDK();

    // Add your code here on:

    const cube = await programSDK.peekCube(
        `R`,
        `B2Z5dpipr4VBAEdHiJz2pkYGwaNhHm19H12k3LNZFSrw`
    );
    console.log(`\n\nPeeked cube: `, cube);

    console.log(`\n\nSponsors: `, await programSDK.getSponsors());
    console.log(`\n\nChallenges: `, await programSDK.getChallenges());
    console.log(`\n\nWinners: `, await programSDK.getWinners());

    await programSDK.trySolution(
        `B2Z5dpipr4VBAEdHiJz2pkYGwaNhHm19H12k3LNZFSrw`,
        `R F R' U2 L' D`,
        `Your Name`
    );
};

main().then(() => console.log(`Program finished`));
