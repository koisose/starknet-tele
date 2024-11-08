import { Provider, Call, validateAndParseAddress } from 'starknet'
import { toBigInt, toNumber } from 'ethers'
async function getBalance(address: string, contract: string): Promise<number> {
  const provider = new Provider({
      nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
  });

  // Validate the Starknet address
  if (!address || !address.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error("not a starknet address")
  }

  const ethTokenContract = contract;
  const accountContract = toBigInt(address).toString();

  // Call the contract to get the account's balance
  const balanceCall: Call = {
      contractAddress: ethTokenContract,
      entrypoint: 'balanceOf',
      calldata: [accountContract],
  };
  const balanceResponse = await provider.callContract(balanceCall);
console.log(parseInt(balanceResponse[0].toString(), 16))
  // Call the contract to extract the decimals used in the balance
  const decimalCall: Call = {
      contractAddress: ethTokenContract,
      entrypoint: 'decimals',
  };
  const decimalResponse = await provider.callContract(decimalCall);

  // Calculate the actual balance
  const decimals = parseInt(decimalResponse[0].toString(), 16);
  const balance = parseInt(balanceResponse[0].toString(), 16) * 10 ** -decimals;
console.log("pongki",0.025* 10 ** decimals)
  return balance;
}
const ethBalance = await getBalance("0x00fb75ec33b0f6e8664273511cfd7b6eec0763e99d0b6980a95263f077c7e1c0", "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
console.log(ethBalance)