import ky from "ky";
import {superfluidtools} from './superfluidtool'

async function randomToolNode() {
  const response = await ky.get("https://api.gaianet.ai/api/v1/network/nodes/");
  const data = await response.json();

  const objectArray = (data as any).data.objects.filter(
    (obj: any) => obj.status === "ONLINE" && obj.model_name && obj.node_id.toLowerCase().includes("tool"),
  );
  const random = objectArray[Math.floor(Math.random() * objectArray.length)];
  return random;
}
async function randomNode() {
  const response = await ky.get("https://api.gaianet.ai/api/v1/network/nodes/");
  const data = await response.json();

  const objectArray = (data as any).data.objects.filter(
    (obj: any) => obj.status === "ONLINE" ,
  );
  const random = objectArray[Math.floor(Math.random() * objectArray.length)];
  return random;
}
export async function ask(content:string) {
  
  const random = await randomNode();

  const response = await ky.post(`https://${random.subdomain}/v1/chat/completions`, {
    json: {
      messages: [
        {
          role: "system",
          content:"you're a chatbot that can pick what command to use based on natural language"
        },
        {
          role: "user",
          content
        },
      ],
      model: random.model_name,
      tools: superfluidtools
    },
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [408, 504],
      backoffLimit: 3000,
    },
    timeout: 50000,
  });
  return response;
}
export async function askTool(content:string) {
  
  const random = await randomToolNode();

  const response = await ky.post(`https://${random.subdomain}/v1/chat/completions`, {
    json: {
      messages: [
        {
          role: "system",
          content:"you're a chatbot that can pick what command to use based on natural language"
        },
        {
          role: "user",
          content
        },
      ],
      model: random.model_name,
      tools: superfluidtools
    },
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [408, 504],
      backoffLimit: 3000,
    },
    timeout: 50000,
  });
  return response;
}
