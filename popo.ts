import ky from 'ky'
async function randomNode() {
  const response = await ky.get("https://api.gaianet.ai/api/v1/network/nodes/");
  const data = await response.json();

  const objectArray = (data as any).data.objects.filter(
    (obj: any) => obj.status === "ONLINE" && (obj.model_name.toLowerCase().includes("llama") || obj.model_name.toLowerCase().includes("gemma")),
  );
  // const random = objectArray[Math.floor(Math.random() * objectArray.length)];
  return objectArray;
}
const a=await randomNode()
console.log(a)