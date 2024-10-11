'use client'
import { Card, CardContent } from "~~/components/ui/card"
import { useSearchParams } from "next/navigation";
export default function Component() {
    const searchParams = useSearchParams();
    const text = decodeURIComponent(searchParams.get("text") as string);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-fit h-fit max-w-md overflow-hidden">
        <CardContent className="p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
          <div className="flex items-center justify-center ">
            <p className="text-white text-center text-xl font-semibold">
              {text}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}