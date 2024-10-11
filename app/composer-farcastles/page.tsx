'use client'
import "@farcaster/auth-kit/styles.css";
import {  useState } from 'react'
import { Button } from "~~/components/ui/button"
import { Card } from "~~/components/ui/card"
import { notification } from "~~/utils/scaffold-eth";
import { generateAI, generateImageGaia, imagePrompt,uploadArweaveFrontend } from '~~/apa/gaianet';
import { useSearchParams } from "next/navigation";
import { postComposerCreateCastActionMessage } from "frog/next";
export default function Component() {
  const [attackReason, setAttackReason] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [selectedCrew, setSelectedCrew] = useState("random");
  const [selectedPick, setSelectedPick] = useState("random");
  const [pickedCastle, setPickedCastle] = useState("");
  const [pickedCrew, setPickedCrew] = useState("");
  const [receiptId, setReceiptId] = useState("");
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
          And generative art using AI
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

        <div className="flex justify-center space-x-4 mb-6">
          <Button disabled={loading} onClick={async () => {
            try {
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
              const node = { subdomain: "0x9b829bf1e151def03532ab355cdfe5cee001f4b0.us.gaianet.network", "model_name": "Meta-Llama-3-8B-Instruct-Q5_K_M" }
              const reasonToAttack = await generateAI(`{"crew":"${yourCrew}","attacking":"${yourPick}"}`, `You're an attack sequence generator there is a war between north and south castle, people can pick which castle they gonna attack by "attacking" data, people can pick what crew they attack with by "crew" data,give them a story on why they should attack their particular castle and how do they attack them from provided data, make it one liner,short, and concise`, node)
              const why = reasonToAttack
              const imageGenerator = await generateAI(`{"story":"${(why as any).choices[0].message.content}","image_prompt":"${imagePrompt}"}`, `based the story data replace [terrain type],[attacking group],[attacking action],[attacking action 2],[defending group],[Pick 'north castle attack' or 'south castle attack'], do not change the prompt only replace the bracket, answer in this schema {"image_prompt":"<image_prompt>"} with no explanation whatsoever, only answer in JSON format`, node)
              const imageRes = imageGenerator
              const cover=await uploadArweaveFrontend("image",`${process.env.NEXT_PUBLIC_URL}/screenshot/farcastles/1reason?text=${encodeURIComponent(`Reason why i attack ${yourPick} and joining ${yourCrew}`)}`)
              const reason=await uploadArweaveFrontend("image",`${process.env.NEXT_PUBLIC_URL}/screenshot/farcastles/1reason?text=${encodeURIComponent((why as any).choices[0].message.content)}`)
              
              const newGeneratedImage = await generateImageGaia(JSON.parse((imageRes as any).choices[0].message.content).image_prompt);
              const all=await uploadArweaveFrontend("json",JSON.stringify({cover:(cover as any).receiptId,reason:(reason as any).receiptId,art:(newGeneratedImage as any).receiptId}))
              console.log(all)
              setReceiptId((all as any).receiptId)
              console.log((why as any).choices[0].message.content)
              console.log("generated prompt")
              console.log((imageRes as any).choices[0].message.content)
              setAttackReason((why as any).choices[0].message.content)
              setGeneratedImage(`https://uploader.irys.xyz/${(newGeneratedImage as any).receiptId}`)
              setLoading(false)
            } catch (e) {
              try {
                //@ts-ignore
                if (e.response.status === 429) {
                  try {
                    //@ts-ignore
                    const error = await e.response.text()
                    notification.error(<div className="text-white">{error}</div>, { duration: 5000 });
                    localStorage.setItem("error", error)
                    setLoading(false)
                  } catch {
                    if (localStorage.getItem("error")) {
                      notification.error(<div className="text-white">{localStorage.getItem("error")}</div>, { duration: 5000 });
                    } else {
                      notification.error(<div className="text-white">Sorry theres something error please try again</div>, { duration: 5000 });
                    }
                    setLoading(false)
                  }
                } else {
                  notification.error(<div className="text-white">Sorry theres something error please try again</div>, { duration: 5000 });
                }
              } catch {
                setLoading(false)
                notification.error(<div className="text-white">Sorry theres something error please try again</div>, { duration: 5000 });
              }
              setLoading(false)




            }

          }
          }>{loading ? "please wait..." : "Generate"}</Button>

        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <p className="bg-black text-white px-4 py-2 rounded-md">The castle you attack: {pickedCastle}</p>
          <p className="bg-black text-white px-4 py-2 rounded-md">The crew you pick: {pickedCrew}</p>
        </div>
        <Card className="p-4 mb-4  flex items-center justify-center">
          <p className="text-lg font-semibold">{attackReason || 'Attack reason'}</p>
        </Card>

        <div className="flex justify-center">
          {generatedImage && <img src={generatedImage} width={512} height={512} alt="Generated Image" />}
        </div>
        {attackReason !== '' && <div className="flex justify-center mt-4">
          <Button className="bg-purple-500" onClick={() => {
            if(fid){
              postComposerCreateCastActionMessage({
                text: `!attack ${pickedCastle} ${crews[parseInt(selectedCrew)].value}` as string,
                embeds: [`${process.env.NEXT_PUBLIC_URL}/api/attack/${receiptId}`],
              });
            }else{
              window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`!attack ${pickedCastle} ${crews[parseInt(selectedCrew)].value}`)}&channelKey=farcastles&embeds[]=${process.env.NEXT_PUBLIC_URL}/api/attack/${receiptId}`, '_blank');
            }
            // 
             
          }}>Share</Button>
        </div>}
      </div>
    </div>
  )
}