"use client"

import { Button } from "~~/components/ui/button"
import { Card, CardContent } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { connect, disconnect } from 'get-starknet';
import { WalletAccount, Contract, RpcProvider, constants } from 'starknet';
import { Provider, Call, validateAndParseAddress, CallData, cairo } from 'starknet'
import { toBigInt, toNumber } from 'ethers'
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation";
import ky from 'ky'
import { notification } from "~~/utils/scaffold-eth";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchPrice, fetchTokenByAddress } from '~~/apa/starknet'
function numberToHex(num: any, addPrefix = true, minLength = 0) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Input must be a valid number.');
  }
  let hex = num.toString(16).toUpperCase();
  if (minLength > 0) {
    hex = hex.padStart(minLength, '0');
  }
  return addPrefix ? `0x${hex}` : hex;
}
async function decimalBalance(amount: number, contract: string): Promise<number> {
  const provider = new Provider({
    nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
  });



  // Call the contract to extract the decimals used in the balance
  const decimalCall: Call = {
    contractAddress: contract,
    entrypoint: 'decimals',
  };
  const decimalResponse = await provider.callContract(decimalCall);

  // Calculate the actual balance
  const decimals = parseInt(decimalResponse[0].toString(), 16);
  const balance = parseFloat(amount as any) * 10 ** decimals;

  return balance;
}
async function realBalance(amount: number, contract: string): Promise<number> {
  const provider = new Provider({
    nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
  });



  // Call the contract to extract the decimals used in the balance
  const decimalCall: Call = {
    contractAddress: contract,
    entrypoint: 'decimals',
  };
  const decimalResponse = await provider.callContract(decimalCall);

  // Calculate the actual balance
  const decimals = parseInt(decimalResponse[0].toString(), 16);
  const balance = parseInt(amount as any, 16) * 10 ** -decimals;

  return balance;
}
const postData = async (url: any, data: any) => {
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
function truncateDecimals(number:any, decimals:any) {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(number * multiplier) / multiplier;
}
export default function CryptoExchange() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const tokenFrom = searchParams.get("tokenFrom");
  const tokenTo = searchParams.get("tokenTo");
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [amount1, setAmount1] = useState(amount)
  const [tokenFrom1, setTokenFrom1] = useState(tokenFrom)
  const [tokenTo1, setTokenTo1] = useState(tokenTo)
  const [loading, setLoading] = useState(false)
  const [toAmount, setToAmount] = useState(0)
  const [balanceFrom, setBalanceFrom] = useState(0)
  const [balanceTo, setBalanceTo] = useState(0)
  const chatId = searchParams.get("chatId");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [tokenFrom, tokenTo, amount1],
    queryFn: async () => {
      const theValue = await decimalBalance(amount1 as any, tokenFrom1 as any)
      const final = await fetchPrice(tokenFrom1 as string, tokenTo1 as string, numberToHex(theValue as any))
      const amo = await realBalance((final as any)[0].buyAmount, tokenTo1 as any)
      return { amo, final }
    },

  })

  const { data: dataTokenFrom, refetch: refetchTokenFrom, isLoading: isLoadingTokenFrom } = useQuery({
    queryKey: [tokenFrom],
    queryFn: () => fetchTokenByAddress(tokenFrom as string),

  })
  const { data: dataTokenTo, refetch: refetchTokenTo, isLoading: isLoadingTokenTo } = useQuery({
    queryKey: [tokenTo],
    queryFn: () => fetchTokenByAddress(tokenTo as string),

  })

  useEffect(() => {
    if (amount1) {
      refetch();
    }

  }, [amount1, address]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-lg mb-2 text-lg font-semibold text-gray-700">
        Swap using Avnu
      </div>


      <Card className="w-full max-w-lg p-4">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              disabled={loading}
              type="number"
              className="w-1/3"
              value={amount1 as any}
              onChange={(e) => {
                setAmount1(e.target.value);

              }}
            />
            {!isLoadingTokenFrom as any && <div className="w-24 text-center text-gray-700">{(dataTokenFrom as any).symbol}</div>}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            {/* @ts-ignore */}
            <span>≈ ${!isLoading && data?.final[0].sellAmountInUsd.toFixed(2)}</span>
            <span>Balance {balanceFrom}</span>
          </div>


          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{!isLoading && data?.amo.toFixed(6)}</span>
            {!isLoadingTokenTo as any && <div className="w-24 text-center text-gray-700">{(dataTokenTo as any).symbol}</div>}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            {/* @ts-ignore */}
            <span>≈ ${!isLoading && data?.final[0].buyAmountInUsd?.toFixed(2)} <span className={`text-${parseFloat(data?.final[0].priceRatioUsd)<0?"red":"green"}-600`}>({(parseFloat(data?.final[0].priceRatioUsd) / 100).toFixed(2)}%)</span></span>
            <span>Balance {balanceTo}</span>
          </div>

        </CardContent>
      </Card>
      <Button className="w-full max-w-lg bg-gray-600 hover:bg-gray-700 text-white mt-2"
        onClick={() => {
          window.open(`https://app.avnu.fi/en?mode=simple&tokenFrom=${tokenFrom}&tokenTo=${tokenTo}&amount=${amount1}`, "_blank");
        }}
      >
        Source
      </Button>
      {!connected && <Button disabled={loading} onClick={async () => {
        setLoading(true)
        const selectedWalletSWO = await connect();
        //@ts-ignore
        setConnected(selectedWalletSWO?.isConnected)
        const address = selectedWalletSWO?.selectedAddress;
        const data = await postData('/api/balance', { address })
        const allBalance=(data as any).erc20TokenBalances
        const balanceFrom1 = allBalance.filter((b: any) => b.address.toString().replace('0x0', '0x') === tokenFrom as any)
        const balanceTo1 = allBalance.filter((b: any) => b.address.toString().replace('0x0', '0x') === tokenTo)
        
        if(balanceFrom1.length>0){
          //@ts-ignore
          setBalanceFrom(truncateDecimals(parseFloat(balanceFrom1[0].formattedBalance),2))
        }
        if(balanceTo1.length>0){
          //@ts-ignore
          setBalanceTo(truncateDecimals(parseFloat(balanceTo1[0].formattedBalance),2))
        }
        // console.log(data)
        setLoading(false)
      }} className="w-full max-w-lg bg-blue-600 hover:bg-blue-700 text-white mt-2">
        Connect wallet
      </Button>}
      {connected && <Button disabled={loading} onClick={async () => {
        const selectedWalletSWO = await disconnect({ clearLastWallet: true });
        //@ts-ignore
        setConnected(selectedWalletSWO?.isConnected)
      }} className="mt-2 w-full max-w-lg bg-red-100 text-blue-600 hover:bg-red-200" variant="ghost">
        Disconnect Wallet
      </Button>}
      {connected && <Button disabled={loading} onClick={async () => {
        const selectedWalletSWO = await connect();
        const theValue = await decimalBalance(amount1 as any, tokenFrom as any)
        const final = await fetchPrice(tokenFrom as string, tokenTo as string, numberToHex(theValue as any))
        
        const buildCalldata = await postData('https://sepolia.api.avnu.fi/swap/v2/build', {
          "quoteId": (final as any)[0].quoteId,
          "takerAddress": selectedWalletSWO?.selectedAddress,
          "slippage": 1,
          "includeApprove": true
        })
        try{
          //@ts-ignore
      const result = await selectedWalletSWO.account.execute([...buildCalldata.calls]);
      const hash=result.transaction_hash
      const tokenA=await fetchTokenByAddress(tokenFrom as string)
      const tokenB=await fetchTokenByAddress(tokenTo as string)
      notification.success(
        <span className="text-white">Transaction completed successfully! check your <a className="text-blue-500" href="https://web.telegram.org/k/#@starknetai_bot">telegram</a> for receipt </span>,
        {
          icon: "🎉",
          duration: 30000
        },
      );
      //@ts-ignore
      const data = await postData('/api/sendmessage', { chatId, text: `Congrats on swapping ${amount1 as any} ${tokenA.symbol as string} to ${tokenB.symbol as string} here's the receipt [${result.transaction_hash}](https://sepolia.voyager.online/tx/${result.transaction_hash})` })
        }catch(e){
          //@ts-ignore
          console.log(e.message)
        }
         
      
      }} className="mt-2 w-full max-w-lg bg-blue-100 text-blue-600 hover:bg-blue-200" variant="ghost">
        Swap
      </Button>}
    </div>
  )
}

