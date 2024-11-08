import ky from 'ky';
// import { BrianSDK } from "@brian-ai/sdk";

// const options = {
//   apiKey: process.env.BRIANAI_API,
// };
// //@ts-ignore
// const brian = new BrianSDK(options);
export async function searchKnowledge(prompt:string){
    return ky.post('https://api.brianknows.org/api/v0/agent/knowledge', {
        headers: {
          'X-Brian-Api-Key': process.env.BRIANAI_API,
          'Content-Type': 'application/json'
        },
        json: {
            prompt,
            kb: "public-knowledge-box",
        },
        timeout: 50000
      }).json();
}