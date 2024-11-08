import {
    GoogleGenerativeAI, HarmCategory,
    HarmBlockThreshold,SchemaType
  } from "@google/generative-ai";
export async function makeEmbedding(text:any) {
    const API_KEY = process.env.GOOGLE_API_KEY as string;
    const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "text-embedding-004"});
const result = await model.embedContent(text);
const embedding = result.embedding;
return embedding
}
const searchDocumentationDeclaration = {
    name: "searchDocumentation",
    parameters: {
      type: SchemaType.OBJECT,
      description: "Search starknet documentation",
      properties: {
        question: {
          type: SchemaType.STRING,
          description: "Get the question",
        },
      },
      required: ["question"],
    },
  };
  const getBalanceDeclaration = {
    name: "getBalance",
    parameters: {
      type: SchemaType.OBJECT,
      description: "get balance of a user",
      properties: {
        address: {
          type: SchemaType.STRING,
          description: "Get the starknet address",
        },
      },
      required: ["address"],
    },
  };
  const transactionDeclaration = {
    name: "transaction",
    parameters: {
      type: SchemaType.OBJECT,
      description: "list 5 latest of the transaction of a starknet address",
      properties: {
        address: {
          type: SchemaType.STRING,
          description: "Get the starknet address",
        },
        
      },
      required: ["address"],
    },
  };
export async function askGeminiTool(content: string, systemMessage: string) {
    const API_KEY = process.env.GOOGLE_API_KEY as string;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    
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
      systemInstruction: systemMessage,
      tools: [{
        functionDeclarations: [searchDocumentationDeclaration,getBalanceDeclaration,transactionDeclaration],
      }],
    }
   );
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
  
      ],
    });
    const result = await chatSession.sendMessage(content);
    const res = result.response;
    return res
  }
  
  const transferMorphDeclaration = {
    name: "transfer",
    parameters: {
      type: SchemaType.OBJECT,
      description: "transfer to other morph address",
      properties: {
        address: {
          type: SchemaType.STRING,
          description: "Get the morph address",
        },
        value: {
          type: SchemaType.STRING,
          description: "How much to send",
        },
      },
      required: ["address","value"],
    },
  };
  const balanceMorphDeclaration = {
    name: "balance",
    parameters: {
      type: SchemaType.OBJECT,
      description: "check morph address balance",
      properties: {
        address: {
          type: SchemaType.STRING,
          description: "Get the morph address",
        }
      },
      required: [],
    },
  };
  const transactionsMorphDeclaration = {
    name: "transactions",
    parameters: {
      type: SchemaType.OBJECT,
      description: "check morph list transaction",
      properties: {
        address: {
          type: SchemaType.STRING,
          description: "Get the morph address",
        }
      },
      required: [],
    },
  };
  export async function askGeminiTool2(content: string, systemMessage: string) {
    const API_KEY = process.env.GOOGLE_API_KEY as string;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    
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
      systemInstruction: systemMessage,
      tools: [{
        functionDeclarations: [
          transferMorphDeclaration,
          balanceMorphDeclaration,
          transactionsMorphDeclaration
        ],
      }],
    }
   );
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
  
      ],
    });
    const result = await chatSession.sendMessage(content);
    const res = result.response;
    return res
  }