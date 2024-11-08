/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "~~/frog-ui/ui";
import { generateImageModal, ask,generateImageFlux,askGemini } from '~~/apa/gaianet'
import arcjet, { fixedWindow } from "@arcjet/node";
import { getConnInfo } from 'hono/cloudflare-workers'
import { uploadArweave, generateImage } from '~~/apa/create-image'
import { validateFramesMessage } from "@airstack/frames";
import { init } from "@airstack/frames";
import {saveBulkData,saveData,getDataByAggregate,getData} from '~~/apa/mongo_atlas'
import {makeEmbedding} from '~~/apa/gemini'
import { scrapeStarknetDocs } from '~~/apa/search-web'
import { embedding } from '~~/apa/akash'
import { Bot } from "grammy";
init(process.env.AIRSTACK_API_KEY as string);
import ky from 'ky'
const aj = arcjet({
  key: process.env.ARCJET!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    fixedWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      match: "/api/imagine", // match all requests to /api/hello
      window: "12h", // 60 second fixed window
      max: 1, // allow a maximum of 100 requests
    }),

  ],
});
const app = new Frog({
  // imageAspectRatio: '1:1',
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {

      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY!,
      },
    },
  },
  ui: { vars },
  assetsPath: "/",
  basePath: "/api",
  browserLocation: '/:path',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "SUPER FRAME",
});
// app.hono.post("/savedatamongoazure", async c => {

//   const data = await c.req.json();
//   // console.log(data.url)
//   // return c.json({panda:"dsa"});
//   const scraped=await scrapeStarknetDocs(data.url)
//   const embed = await embedding(scraped.content);
//   const saved = await saveData({  vectorContent: embed, ...scraped,url:data.url }, "starknet");

//   return c.json(saved);
// });
app.hono.post("/checkanswermicrosoft", async c => {

  const data = await c.req.json();
  const embed = await makeEmbedding(data.text)
  const allData = await getDataByAggregate("microsoft-learn", [
    {
        '$vectorSearch': {
            'index': 'vector_index',
            'path': 'vectorContent',
            'queryVector': embed.values,
            'numCandidates': 22,
            'limit': 3
        }
    }, {
        '$project': {
            '_id': 1,
            'text': 1,
            'score': {
                '$meta': 'vectorSearchScore'
            }
        }
    }
])
const sorted = allData.sort((a, b) => b.score - a.score);
        const allRelevantData = sorted.map(a => a.text)
        
        //@ts-ignore
        const theAnswer = await askGemini(`based on this data ${JSON.stringify(allRelevantData)} pick the answer of this multiple choice question \`\`\`${data.text}\`\`\``, "There is a multiple-choice questions you pick which one is the answer based on the data")
  return c.json(theAnswer);
});
// app.hono.post("/savedatamongoazure", async c => {

//   const data = await c.req.json();
//  const scraped=await scrapeStarknetDocs(data.url)
//  const firstHalf = scraped.content.substring(0, Math.floor(scraped.content.length / 2));
//  const secondHalf = scraped.content.substring(Math.floor(scraped.content.length / 2));
//  const embed1=await embedding(firstHalf)
//  const embed2=await embedding(secondHalf)
//  const saved=await saveData({vectorContent:embed1,url:data.url},"starknet")
//  const saved2=await saveData({vectorContent:embed2,url:data.url},"starknet")
//   return c.json({firstHalf,secondHalf});
// });
// app.hono.post("/savedatamongoazure", async c => {

//   const data = await c.req.json();
//   const scraped = await scrapeStarknetDocs(data.url)
//   const partLength = Math.floor(scraped.content.length / 3);
//   const firstPart = scraped.content.substring(0, partLength);
//   const secondPart = scraped.content.substring(partLength, 2 * partLength);
//   const thirdPart = scraped.content.substring(2 * partLength);
//   const embed1 = await embedding(firstPart);
//   const embed2 = await embedding(secondPart);
//   const embed3 = await embedding(thirdPart);
//   const saved1 = await saveData({ ...scraped, vectorContent: embed1, url: data.url }, "starknet");
//   const saved2 = await saveData({ ...scraped, vectorContent: embed2, url: data.url }, "starknet");
//   const saved3 = await saveData({ ...scraped, vectorContent: embed3, url: data.url }, "starknet");
//   return c.json({ firstPart, secondPart, thirdPart, ...scraped });
// });
// app.hono.post("/savedatamongoazure", async c => {
//   const data = await c.req.json();
//   const scraped = await scrapeStarknetDocs(data.url)
//   const partLength = Math.floor(scraped.content.length / 6);
//   const firstPart = scraped.content.substring(0, partLength);
//   const secondPart = scraped.content.substring(partLength, 2 * partLength);
//   const thirdPart = scraped.content.substring(2 * partLength, 3 * partLength);
//   const fourthPart = scraped.content.substring(3 * partLength, 4 * partLength);
//   const fifthPart = scraped.content.substring(4 * partLength, 5 * partLength);
//   const sixthPart = scraped.content.substring(5 * partLength);
//   const embed1 = await embedding(firstPart);
//   const embed2 = await embedding(secondPart);
//   const embed3 = await embedding(thirdPart);
//   const embed4 = await embedding(fourthPart);
//   const embed5 = await embedding(fifthPart);
//   const embed6 = await embedding(sixthPart);
//   const saved1 = await saveData({ ...scraped, vectorContent: embed1, url: data.url }, "starknet");
//   const saved2 = await saveData({ ...scraped, vectorContent: embed2, url: data.url }, "starknet");
//   const saved3 = await saveData({ ...scraped, vectorContent: embed3, url: data.url }, "starknet");
//   const saved4 = await saveData({ ...scraped, vectorContent: embed4, url: data.url }, "starknet");
//   const saved5 = await saveData({ ...scraped, vectorContent: embed5, url: data.url }, "starknet");
//   const saved6 = await saveData({ ...scraped, vectorContent: embed6, url: data.url }, "starknet");
//   return c.json({ firstPart, secondPart, thirdPart, fourthPart, fifthPart, sixthPart, ...scraped });
// });
// app.hono.post("/searchscraped", async c => {

