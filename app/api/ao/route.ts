
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'
import { Bot, webhookCallback} from 'grammy'
import { marked } from 'marked';
import { askGemini } from '~~/apa/gaianet';

import ky from 'ky'
//@ts-ignore
import { convert } from 'html-to-text';

const token = process.env.AOAI_BOT

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')
async function getTextFromWebpage(url: string) {
    try {
        // Fetch the text content of the webpage
        const response = await ky.get(url).text();


        // Extract only the text, without any HTML tags
        const textContent = convert(response, {
            wordwrap: false,  // Keeps long words from being broken
            ignoreHref: true, // Optional: Ignore anchor links
            ignoreImage: true // Optional: Ignore image tags
        });;

        // Log the plain text content
        return textContent.trim();

    } catch (error) {
        console.error('Error fetching webpage:', error);
        return url

    }
}
//@ts-ignore
let finish = []
const bot = new Bot(token)
bot.command("start", async (ctx) => {
       //@ts-ignore
       if (!finish.includes(ctx.msgId)) {
        finish.push(ctx.msgId)
    } else {
        console.log("already answered")
        return
    }
    return ctx.reply("WELCOME TO AO ARWEAVE AI DOCS");
});
function handleTimeout() {
    // Define your custom timeout handling logic here
    console.error('A request timed out.');
}

