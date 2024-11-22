import ky from 'ky'
import { AzureOpenAI } from "openai";
const apiKey=""
const url=`https://mango-bush-0a9e12903.5.azurestaticapps.net/api/v1/openai/deployments/gpt-4o`
export async function askOpenAISystem(messages:any) {
  const response = await ky.post(`${url}/chat/completions?api-version=2023-12-01-preview`, {
    json: {
      messages:[
        {"role": "user", "content": "hello"},
        
    ],
    stream:false,
      model:"gpt-4o"
    },
    headers: {
      'accept': 'application/json',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.8',
      'api-key': apiKey,
      'content-type': 'application/json; charset=UTF-8',
      'x-ms-useragent':'azsdk-js-openai-rest/1.0.0-beta.11 core-rest-pipeline/1.15.0 OS/Windows',
      'origin':'https://mango-bush-0a9e12903.5.azurestaticapps.net'
    },
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [429],
      backoffLimit: 20000,
    },
    timeout: 20000,
  });
  return response;
}
export async function generateDalle(messages:any) {
  //{"prompt":"a cute cat in the style of lego","n":1,"size":"1024x1024","response_format":"url"}
  const response = await ky.post(`https://mango-bush-0a9e12903.5.azurestaticapps.net/api/v1/openai/deployments/dall-e-3/images/generations?api-version=2023-12-01-preview`, {
    json: {
      messages,
    },
    headers: {
      'accept': 'application/json',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.8',
      'api-key': apiKey,
      'content-type': 'application/json; charset=UTF-8'
    },
    retry: {
      limit: 3,
      methods: ["post"],
      statusCodes: [429],
      backoffLimit: 20000,
    },
    timeout: 20000,
  });
  return response;
}
export async function embeddings(inputText:string) {
  const response = await ky.post(`${url}/embeddings?api-version=2023-12-01-preview`, {
      headers: {
          'Content-Type': 'application/json',
          'api-key': `${process.env.AKASHCHAT_API}`
      },
      json: {
          input: inputText,
          model: "text-embedding-3-large"
      }
  }).json();
  return response;
}
const searchDocumentationDeclaration = {
type: "function",
function: {
  name: "search_documentation",
  strict: false,
  description: "Search starknet documentation",
  parameters: {
    type: "object",
    
    properties: {
      question: {
        type: "string",
        description: "Get the question",
      },
    },
    required: ["question"],
    additionalProperties: false
  },
}
};
const getBalanceDeclaration = {
  type: "function",
  function: {
    name: "get_balance",
    strict: false,
    description: "get balance of a user",
    parameters: {
      type: "object",
     
      properties: {
        address: {
          type: "string",
          description: "Get the akash address",
        },
      },
      required: ["address"],
      additionalProperties: false
    },
  }
};

const transactionDeclaration = {
  type: "function",
  function: {
    name: "list_transaction",
    strict: false,
    description: "list 5 latest of the transaction of a starknet address",
    parameters: {
      type: "object",
      
      properties: {
        address: {
          type: "string",
          description: "Get the starknet address",
        },
      },
      required: ["address"],
      additionalProperties: false
    },
  }
}
export async function askTool(content: string) {

const apiUrl = `${url}/chat/completions?api-version=2024-02-01`;

const payload = {
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content:"youre the best"
    },
    {
      role: "user",
      content
    },
  ],
  // tools: [searchDocumentationDeclaration,getBalanceDeclaration,transactionDeclaration],
  stream:false
};

try {
  const response = await ky.post("https://mango-bush-0a9e12903.5.azurestaticapps.net/api/v1/openai/deployments/gpt-4-turbo-2024-04-09/chat/completions?api-version=2023-12-01-preview", {
    json: {"temperature":0.7,"stop":["Stop sequences"],"max_tokens":512,"top_p":0.9,"frequency_penalty":0,"presence_penalty":0,"messages":[{"role":"system","content":"You are an AI assistant that helps people find information."},{"role":"user","content":"\"haha\""},{"role":"assistant","content":"Hello! How can I assist you today?"},{"role":"user","content":"hello"}]},
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': '',
      'x-ms-useragent':'azsdk-js-openai-rest/1.0.0-beta.11 core-rest-pipeline/1.15.0 OS/Windows',
      'origin':'https://mango-bush-0a9e12903.5.azurestaticapps.net'
    },
    timeout: 50000
  });

  return response
  
} catch (error) {
  console.error('Error calling OpenAI API:', error);
}
}