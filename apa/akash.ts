//https://chatapi.akash.network/api/v1
//Meta-Llama-3-1-405B-Instruct-FP8
import OpenAI from 'openai';
import ky from 'ky'


export async function embedding(input: string) {
  const client = new OpenAI({
    baseURL: "https://0x8a870dd0e948246f32d3e7775172cb875062c001.gaianet.network/v1",
    apiKey: process.env.AKASHCHAT_API,
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
const transactionDetailDeclaration = {
  "type": "function",
  "function": {
    "name": "transaction_detail",
    "description": "Detail of a transaction hash",
    "parameters": {
      "type": "object",

      "properties": {
        "hash": {
          "type": "string",
          "description": "Get the transaction hash",
        },
      },
      "required": ["hash"],
      "additionalProperties": false
    },
  }
}
const depositDeclaration = {
  "type": "function",
  "function": {
    "name": "deposit",
    "description": "Deposit eth from ethereum to starknet",
    "parameters": {
      "type": "object",

      "properties": {
        "address": {
          "type": "string",
          "description": "Get the starknet address",
        },
        "value": {
          "type": "string",
          "description": "Get how much to deposit",
        },
      },
      "required": ["address","value"],
      "additionalProperties": false
    },
  }
}
const withdrawDeclaration = {
  "type": "function",
  "function": {
    "name": "withdraw",
    "description": "Withdraw eth from starknet to ethereum",
    "parameters": {
      "type": "object",

      "properties": {
        "address": {
          "type": "string",
          "description": "Get the eth address",
        },
        "value": {
          "type": "string",
          "description": "Get how much to withdraw",
        },
      },
      "required": ["address","value"],
      "additionalProperties": false
    },
  }
}
const swapDeclaration = {
  "type": "function",
  "function": {
    "name": "swap",
    "description": "Swap from one token to another",
    "parameters": {
      "type": "object",

      "properties": {
        "sell_token": {
          "type": "string",
          "description": "sell token",
        },
        "buy_token": {
          "type": "string",
          "description": "buy token",
        },
        "value": {
          "type": "string",
          "description": "Get how much to swap",
        },
      },
      "required": ["buy_token","sell_token","value"],
      "additionalProperties": false
    },
  }
}
const listTokenDeclaration = {
  "type": "function",
  "function": {
    "name": "list_token",
    "description": "List all the token you can swap on avnu",
    "parameters": {
      "type": "object",

      "properties": {
        "network": {
          "type": "string",
          "enum":["sepolia","mainnet"],
          "description": "either sepolia or mainnet default to sepolia",
        },
        
      },
      "required": ["network"],
      "additionalProperties": false
    },
  }
}
// 1. search - to search starknetjs.com documentation ✅
// 2. transfer - to transfer token between starknet address ✅
// 3. list of transaction - to list a transaction of particular address ✅
// 4. list token - list all token powered by AVNU 
// 5. balance - check balance of particular address only sepolia for now ✅
// 6. swap - swap between token powered by AVNU ✅
// 7. transaction detail - see detail of transaction ✅

export async function askTool(content: string) {
  const client = new OpenAI({
    baseURL: "https://chatapi.akash.network/api/v1",
    // baseURL: "https://0x63738c9066645867348a02cf135356fe300cf7a0.us.gaianet.network/v1",
    apiKey: process.env.AKASHCHAT_API, // This is the default and can be omitted
  });
  try {
    //@ts-ignore
    const stream = await client.chat.completions.create({
      model: 'Meta-Llama-3-1-8B-Instruct-FP8',
      // model: 'Llama-3.2-3B-Instruct',
      messages: [{ role: 'user', content }],
      stream: false,
      tools: [searchDocumentationDeclaration, getBalanceDeclaration, transactionDeclaration,
        transferDeclaration,
        transactionDetailDeclaration,
        listTokenDeclaration,
     
        swapDeclaration]
    });
    return stream
  } catch(e) {
    //@ts-ignore
    console.log(e.message)
    console.log("error function call")
  }
}

export async function askLlama(content: string,system:string) {
  const client = new OpenAI({
    baseURL: "https://chatapi.akash.network/api/v1",
    // baseURL:"https://0x63738c9066645867348a02cf135356fe300cf7a0.us.gaianet.network/v1",
    apiKey: process.env.AKASHCHAT_API, // This is the default and can be omitted
  });
  try {
    //@ts-ignore
    const stream = await client.chat.completions.create({
      model: 'Meta-Llama-3-1-405B-Instruct-FP8',
      // model: 'Llama-3.2-3B-Instruct',
      messages: [{ role: 'system', content:system },{ role: 'user', content }],
      stream: false,
   
    });
    return stream
  } catch(e) {
    //@ts-ignore
    console.log(e.message)
    console.log("error ask llama")
  }
}
export async function generateLlama(prompt: string,system:string) {
  
  const apiUrl = `/api/askllama`;
  // console.log(apiKey)
  const formData = {
    prompt,system
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