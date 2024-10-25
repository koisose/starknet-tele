'use client'
import { useState } from "react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~~/components/ui/dialog"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Textarea } from "~~/components/ui/textarea"
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { usePublicClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAccount,  useWalletClient,useWriteContract,useSimulateContract  } from "wagmi";
import {
  BOND_ABI,
  generateCreateArgs,
  getMintClubContractAddress,
  mintclub,
} from "mint.club-v2-sdk";

export default function Component() {
  const [nfts, setNfts] = useState([
    { title: "NFT 1", description: "Description for NFT 1", price: "5 eth", imageUrl: "" },
    { title: "NFT 2", description: "Description for NFT 2", price: "5 eth", imageUrl: "" },
    { title: "NFT 3", description: "Description for NFT 3", price: "5 eth", imageUrl: "" },
  ])

  const [isOpen, setIsOpen] = useState(false)
  const [newNft, setNewNft] = useState({ title: "", description: "", imageUrl: "" })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewNft(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNfts(prev => [...prev, { ...newNft, price: "5 eth" }])
    setNewNft({ title: "", description: "", imageUrl: "" })
    setIsOpen(false)
  }
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { address } = useAccount();
//https://github.com/ggomaeng/farsight-hackathon/blob/main/api/index.tsx
  const { data: walletClient } = useWalletClient({
    account: address,
    chainId: targetNetwork.id,
  });
  const { writeContract } = useWriteContract()
//https://mint.club/metadata/8453/r+LvKHrMpzPEiFwN/AXWhw==.json
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">cross chain nft marketplace</h1>
      <Button onClick={async()=>{
        console.log(getMintClubContractAddress("BOND", targetNetwork.id as any))
        const creationFee = await mintclub.network("sepolia").bond.getCreationFee();
        const name = `ddd`;
        const symbol = `bdddd`;
        const { tokenParams, bondParams } = generateCreateArgs({
          name,
          symbol,
          tokenType: "ERC1155",
          reserveToken: {
            address: "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
            decimals: 18,
          },
          curveData: {
            curveType: "EXPONENTIAL",
            initialMintingPrice: 0.001,
            finalMintingPrice: 1,
            maxSupply: 1000,
            stepCount: 1,
            creatorAllocation: 1,
          },
          buyRoyalty: 1,
          sellRoyalty: 1,
        });
       
        writeContract({ 
          chainId:targetNetwork.id,
          abi:BOND_ABI,
          address: getMintClubContractAddress("BOND", targetNetwork.id as any),
          functionName: 'createMultiToken',
          args: [
            {
              ...tokenParams,
              uri: `https://basedqr.vercel.app/api/metadata/panda`,
            },
            bondParams,
          ],
          value: creationFee,
       })
      }} className="my-4" variant="outline">mint</Button>
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center">
          <RainbowKitCustomConnectButton />
          <Dialog  open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="my-4" variant="outline">mint</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Mint New NFT</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newNft.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newNft.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={newNft.imageUrl}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Submit</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="aspect-square bg-gray-200 flex items-center justify-center mb-4">
                {nft.imageUrl ? (
                  <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500">image</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">{nft.title}</CardTitle>
              <p className="text-sm text-gray-500 mb-2">{nft.description}</p>
              <p className="font-semibold">price per token: {nft.price}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">buy</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}