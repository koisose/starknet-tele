
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'
import { Bot, webhookCallback } from 'grammy'
import { marked } from 'marked';
import { askOpenAISystem } from '~~/apa/openai';
import ky from 'ky'
//@ts-ignore
import { convert } from 'html-to-text';

const token = process.env.SWAPPERAI_BOT




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
    return ctx.reply("WELCOME TO SWAP AI BOT");
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
console.log("dsasda")

    const messageText = ctx.message.text;
    const generated=await askOpenAISystem()
    console.log(generated)
    return ctx.reply("picking topic")
    
  
  
})


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