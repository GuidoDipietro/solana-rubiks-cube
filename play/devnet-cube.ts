import { CubeSDK } from '../client/cube-client';

const main = async () => {
    const programSDK = new CubeSDK();

    // Add your code here on:

    const cube = await programSDK.peekCube(
        `R'`,
        `E3pySgNcQ1e4U6fD1oUxt5VCytSu7Q2W5zAYLcVK5gXG`
    );
    console.log(`\n\nPeeked cube: `, cube);

    console.log(`\n\nSponsors: `, await programSDK.getSponsors());
    console.log(`\n\nChallenges: `, await programSDK.getChallenges());
    console.log(`\n\nWinners: `, await programSDK.getWinners());

    await programSDK.trySolution(
        `E3pySgNcQ1e4U6fD1oUxt5VCytSu7Q2W5zAYLcVK5gXG`,
        `R U R' U'`
    );
};

main().then(() => console.log(`Program finished`));
