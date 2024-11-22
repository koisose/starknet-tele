import ky from 'ky';

export async function fetchTransactions(initiator_address: string) {
  const response=await ky.get(`https://sepolia.voyager.online/api/txns?to=${initiator_address}&ps=10&p=1&type=null`).json()
  return response
  
}
export async function fetchBalance(initiator_address: string) {
  const response=await ky.get(`https://sepolia.voyager.online/api/contract/${initiator_address}/token-balances`).json()
  return response
  
}
export async function fetchTransactionByHash(hash: string) {
  const response = await ky.get(`https://sepolia.voyager.online/api/txn/${hash}`).json()
  return response
}
export async function fetchTransactionByHashTrace(hash: string) {
  const response = await ky.get(`https://sepolia.voyager.online/api/txn/${hash}/trace`).json()
  return response
}
//https://sepolia.api.avnu.fi/v1/starknet/tokens?search=usdc&page=0&size=1&sort=string
export async function fetchToken(token: string) {
  const response = await ky.get(`https://sepolia.api.avnu.fi/v1/starknet/tokens?search=${token}&page=0&size=1&sort=string`).json()
  return response
}
//https://sepolia.api.avnu.fi/swap/v2/prices?sellTokenAddress=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&buyTokenAddress=0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080&sellAmount=0xDE0B6B3A7640000
export async function fetchPrice(sellTokenAddress: string, buyTokenAddress: string, sellAmount: string) {
  const response = await ky.get(`https://sepolia.api.avnu.fi/swap/v2/quotes?sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}&sellAmount=${sellAmount}`).json()
  return response
}
//https://sepolia.api.avnu.fi/v1/starknet/tokens/0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080
export async function fetchTokenByAddress(token: string) {
  const response = await ky.get(`https://sepolia.api.avnu.fi/v1/starknet/tokens/${token}`).json()
  return response
}

//https://sepolia.api.avnu.fi/swap/v2/tokens?page=0&size=20
export async function fetchTokens() {
  const response = await ky.get(`https://sepolia.api.avnu.fi/swap/v2/tokens?page=0&size=20`).json()
  return response
}