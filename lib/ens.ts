// Import viem transport, viem chain, and ENSjs
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { createEnsPublicClient } from '@ensdomains/ensjs'

// Create the client
const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
})
export function searchENS(name:string){
    const ethAddress = client.getAddressRecord({ name })
    return ethAddress
}
// Use the client
