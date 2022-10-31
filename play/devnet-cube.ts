import { CubeSDK } from '../client/cube-client';

const main = async () => {
    const programSDK = new CubeSDK();

    // Add your code here on:

    const cube = await programSDK.peekCube(`R`);
    console.log(`\n\nPeeked cube: `, cube);

    console.log(`\n\nSponsors: `, await programSDK.getSponsors());
    console.log(`\n\nChallenges: `, await programSDK.getChallenges());
    console.log(`\n\nWinners: `, await programSDK.getWinners());

    await programSDK.trySolution(
        `6Cmr6cmhyZQGsQCGSUDpecyFMZezmJz5NJtPBaicb1AK`,
        `R F R' D2 D2 R F' R'`,
        `Your Name`
    );
};

main().then(() => console.log(`Program finished`));