bot.on('message', async (ctx) => {
    //@ts-ignore
    if (!finish.includes(ctx.msgId)) {
        finish.push(ctx.msgId)
    } else {
        console.log("already answered")
        return
    }


    const messageText = ctx.message.text;
 
    ctx.reply("picking topic")
   
     const topicPicker=await askGemini(messageText as string,`you're a topic picker you gonna pick from a list of topic based on a question for example
        this is the list of topic:
   WELCOME

[/welcome/index.html]

Getting Started

[/welcome/getting-started.html]


TESTNET INFO

[/welcome/testnet-info/index.html]

Quests

[/welcome/testnet-info/quests.html]


TUTORIALS

[/tutorials/index.html]


BEGIN

[/tutorials/begin/index.html]

Preparations

[/tutorials/begin/preparations.html]

Messaging

[/tutorials/begin/messaging.html]

Create a Chatroom

[/tutorials/begin/chatroom.html]

Build a Token

[/tutorials/begin/token.html]

Tokengating

[/tutorials/begin/tokengating.html]



BOTS AND GAMES

[/tutorials/bots-and-games/index.html]

Let's Play A Game

[/tutorials/bots-and-games/ao-effect.html]

Interpreting Announcements

[/tutorials/bots-and-games/announcements.html]

Fetching Game State

[/tutorials/bots-and-games/game-state.html]

Strategic Decisions

[/tutorials/bots-and-games/decisions.html]

Automated Responses

[/tutorials/bots-and-games/attacking.html]

Bringing it Together

[/tutorials/bots-and-games/bringing-together.html]

Mechanics of the Arena

[/tutorials/bots-and-games/arena-mechanics.html]

Expanding the Arena

[/tutorials/bots-and-games/build-game.html]


GUIDES

[/guides/index.html]


AOS

[/guides/aos/index.html]

Introduction

[/guides/aos/intro.html]

Installing

[/guides/aos/installing.html]

CLI

[/guides/aos/cli.html]

Prompt Customization

[/guides/aos/prompt.html]

A Ping-Pong Server

[/guides/aos/pingpong.html]

Setting up your Editor

[/guides/aos/editor.html]

Understanding the Inbox

[/guides/aos/inbox-and-handlers.html]

Troubleshooting w/ao.link

[/guides/aos/troubleshooting.html]

FAQ

[/guides/aos/faq.html]

.load

[/guides/aos/load.html]

Build a Token

[/guides/aos/token.html]

BLUEPRINTS

[/guides/aos/blueprints/index.html]

Chatroom Blueprint

[/guides/aos/blueprints/chatroom.html]

CRED Utils Blueprint

[/guides/aos/blueprints/cred-utils.html]

Staking Blueprint

[/guides/aos/blueprints/staking.html]

Token Blueprint

[/guides/aos/blueprints/token.html]

Voting Blueprint

[/guides/aos/blueprints/voting.html]

MODULES

[/guides/aos/modules/index.html]

JSON

[/guides/aos/modules/json.html]

ao

[/guides/aos/modules/ao.html]

crypto

[/guides/aos/modules/crypto.html]

Base64

[/guides/aos/modules/base64.html]

Pretty

[/guides/aos/modules/pretty.html]

Utils

[/guides/aos/modules/utils.html]


AOCONNECT

[/guides/aoconnect/aoconnect.html]

Installing aoconnect

[/guides/aoconnect/installing-connect.html]

Connecting to nodes

[/guides/aoconnect/connecting.html]

Sending Messages

[/guides/aoconnect/sending-messages.html]

Reading Results

[/guides/aoconnect/reading-results.html]

Spawning Processes

[/guides/aoconnect/spawning-processes.html]

Calling DryRun

[/guides/aoconnect/calling-dryrun.html]

Monitoring Cron

[/guides/aoconnect/monitoring-cron.html]

Assign Data

[/guides/aoconnect/assign-data.html]


0RBIT

[/guides/0rbit/index.html]

First GET Request

[/guides/0rbit/get-request.html]

First POST Request

[/guides/aoconnect/post-request.html]


CONCEPTS

[/concepts/index.html]

Specifications

[/concepts/specs.html]

Messages

[/concepts/messages.html]

Processes

[/concepts/processes.html]

Units

[/concepts/units.html]

How messaging works

[/concepts/how-it-works.html]

A whistle stop tour of Lua

[/concepts/lua.html]

The aos interface

[/concepts/tour.html]


REFERENCES

[/references/index.html]

Lua

[/references/lua.html]

Web Assembly

[/references/wasm.html]

ao Module

[/references/ao.html]

handlers

[/references/handlers.html]

Token

[/references/token.html]

Loading Data

[/references/data.html]

CRON Messages

[/references/cron.html]

ao Editor Setup

[/references/editor-setup.html]

Community

[/references/community.html]
   From this topic only answer the \`[]\` no explanation necessary for example i ask "what is ao" you will only answer '[/guides/aos/modules/ao.html]' if there is no answer just answer '[]'
        `)
        const str = topicPicker;
const trimmedStr = str.replace(/[\[\]]/g, '');
    // console.log(systemMessage)
    // https://starknetjs.com/docs/guides/intro
   
    const web=await getTextFromWebpage(`https://cookbook_ao.arweave.dev${trimmedStr}`)
    ctx.reply("answering based on data from documentation...")
const theAnswer= await askGemini(`based on this data \`\`\`${web as string}\`\`\` what is the answer to this question \`${messageText as string}\``,"answer the question based on the data as detailed as possible, make your answer in markdown")
const html = marked(theAnswer);
const cleanString = removeHtmlTags(html as string);
// console.log(html);    
  return ctx.reply(`${decodeHtmlEntity(cleanString).replace(/&quot;/g, '"') as string}\n reference: https://cookbook_ao.arweave.dev${trimmedStr}`)
  
})
function removeHtmlTags(str:string) {
    return str.replace(/<[^>]*>/g, '');
  }
  function decodeHtmlEntity(str:any) {
    return str.replace(/&#(\d+);/g, (match:any, dec:any) => String.fromCharCode(dec));
  }

bot.catch((err) => {
    const ctx = err.ctx;
    console.log(ctx)
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    return ctx.reply(`error please search again}`)
});

export const POST = webhookCallback(bot, 'std/http', {
    onTimeout: handleTimeout,
    timeoutMilliseconds: 60000,  // Set timeout to 60 seconds
})