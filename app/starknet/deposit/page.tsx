'use client'

import { Button } from "~~/components/ui/button"
import { Card } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select"
import { ArrowDownUp } from 'lucide-react'
import Image from "next/image"
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react"
import ky from 'ky'
import { notification } from "~~/utils/scaffold-eth";
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
export default function Component() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const value = searchParams.get("value");
  const chatId = searchParams.get("chatId")
  const [userAddress, setUserAddress] = useState(address || "")
  const [userValue, setUserValue] = useState(value || 0)
  
  
  
  return (
    <div className="min-h-screen bg-[#1a1b3b] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#242456] border-none text-white">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Deposit</h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-xs text-blue-400">How much</div>
           
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-[#1a1b3b] border-none text-2xl p-4"
                  value={userValue}
                onChange={(e) => setUserValue(e.target.value)}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-24 bg-[#1a1b3b] border-none p-2 text-center">
                  ETH
                </div>
              </div>
            </div>

   

            <div className="space-y-4">
              <div className="text-xs text-blue-400">TO</div>
              <div className="flex items-center gap-2">
              <Input
                
                  placeholder="Wallet address"
                  className="bg-transparent border-black-800 focus-visible:ring-zinc-700 text-white"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full bg-[#ff5d2e] hover:bg-[#ff4d1e] text-white">
              Connect Ethereum Wallet
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}