/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "~~/frog-ui/ui";
import { generateImageModal, ask,generateImageFlux } from '~~/apa/gaianet'
import arcjet, { fixedWindow } from "@arcjet/node";
import { getConnInfo } from 'hono/cloudflare-workers'
import { uploadArweave, generateImage } from '~~/apa/create-image'
import { validateFramesMessage } from "@airstack/frames";
import { init } from "@airstack/frames";

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
    }, {
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      match: "/api/panda", // match all requests to /api/hello
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
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "SUPER FRAME",
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
