import ky from 'ky';

export async function fetchTransactions(initiator_address: string) {


  const response=await ky.get(`https://sepolia.voyager.online/api/contract/${initiator_address}/transfers?ps=10&p=1&type=erc20`).json()
  return response
  
}