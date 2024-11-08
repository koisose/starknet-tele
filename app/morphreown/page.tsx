"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation";
import ky from 'ky'
import { useAppKit, useAppKitAccount, useDisconnect, useAppKitNetwork, useAppKitEvents } from '@reown/appkit/react'
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
const getData = async (url: any) => {
  try {
    const response = await ky.post(url, { timeout: 100000 });
    const result = await response.json();
    console.log('Data posted successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to post data:', error);
    throw error;
  }
}
export default function Component() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [vectorData, setVectorData] = useState([])
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams();
  const tgId = searchParams.get("tg_id");
  const events = useAppKitEvents()
  const { open, close } = useAppKit()
  const { address, isConnected, caipAddress, status } = useAppKitAccount()
  const { caipNetwork, caipNetworkId, chainId, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const handleSubmit = () => {

    console.log(events)
    console.log("dsasdasa")
  }

  const handleConfirm = () => {
    // Here you would typically handle the actual submission
    console.log("URL submitted:", urlInput)
    setIsModalOpen(false)
    setUrlInput("")
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex justify-center items-center h-screen">
       {!isConnected && <button onClick={() => open({ view: 'Connect' })} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Connect wallet
        </button>}
        <w3m-button />
      </div>
    </div>
  )
}