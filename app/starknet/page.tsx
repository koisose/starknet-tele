'use client'
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu"
import Image from "next/image"
import { connect,disconnect } from 'get-starknet';
import { WalletAccount,Contract, RpcProvider, constants } from 'starknet';
import { Provider, Call, validateAndParseAddress,CallData,cairo } from 'starknet'
import { toBigInt, toNumber } from 'ethers'
import { ABI as ethABI } from '~~/abi/eth-starknet-sepolia'
import { ABI as strkABI } from '~~/abi/strk-starknet-sepolia'
import { useSearchParams } from "next/navigation";
import ky from 'ky'
import { notification } from "~~/utils/scaffold-eth";
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

  // Call the contract to extract the decimals used in the balance
  const decimalCall: Call = {
      contractAddress: ethTokenContract,
      entrypoint: 'decimals',
  };
  const decimalResponse = await provider.callContract(decimalCall);

  // Calculate the actual balance
  const decimals = parseInt(decimalResponse[0].toString(), 16);
  const balance = parseInt(balanceResponse[0].toString(), 16) * 10 ** -decimals;

  return balance;
}
async function parseWei( contract: string,amount:string): Promise<number> {
  const provider = new Provider({
      nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
  });

  

  const ethTokenContract = contract;
  

  // Call the contract to extract the decimals used in the balance
  const decimalCall: Call = {
      contractAddress: ethTokenContract,
      entrypoint: 'decimals',
  };
  const decimalResponse = await provider.callContract(decimalCall);

  // Calculate the actual balance
  const decimals = parseInt(decimalResponse[0].toString(), 16);
  const balance = Number(amount) * 10 ** decimals;

  return balance;
}
const postData = async (url:any,data:any) => {
  try {
    const response = await ky.post(url, { json: data, timeout: 100000 });
    const result = await response.json();
    console.log('Data posted successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to post data:', error);
    throw error;
  }
}
export default function Component() {
  const myFrontendProviderUrl = 'https://free-rpc.nethermind.io/sepolia-juno/v0_7';
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const recipientAddress = searchParams.get("recipientAddress") || '';
  const amountToSend = searchParams.get("amountToSend") || 0;
  const symbol = searchParams.get("symbol") || "ETH";
  const [selectedToken, setSelectedToken] = useState(symbol)
  const [amount, setAmount] = useState(amountToSend)
  const [address, setAddress] = useState(recipientAddress)
  const [connected,setConnected]=useState(false)
  const [eth,setEth]=useState(0)
  const [strk,setStrk]=useState(0)
  
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
   
      setAmount(value)
   
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Card className="max-w-md mx-auto bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <p className="text-zinc-400 text-sm">You&apos;re sending</p>
              <div className="py-8"> {/* Removed text-center */}
                <div className="relative w-full">
                  <Input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="text-5xl text-white font-medium bg-transparent border-none text-right pr-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="0"
                  />
             
                </div>
                <div className="text-zinc-400 mt-2">
                  {amount || '0'} {selectedToken}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-500">
                      <Image
                        src={`/${selectedToken.toLowerCase()}.png`}
                        alt="Selected Token"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white">{selectedToken}</span>
                    <span className="text-zinc-400 text-sm">Balance: {selectedToken==="ETH"?eth:strk}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-zinc-900 border-zinc-800">
                <DropdownMenuItem onClick={() => setSelectedToken('ETH')}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-500">
                      <Image
                        src="/eth.png"
                        alt="ETH"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white">ETH</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedToken('STRK')}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-green-500">
                      <Image
                        src="/strk.png"
                        alt="STRK"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white">STRK</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">To</label>
                <Input
                value={address}
                  placeholder="Wallet address"
                  className="bg-transparent border-zinc-800 focus-visible:ring-zinc-700 text-white"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {connected && <Button onClick={async()=>{
                  const selectedWalletSWO = await connect();
            
                  const ethAddress="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
                  const strkAddress="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
            
                  console.log(amount)
                  console.log((await parseWei(selectedToken==="ETH"?ethAddress:strkAddress,amount as string)))
                  //@ts-ignore
                  const result = await selectedWalletSWO.account.execute({
                    contractAddress:selectedToken==="ETH"?ethAddress:strkAddress,
                    entrypoint: 'transfer', // Name of the function you want to call
                    calldata: CallData.compile({
                      recipient: address,
                      amount: cairo.uint256(toBigInt((await parseWei(selectedToken==="ETH"?ethAddress:strkAddress,amount as string)))),
                    }), // Arguments for the function call
                   });
                   console.log(result)
                   notification.success(
                    <span className="text-white">"Transaction completed successfully! check your telegram for receipt "</span>,
                    {
                      icon: "🎉",
                      duration:30000
                    },
                  );
                   const data=await postData('/api/sendmessage',{chatId,text:`Congrats on sending ${amount} ${selectedToken} to ${address.slice(0,5)}...${address.slice(-5)} here's the receipt https://sepolia.voyager.online/tx/${result.transaction_hash}`})
                   console.log(data)
                   
               //{transaction_hash: '0x76833d64785a58b2312845c1090608ee28450ce20fbeb05aaa64c0ae14aacc6'}
                  const ethBalance = await getBalance(address as string, "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
const strkBalance = await getBalance(address as string, "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d")
setEth(ethBalance)
setStrk(strkBalance)
              }} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                SEND
              </Button>}
              {!connected && <Button onClick={async()=>{
const selectedWalletSWO = await connect();
//@ts-ignore
setConnected(selectedWalletSWO?.isConnected)
const address=selectedWalletSWO?.selectedAddress;
const ethBalance = await getBalance(address as string, "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
const strkBalance = await getBalance(address as string, "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d")
setEth(ethBalance)
setStrk(strkBalance)
              }} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Connect wallet
              </Button>}
              {connected && <Button onClick={async()=>{
const selectedWalletSWO = await disconnect({ clearLastWallet: true });
//@ts-ignore
setConnected(selectedWalletSWO?.isConnected)
setEth(0)
setStrk(0)
              }} className="w-full bg-red-600 hover:bg-red-700 text-white">
                Disconnect wallet
              </Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}