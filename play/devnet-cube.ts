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
        `BdiFbgf1VAEydfc4q8R795re34SPeWymZzLR7ZAhbAUq`,
        `R F R' D2`,
        `Your Name`
    );
};

main().then(() => console.log(`Program finished`));
