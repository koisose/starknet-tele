import ky from "ky";
import Groq from "groq-sdk";
import {
  GoogleGenerativeAI, HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";
import { Client } from "@gradio/client";

export async function generateImageModal(prompt: string) {
  const url = "https://modal-labs--stable-diffusion-xl-model-web-inference.modal.run/?prompt=" + prompt;
  const response = await ky.get(url, { timeout: 100000 }); // Await the response with a 100-second timeout
  const buffer = await response.arrayBuffer(); // Then call buffer()
  return buffer;
}
export async function generateImageFlux(prompt: string) {
  
  const apiUrl = `https://www.blinkshot.io/api/generateImages`;
  // console.log(apiKey)
  const formData = {
    prompt,
    userAPIKey:"",
    iterativeMode: false
  };

  const response = await ky.post(apiUrl, {
    json: formData,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 100000
  }).json();

  return response;
}
export async function generateImageGaia(prompt: string) {
  
    const apiUrl = `/api/imagine`;
    // console.log(apiKey)
    const formData = {
      prompt
    };

    const response = await ky.post(apiUrl, {
      json: formData,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 100000
    }).json();

    return response;
}
export async function generateAI(prompt: any,system:any,node:any) {
  
  const apiUrl = `/api/aicompletion`;
  

  const response = await ky.post(apiUrl, {
    json:{prompt,system,node},
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 100000
  }).json();

  return response;
}
export async function uploadArweaveFrontend(type: any,data:any) {
  
  const apiUrl = `/api/uploadarweave`;
  

  const response = await ky.post(apiUrl, {
    json:{type,data},
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 100000
  }).json();

  return response;
}

export async function generateImageSD(prompt: string) {
  const apiKey = "";  // Replace with your actual Stability AI API key
  const apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
  // console.log(apiKey)
  const formData = new FormData();
  formData.append('prompt', prompt);

  formData.append('cfg_scale', 7 as any);   // Adjusts how much the image respects the prompt
  formData.append('height', 512 as any);    // Height of the generated image
  formData.append('width', 512 as any);     // Width of the generated image
  formData.append('steps', 50 as any);      // Number of steps (more steps = better quality)
  formData.append('samples', 1 as any);
  formData.append('mode', "text-to-image");
  formData.append('model', "sd3-medium");
  formData.append('seed', Math.floor(Math.random() * 2147483647) as any);

  const response = await ky.post(apiUrl, {
    body: formData,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      // 'Content-Type': 'application/json'
    },
    timeout: 100000
  }).json();

  const imageUrl = (response as any);
  return imageUrl.image;
  // You can display the image on a webpage using the following:
  // document.getElementById('image').src = imageUrl;


}
export async function generateImage(content: string) {
  console.log(content)
  const client = await Client.connect("black-forest-labs/FLUX.1-schnell");
  const result = await client.predict("/infer", {
    prompt: content,
    seed: Math.floor(Math.random() * 2147483647),
    randomize_seed: true,
    width: 1024,
    height: 1024,
    num_inference_steps: 4,
  });

  return result.data;
}
export const imagePrompt = `A diorama showcasing a fantasy siege scene, rendered in vibrant pixel art style reminiscent of classic 8-bit RPGs. The scene is set on a [terrain type], where a vast [attacking group] is laying siege to a towering, pixelated castle. Some are [attacking action], while others [attacking action 2]. The castle is defended by [defending group] who are valiantly fighting back. The diorama is meticulously crafted and encased within a transparent acrylic display case, enhancing the nostalgic feel. Below the battlefield scene, a semi-transparent game menu overlay displays a single health bar representing the castle's health. Above the health bar, the text "[Pick 'north castle attack' or 'south castle attack']" is displayed in a clear, pixelated font. The overall scene is well-lit, with soft lighting that accentuates the pixel art details and the clear case. The background is intentionally blurred to draw focus to the diorama itself. The style is retro gaming, pixel art, nostalgic, with a touch of diorama realism. --ar 3:2 --zoom 2 --v 5 --style raw photo`
//Replace the bracketed placeholders with your desired character, monster, terrain, and hero descriptions.

export async function askGemini(content: string, systemMessage: string) {
  const API_KEY = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    systemInstruction: systemMessage
  }
 );
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [

    ],
  });


  const result = await chatSession.sendMessage(content);



  const text = result.response.text();
  return text
}
export async function askGroq(content: string, systemMessage: string) {
  const API_KEY = process.env.GROQ_API_KEY;
  const groq = new Groq({
    apiKey: API_KEY,
  });
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content,
      },
    ],
    model: "mixtral-8x7b-32768",
  });
  // const text = completion.choices[0]?.message?.content;
  return completion;
}

async function randomToolNode() {
  const response = await ky.get("https://api.gaianet.ai/api/v1/network/nodes/");
  const data = await response.json();

  const objectArray = (data as any).data.objects.filter(
    (obj: any) => obj.status === "ONLINE" && obj.model_name && obj.node_id.toLowerCase().includes("tool"),
  );
  const random = objectArray[Math.floor(Math.random() * objectArray.length)];
  return random;
}
export async function randomNode() {
  const response = await ky.get("https://api.gaianet.ai/api/v1/network/nodes/");
  const data = await response.json();

  const objectArray = (data as any).data.objects.filter(
    (obj: any) => obj.status === "ONLINE" && (obj.model_name.toLowerCase().includes("llama") || obj.model_name.toLowerCase().includes("phi") || obj.model_name.toLowerCase().includes("gemma")),
  );
  const random = objectArray[Math.floor(Math.random() * objectArray.length)];
  return random;
}
export async function ask(content: string, systemMessage: string, node: any) {



  const response = await ky.post(`https://${node.subdomain}/v1/chat/completions`, {
    json: {
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content
        },
      ],
      model: node.model_name
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
export async function askTool(content: string, tools: any) {

  const random = await randomToolNode();

  const response = await ky.post(`https://${random.subdomain}/v1/chat/completions`, {
    json: {
      messages: [
        {
          role: "system",
          content: "you're a chatbot that can pick what command to use based on natural language"
        },
        {
          role: "user",
          content
        },
      ],
      model: random.model_name,
      tools
    },
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [408, 504],
      backoffLimit: 3000,
    },
    timeout: 50000,
  });
  return { response, random };
}
