"use client"

import { useState } from "react"
import { Button } from "~~/components/ui/button"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog"
import { Textarea } from "~~/components/ui/textarea"
import ky from 'ky'
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
const getData = async (url:any) => {
  try {
    const response = await ky.post(url, {  timeout: 100000 });
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
const [vectorData,setVectorData] = useState([])
const [search, setSearch] = useState("")

  const handleSubmit = () => {
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    // Here you would typically handle the actual submission
    console.log("URL submitted:", urlInput)
    setIsModalOpen(false)
    setUrlInput("")
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2 mt-5">
          <Label htmlFor="url">URL</Label>
          <Textarea
            id="url" 
            placeholder="https://example.com" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={async()=>{
          const data=await postData('/api/savedatamongoazure',{url:urlInput})
          console.log(data)
        }}>
          Scrape
        </Button>
        <div className="space-y-2 mt-5">
          <Label htmlFor="url">Search</Label>
          <Textarea
            id="url" 
            placeholder="https://example.com" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={async()=>{
          const data=await postData('/api/checkanswermicrosoft',{text:search})
          console.log(data)
        }}>
          Scrape
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input type="search" placeholder="Search using vector search" className="flex-grow" />
          <Button type="submit">Search</Button>
        </div>
        <div className="flex justify-center">
        <Button className="w-32" onClick={async ()=>{
          const data=await getData("/api/getallscraped")
          setVectorData(data as any)
        }}>
          load/refresh
        </Button>
      </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vectorData.map((item:any) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.url}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this URL?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              No
            </Button>
            <Button onClick={handleConfirm}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}