'use client'
import "@farcaster/auth-kit/styles.css";
import { useState } from 'react'
import { Button } from "~~/components/ui/button"
import { Card } from "~~/components/ui/card"
import { notification } from "~~/utils/scaffold-eth";
import { generateAI, generateImageGaia, imagePrompt as promptImage, uploadArweaveFrontend, saveImageOra } from '~~/apa/gaianet';
import { useSearchParams } from "next/navigation";
import { postComposerCreateCastActionMessage } from "frog/next";
import { useAppKit, useAppKitAccount, useDisconnect, useAppKitNetwork } from '@reown/appkit/react'
import { optimismSepolia } from '@reown/appkit/networks'
import { config } from "~~/services/web3/reownConfig";
import { oraPromptAbi } from '~~/abi/ora'
import { getAccount, simulateContract, writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { formatUnits, parseEther } from 'viem';
import { ethers } from "ethers";
//https://github.com/koisose/ora-ai-jeopardy/blob/main/packages/nextjs/components/0a/page.tsx
const convertBigIntToEther = (bigIntValue: any) => {
  // Format the BigInt value to Ether (18 decimal places)
  const etherValue = formatUnits(bigIntValue, 18);
  return etherValue;
};
async function executeContractFunction(model: 11 | 50, prompt: any) {
  //@ts-ignore
  const result = await readContract(config, {
    address: "0x28989677641b64948ba33023215e3300d8a2c257",
    abi: oraPromptAbi,
    functionName: 'estimateFee',
    args: [model],
    chainId: optimismSepolia.id,
  })
  // return result
  //@ts-ignore
  const { request } = await simulateContract(config, {
    abi: oraPromptAbi,
    address: "0x28989677641b64948ba33023215e3300d8a2c257",
    functionName: 'calculateAIResult',
    args: [
      model,
      prompt
    ],
    value: parseEther(convertBigIntToEther(result)),
    connector
  })
  //@ts-ignore
  const hash = await writeContract(config, request)
  const receipt = await waitForTransactionReceipt(config, {
    hash,
  })
  const event = receipt?.logs?.find(log => {
    // Check if the event is the one you're interested in
    return log.topics[0] === ethers.id("promptRequest(uint256,address,uint256,string)");
  });

  console.log(receipt?.logs)
  // Decode the event data
  const decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
    ["uint256", "address", "uint256", "string"],
    //@ts-ignore
    event.data
  );

  // `decodedEvent[0]` is your requestId
  const requestId = decodedEvent[0];
  return { requestId, hash };

}
async function readAiresult(model: 11 | 50, requestId: any) {
  //@ts-ignore
  const result = await readContract(config, {
    address: "0x28989677641b64948ba33023215e3300d8a2c257",
    abi: oraPromptAbi,
    functionName: 'getAIResult',
    args: [model, requestId],
    chainId: optimismSepolia.id,
  })
  return result


}
function replaceImagePrompt(input: any) {
  // Use regex to remove {"image_prompt": at the beginning and } at the end
  return input.replace(/^\{'image_prompt':/, '').replace(/}$/, '');
}
const { connector } = getAccount(config)
export default function Component() {
  const { open, close } = useAppKit()
  const { address, isConnected, caipAddress, status } = useAppKitAccount()
  const { caipNetwork, caipNetworkId, chainId, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const [selectedCrew, setSelectedCrew] = useState("random");
  const [selectedPick, setSelectedPick] = useState("random");
  const [pickedCastle, setPickedCastle] = useState("");
  const [pickedCrew, setPickedCrew] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [attackReason, setAttackReason] = useState('')
  const [attackReasonHash, setAttackReasonHash] = useState("");
  const [reasonToAttackReceiptId, setReasonToAttackReceiptId] = useState("");
  const [imagePrompt, setImagePrompt] = useState('')
  const [imagePromptHash, setImagePromptHash] = useState("");
  const [imagePromptReceiptId, setImagePromptReceiptId] = useState("");
  const [generatedImage, setGeneratedImage] = useState('')
  const [generatedImageHash, setGeneratedImageHash] = useState("");
  const [generatedImageReceiptId, setGeneratedImageReceiptId] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const fid = searchParams.get("fid");
  const crews = [
    { value: "🏴‍☠️🐺", text: "🏴‍☠️🐺 “The Wolves”" },
    { value: "🏴‍☠️🦂", text: "🏴‍☠️🦂 “The Scorpions”" },
    { value: "🏴‍☠️🐉", text: "🏴‍☠️🐉 “The Dragons”" },
    { value: "🏴‍☠️🦁", text: "🏴‍☠️🦁 “The Lions”" },
    { value: "🏴‍☠️🐍", text: "🏴‍☠️🐍 “The Serpents”" },
    { value: "🏴‍☠️🐌", text: "🏴‍☠️🐌 “The Snails”" },
  ];
  const handleChange = (event: any) => {
    setSelectedCrew(event.target.value); // Update the state with the selected option's value
  };
  const handleChangePick = (event: any) => {
    setSelectedPick(event.target.value); // Update the state with the selected option's value
  };
  // if(!fid){
  //   return "please only use this on farcaster composer action"
  // }

  return (
    <div
      className="min-h-screen bg-cover bg-center p-8 flex flex-col items-center justify-center space-y-8"
      style={{ backgroundImage: 'url(https://uploader.irys.xyz/Hd47kN1C2f9hDftWb6BLS9hm9fRmkbAMUfEKR5F7Tc86)' }}
    >
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6">Farcastles Attack Reason</h1>
        <p className="text-xl text-center mb-6">
          Easily attack north or south castle<br />
          Get reason to attack<br />
          And generative art using ORA AI
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-64">
            <label htmlFor="side" className="block text-sm font-medium leading-6 text-gray-900">
              Pick Side To Attack
            </label>
            <select value={selectedPick}
              onChange={handleChangePick} id="side" className="border rounded-md p-2 bg-white mt-2 block w-full">
              <option value="random">Random</option>
              <option value="north">North</option>
              <option value="south">South</option>

            </select>
          </div>
          <div className="w-64">
            <label htmlFor="crew" className="block text-sm font-medium leading-6 text-gray-900">
              Pick Crew
            </label>
            <select
              id="crew"
              className="border rounded-md p-2 bg-white mt-2 block w-full"
              value={selectedCrew}
              onChange={handleChange}
            >
              <option value="random">Random</option>
              <option value="0">🏴‍☠️🐺 “The Wolves”</option>
              <option value="1">🏴‍☠️🦂 “The Scorpions”</option>
              <option value="2">🏴‍☠️🐉 “The Dragons”</option>
              <option value="3">🏴‍☠️🦁 “The Lions”</option>
              <option value="4">🏴‍☠️🐍 “The Serpents”</option>
              <option value="5">🏴‍☠️🐌 “The Snails”</option>
            </select>
          </div>
        </div>
        {isConnected && <p className="flex justify-center space-x-4 mb-6">address: {address}</p>}
        <div className="flex justify-center space-x-4 mb-6">

          {isConnected && optimismSepolia.id !== chainId && <Button onClick={() => switchNetwork(optimismSepolia)} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Switch Network
          </Button>}
          {!isConnected && <Button onClick={() => open({ view: 'Connect' })} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Connect wallet
          </Button>}
          {isConnected && optimismSepolia.id === chainId && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            let yourPick = selectedPick
            let yourCrew = selectedCrew
            if (yourPick === "random") {
              const random = ["north", "south"];
              const randomIndex = Math.floor(Math.random() * 2);
              yourPick = random[randomIndex];
              setSelectedPick(yourPick)
            }
            if (yourCrew === "random") {
              const randomIndex = Math.floor(Math.random() * 6);
              yourCrew = crews[randomIndex].text;
              setSelectedCrew(randomIndex.toString())
            } else {
              yourCrew = crews[parseInt(selectedCrew)].text
            }
            console.log(yourPick)
            console.log(yourCrew)
            setPickedCrew(yourCrew)
            setPickedCastle(yourPick)
            const { hash, requestId } = await executeContractFunction(11, `{"instruction":"You're an attack sequence generator there is a war between north and south castle, people can pick which castle they gonna attack by "attacking" data, people can pick what crew they attack with by "crew" data,give them a story on why they should attack their particular castle and how do they attack them from provided data, make it one liner,short, and concise","input":"{'crew':'${yourCrew}','attacking':'${yourPick}'}"}`)
            setAttackReasonHash(hash)
            setReasonToAttackReceiptId(requestId)
            setLoading(false)
          }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Generate Reason
          </Button>}



          {isConnected && <Button onClick={() => disconnect()} disabled={loading} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Disconnect
          </Button>}
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <p className="bg-black text-white px-4 py-2 rounded-md">The castle you attack: {pickedCastle}</p>
          <p className="bg-black text-white px-4 py-2 rounded-md">The crew you pick: {pickedCrew}</p>
        </div>
        {attackReasonHash !== "" && <Card className="mb-4  flex items-center justify-center">
          <b>attack reason hash:</b>
          <a target="_blank" href={`https://sepolia-optimism.etherscan.io/tx/${attackReasonHash}`} className="text-lg font-semibold">{attackReasonHash.substring(0, 10)}</a>
        </Card>}
        {attackReasonHash !== "" && <Card className="p-4 mb-4  flex items-center justify-center">
          {attackReason === "" && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            const a = await readAiresult(11, reasonToAttackReceiptId)
            setAttackReason(a as any)
            setLoading(false)
          }} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Get Reason
          </Button>}
          {attackReason !== "" && <p className="text-lg font-semibold">{attackReason || 'Attack reason'}</p>}
        </Card>}

        <div className="flex justify-center">
          {attackReasonHash !== "" && attackReason !== "" && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            const { hash, requestId } = await executeContractFunction(11, `{"instruction":"based the story data replace [terrain type],[attacking group],[attacking action],[attacking action 2],[defending group],[pick 'north castle attack' or 'south castle attack'], do not change the prompt only replace the bracket, answer in this schema {'image_prompt':'<image_prompt>'} with no explanation whatsoever, only answer in JSON format","input":"{'pick':'${pickedCastle} castle attack','story':'${attackReason}','image_prompt':'${promptImage}'}"}`)
            setImagePromptHash(hash)
            setImagePromptReceiptId(requestId)
            setLoading(false)
          }} className="bg-blue-500 hover:bg-blue-700 mb-4 text-white font-bold py-2 px-4 rounded">
            Generate Image Prompt
          </Button>}
        </div>
        {imagePromptHash !== "" && <Card className="mb-4  flex items-center justify-center">
          <b>image prompt hash:</b>
          <a target="_blank" href={`https://sepolia-optimism.etherscan.io/tx/${imagePromptHash}`} className="text-lg font-semibold">{imagePromptHash.substring(0, 10)}</a>
        </Card>}
        {imagePromptHash !== "" && <Card className="p-4 mb-4  flex items-center justify-center">
          {imagePrompt === "" && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            const a = await readAiresult(11, imagePromptReceiptId)
            // const parsedImage = JSON.parse((a as any).replaceAll("\'", "\""))
            console.log((a as any).replaceAll("\'", "\""))
            setImagePrompt((a as any))
            setLoading(false)
          }} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Get Image Prompt
          </Button>}
          {imagePrompt !== "" && <p className="text-lg font-semibold">{imagePrompt || 'Image Prompt'}</p>}
        </Card>}
        <div className="flex justify-center">
          {imagePromptHash !== "" && imagePrompt !== "" && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            const parsedJSON = replaceImagePrompt(imagePrompt)
            console.log(parsedJSON)
            try {
              const { hash, requestId } = await executeContractFunction(50, parsedJSON)
              setGeneratedImageHash(hash)
              setGeneratedImageReceiptId(requestId)
            } catch { }

            setLoading(false)
          }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-4 rounded">
            Generate Image
          </Button>}
        </div>
        {generatedImageHash !== "" && <div className="flex justify-center">
          {generatedImage === "" && <Button disabled={loading} onClick={async () => {
            setLoading(true)
            const a = await readAiresult(50, generatedImageReceiptId)
            setGeneratedImage(a as any)
            setLoading(false)
          }} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Get Image
          </Button>}
          {generatedImage !== "" && <img src={`https://ipfs.io/ipfs/${generatedImage}`} width={512} height={512} alt="Generated Image" />}
        </div>}

        {attackReason !== '' && generatedImage !== "" && imagePrompt !== "" && <div className="flex justify-center mt-4">
          <Button className="bg-purple-500" disabled={loading} onClick={async () => {
            setLoading(true)
            const cover = await uploadArweaveFrontend("image", `${process.env.NEXT_PUBLIC_URL}/screenshot/farcastles/1reason?text=${encodeURIComponent(`Reason why i attack ${pickedCastle} and joining ${pickedCrew}`)}`)
            const reason = await uploadArweaveFrontend("image", `${process.env.NEXT_PUBLIC_URL}/screenshot/farcastles/1reason?text=${encodeURIComponent(attackReason)}`)
            const newGeneratedImage = await saveImageOra(`https://ipfs.io/ipfs/${generatedImage}`);
            const all = await uploadArweaveFrontend("json", JSON.stringify({ cover: (cover as any).receiptId, reason: (reason as any).receiptId, art: (newGeneratedImage as any).receiptId }))
            if (fid) {
              postComposerCreateCastActionMessage({
                text: `!attack ${pickedCastle} ${crews[parseInt(selectedCrew)].value}` as string,
                embeds: [`${process.env.NEXT_PUBLIC_URL}/api/attack/${(all as any).receiptId}`],
              });
            } else {
              window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`!attack ${pickedCastle} ${crews[parseInt(selectedCrew)].value}`)}&channelKey=farcastles&embeds[]=${process.env.NEXT_PUBLIC_URL}/api/attack/${(all as any).receiptId}`, '_blank');
            }
            // 
            setLoading(false)
          }}>Share</Button>
        </div>}
      </div>
    </div>
  )
}