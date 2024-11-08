//https://chatapi.akash.network/api/v1
//Meta-Llama-3-1-405B-Instruct-FP8
import OpenAI from 'openai';



export async function embedding(input: string) {
  const client = new OpenAI({
    baseURL: "https://0x8a870dd0e948246f32d3e7775172cb875062c001.gaianet.network/v1",
  });

  const a = await client.embeddings.create({ input, model: "nomic-embed" })
  return a.data[0].embedding
}
const searchDocumentationDeclaration = {
  "type": "function",
  "function": {
    "name": "search_documentation",
    "description": "Search starknet documentation",
    "parameters": {
      "type": "object",
      "properties": {
        "question": {
          "type": "string",
          "description": "Get the question"
        }
      },
      "required": ["question"],
      "additionalProperties": false
    },

  }
};
const getBalanceDeclaration = {
  "type": "function",
  "function": {
    "name": "get_balance",

    "description": "get balance of a user",
    "parameters": {
      "type": "object",

      "properties": {
        "address": {
          "type": "string",
          "description": "Get the starknet address",
        },
      },
      "required": ["address"],
      "additionalProperties": false
    },
  }
};

const transactionDeclaration = {
  "type": "function",
  "function": {
    "name": "list_transaction",
    "description": "list 5 latest of the transaction of a starknet address",
    "parameters": {
      "type": "object",

      "properties": {
        "address": {
          "type": "string",
          "description": "Get the starknet address",
        },
      },
      "required": ["address"],
      "additionalProperties": false
    },
  }
}

const transferDeclaration = {
  "type": "function",
  "function": {
    "name": "transfer",
    "description": "transfer to starknet address",
    "parameters": {
      "type": "object",

      "properties": {
        "address": {
          "type": "string",
          "description": "Get the starknet address",
        },
        "value": {
          "type": "string",
          "description": "How many to send",
        },
        "symbol": {
          "type": "string",
          "enum":["ETH","STRK"],
          "description": "Get symbol to send",
        },
      },
      "required": ["address","value","symbol"],
      "additionalProperties": false
    },
  }
}
export async function askTool(content: string) {
  const client = new OpenAI({
    baseURL: "https://chatapi.akash.network/api/v1",
    apiKey: process.env.AKASHCHAT_API, // This is the default and can be omitted
  });
  try {
    //@ts-ignore
    const stream = await client.chat.completions.create({
      model: 'Meta-Llama-3-1-8B-Instruct-FP8',
      messages: [{ role: 'user', content }],
      stream: false,
      tools: [searchDocumentationDeclaration, getBalanceDeclaration, transactionDeclaration,transferDeclaration]
    });
    return stream
  } catch {
    console.log("error function call")
  }
}

export async function askLlama(content: string,system:string) {
  const client = new OpenAI({
    baseURL: "https://chatapi.akash.network/api/v1",
    apiKey: process.env.AKASHCHAT_API, // This is the default and can be omitted
  });
  try {
    //@ts-ignore
    const stream = await client.chat.completions.create({
      model: 'Meta-Llama-3-1-405B-Instruct-FP8',
      messages: [{ role: 'system', content:system },{ role: 'user', content }],
      stream: false,
   
    });
    return stream
  } catch {
    console.log("error function call")
  }
}