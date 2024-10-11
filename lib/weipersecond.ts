const ethers = require('ethers');

const ethxPerMonth = ethers.utils.parseEther("1"); // 1 ETHx
const secondsInMonth = (365 / 12) * 24 * 60 * 60;

const weiPerSecond = ethxPerMonth.div(secondsInMonth);

console.log(weiPerSecond.toString()); // Outputs: 3805175038052