import ky from 'ky'
const apiKey=""
export async function askOpenAISystem(messages:any) {
  const response = await ky.post(`https://mango-bush-0a9e12903.5.azurestaticapps.net/api/v1/openai/deployments/gpt-4-turbo-2024-04-09/chat/completions?api-version=2023-12-01-preview`, {
    json: {
      messages,
      model:"o1-preview"
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