//   const data = await c.req.json();
//  const scraped=await scrapeStarknetDocs(data.url)
//   return c.json(scraped);
// });
// app.hono.get("/getallscraped", async c => {

//   const data=await getData("starknet")
//   return c.json(data as any);
// });
app.hono.post("/sendmessage", async c => {
  const data = await c.req.json();
  const bot = new Bot(process.env.STARKNETAI_BOT as string);
  await bot.api.sendMessage(data.chatId, data.text);
  return c.json({haha:"haha"});
});
// Uncomment to use Edge Runtime
// export const runtime = 'edge'
app.composerAction(
  "/composer",
  async c => {
    const data = c.actionData;


    return c.res({
      title: "farcastle",
      //@ts-ignore
      url: `${process.env.NEXT_PUBLIC_URL}/composer-farcastles?fid=${data.fid}`,
    });
  },
  {
    "name": "Farcastles",
    "icon": "book",
    "description": "Play Farcastles",
    "imageUrl": "https://uploader.irys.xyz/61q4vEKkAYcm9eL7AJuJAtZDRBVAp96PrLuHwmDSwwx7"
  },
);
app.frame("/attack/:id", async c => {
  const id = c.req.param("id")
  try {
    const pa = await c.req.json()

    if (pa) {
      const a = await validateFramesMessage(pa);
      //@ts-ignore
      console.log(a.message.data.fid)
    }
  } catch (e) {
    //@ts-ignore
    console.log(e.message)
    console.log("error validating")
  }

  const { buttonValue } = c
  let data;
  try {
    data = await ky.get(`https://uploader.irys.xyz/${id}`).json();
  } catch {
    return c.error({ message: "something error" })
  }

  let butVal = ""
  let image = ""
  if (!buttonValue) {
    butVal = "reason"
    image = "cover"
  } else if (buttonValue === "reason") {
    butVal = "art"
    image = "reason"
  } else {
    image = "art"
    butVal = "reason"
  }

  // return c.json(data)
  return c.res({
    title: "attacking",
    image: `https://uploader.irys.xyz/${(data as any)[image]}`,
    imageAspectRatio: "1:1",
    intents: [
      // (
      //   <Button.Redirect
      //     href={`https://warpcast.com/~/composer-actions?url=${encodeURIComponent(
      //       `${process.env.NEXT_PUBLIC_URL}/api/composer`,
      //     )}`}
      //   >
      //     attack
      //   </Button.Redirect>
      // ) as any,
      (
        <Button.Redirect
          location={`https://superappbot.koisose.lol/composer-farcastles`}
        >
          attack
        </Button.Redirect>
      ) as any,
      (
        <Button
          value={butVal}
        >
          {butVal}
        </Button>
      ) as any,
      buttonValue && <Button.Reset>Home</Button.Reset>
    ],
  });
});


app.hono.post("/imagine", async c => {
  //@ts-ignore
  // let ipAddress = "127.0.0.1"
  // try {
  //   const info = getConnInfo(c) // info is `ConnInfo`
  //   ipAddress = info.remote.address as string;
  // } catch {
  //   ipAddress = "127.0.0.1"
  // }
  // const host = c.req.header('host');
  // const path = new URL(`http://${host}/api/imagine`);
  // const req = {
  //   ip: ipAddress,
  //   method: "GET",
  //   host: c.req.header('host'),
  //   url: path.href,
  //   headers: c.req.header(),
  // };
  // const decision = await aj.protect(req);
  // if (decision.isDenied()) {
  //   //@ts-ignore
  //   const targetDate = new Date(decision.reason.resetTime);
  //   const now = new Date();

  //   // Calculate the difference in milliseconds
  //   //@ts-ignore
  //   const timeDifference = targetDate - now;

  //   // Convert to time units
  //   const seconds = Math.floor((timeDifference / 1000) % 60);
  //   const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
  //   const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
  //   const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  //   //@ts-ignore
  //   return c.text(`Time left: ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`, 429)
  // }
  const data = await c.req.json();
  const abuffer = await generateImageFlux(data.prompt)
  const buffer = Buffer.from((abuffer as any).b64_json, 'base64');
  const response = await uploadArweave("image", buffer)
  return c.json(response);
});

app.hono.post("/aicompletion", async c => {

  const data = await c.req.json();
  const response = await ask(data.prompt, data.system, data.node)
  const res = await response.json()
  return c.json((res as any));
});
app.hono.post("/saveora", async c => {
  const data = await c.req.json();
  const respo = await ky(data.url);
  const imageBuffer = await respo.arrayBuffer();
  const response = await uploadArweave("image", Buffer.from(imageBuffer))
  return c.json(response);
});
app.hono.post("/uploadarweave", async c => {

  const data = await c.req.json();
  if (data.type === "image") {
    const buffer = await generateImage(data.data)
    const response = await uploadArweave(data.type, buffer)
    return c.json(response);
  } else {
    const response = await uploadArweave(data.type, data.data)
    return c.json(response);
  }

});
devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
