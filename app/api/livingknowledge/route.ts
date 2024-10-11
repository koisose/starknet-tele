
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'
import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { askTool, ask } from '~~/apa/gaianet';
import { LivingKnowledgeTools } from '~~/apa/livingknowledge';
import { braveSearch } from '~~/apa/brave';
import ky from 'ky'
//@ts-ignore
import { convert } from 'html-to-text';
//@ts-ignore
import showdown from 'showdown'
//@ts-ignore
import sanitizeHtml from 'sanitize-html';
const token = process.env.LIVINGKNOWLEDGE_BOT
function truncateToBytes(str:any, byteLimit:any) {
    let truncatedStr = '';
    let byteCount = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        const charBytes = Buffer.byteLength(char, 'utf8'); // Get byte size of the character

        if (byteCount + charBytes > byteLimit) {
            break; // Stop if adding the character would exceed the byte limit
        }

        truncatedStr += char;
        byteCount += charBytes;
    }

    return truncatedStr;
}
const cleanHtml = (input: any) => {
    return sanitizeHtml(input, {
        allowedTags: ['b', 'i', 'u', 's', 'code', 'pre', 'a'], // Telegram supported tags
        allowedAttributes: {
            'a': ['href']  // Only allow href attribute for anchor tags
        },
        allowedSchemes: ['http', 'https']  // Allow only HTTP/HTTPS links
    });
};
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
    return ctx.reply("WELCOME TO LIVING KNOWLEDGE AI BOT ASK ANYTHING WE WILL SEARCH USING BRAVE API AND SUMMARIZE IT FOR YOU");
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
    const whatTool = await askTool(messageText as string, LivingKnowledgeTools)
    const whatFunction = await whatTool.response.json()
    if ((whatFunction as any).choices[0].message.tool_calls) {
        console.log((whatFunction as any).choices[0].message.tool_calls)
        if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "search") {
            const whatToSearch = JSON.parse((whatFunction as any).choices[0].message.tool_calls[0].function.arguments)
            const sentence = whatToSearch.sentence
            try {
                console.log("thinking")
                ctx.reply(`function calling using ${whatTool.random.subdomain}`)
                ctx.reply("searching the web")
                const result = await braveSearch(sentence.replace(/ /g, "+"))
                const answerBasedOnData = (result as any).web.results.map((a: any) => ({ title: a.title, url: a.url, description: a.description }))
                console.log(answerBasedOnData)
                const node = { subdomain: "0x6bb0eae1c886767989c4eacbee2029306901caed.us.gaianet.network", "model_name": "Phi-3-mini-4k-instruct-Q5_K_M" }
                const nodd = { subdomain: "0x9b829bf1e151def03532ab355cdfe5cee001f4b0.us.gaianet.network", "model_name": "Meta-Llama-3-8B-Instruct-Q5_K_M" }
                const qwen = { subdomain: "0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network", "model_name": "Qwen2-0.5B-Instruct-Q5_K_M" }
                ctx.reply("picking url based on the question using " + nodd.subdomain + " with model " + nodd.model_name)
                const answer = await ask(`based on this data \`\`\`${JSON.stringify(answerBasedOnData)}\`\`\` pick one that are related to this question \`${sentence}\``, `you're a url picker based on a data provided, pick the best url that are related to the question, dont hallucinate the url, only pick url from the data provided,only answer in url from the data,no explanation needed,pick only one url`, nodd)
                const theAnswer = await answer.json()
                const theURL = (theAnswer as any).choices[0].message.content
                const getTextOnly = await getTextFromWebpage(theURL)
                ctx.reply("summarizing the answer based on data from " + theURL)
                const pacinok = await ask(`based on this data \`\`\`${getTextOnly}\`\`\` answer this question \`${sentence}\``, `Based on the data provided answer the question`, qwen)
                const resulta = await pacinok.json()
                console.log((resulta as any).choices[0].message.content)
                // const summarize = await askGemini(`based on this data \`\`\`${getTextOnly}\`\`\` answer this question \`${sentence}\``, `Based on the data provided answer the question`)
                // console.log((summarize as any))
                const keyboard = new InlineKeyboard().url(theURL.replace(/\s+/g, ''), theURL.replace(/\s+/g, '')).url(`node URL:0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network`, `https://www.gaianet.ai/chat?domain=0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network`);
                return ctx.reply((resulta as any).choices[0].message.content, { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
            } catch (e) {
                //@ts-ignore
                console.log(e.message)
                //@ts-ignore
                return ctx.reply(`error please ask again`, { reply_parameters: { message_id: ctx.msg.message_id } })
            }


        }

    } else {

        try {
            ctx.reply("using our own Llama-3-8B-Instruct brain to answer this")
            console.log("using poke")
            //https://www.gaianet.ai/chat?domain=0x6bb0eae1c886767989c4eacbee2029306901caed.us.gaianet.network
            // const random = await randomNode();
            const node = { subdomain: "0x19a8e4a397cab67b97e7b537255ad903a8a9d277.us.gaianet.network", "model_name": "Llama-3-8B-Instruct" }
            const answer = await ask(ctx.message.text as string, "you're a very smart professor that can answer anything", node)
            const keyboard = new InlineKeyboard().text("search web", truncateToBytes(ctx.message.text as string, 64)).url(`Node URL: ${node.subdomain}`, `https://www.gaianet.ai/chat?domain=${node.subdomain}`);

            const finalAnswer = await answer.json()
            const converter = new showdown.Converter()
            const text = (finalAnswer as any).choices[0].message.content
            const html = converter.makeHtml(text);

            // console.log((finalAnswer as any).choices[0].message)
            return ctx.reply(cleanHtml(html), { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id }, parse_mode: 'HTML' })

        } catch (e) {
            //@ts-ignore
            // console.log(e.request.url)
            //@ts-ignore
            console.log(e.message)
            //@ts-ignore
            return ctx.reply(`error please ask again`, { reply_parameters: { message_id: ctx.msg.message_id } })
        }

        // const keyboard = new InlineKeyboard().url('Launch Faucet', "https://ethglobal.com/faucet");
        // return ctx.reply('Launch faucet', { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
    }
})

bot.on("callback_query:data", async (ctx) => {
    console.log("Unknown button event with payload", ctx.callbackQuery.data);
       //@ts-ignore
       if (!finish.includes(ctx.msgId)) {
        finish.push(ctx.msgId)
    } else {
        console.log("already answered")
        return
    }
    try {
        console.log("thinking")
        ctx.reply("searching the web")
        const result = await braveSearch(ctx.callbackQuery.data.replace(/ /g, "+"))
        const answerBasedOnData = (result as any).web.results.map((a: any) => ({ title: a.title, url: a.url, description: a.description }))
        console.log(answerBasedOnData)
        const node = { subdomain: "0x6bb0eae1c886767989c4eacbee2029306901caed.us.gaianet.network", "model_name": "Phi-3-mini-4k-instruct-Q5_K_M" }
        const nodd = { subdomain: "0x9b829bf1e151def03532ab355cdfe5cee001f4b0.us.gaianet.network", "model_name": "Meta-Llama-3-8B-Instruct-Q5_K_M" }
        const qwen = { subdomain: "0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network", "model_name": "Qwen2-0.5B-Instruct-Q5_K_M" }
        ctx.reply("picking url based on the question using " + nodd.subdomain + " with model " + nodd.model_name)
        const answer = await ask(`based on this data \`\`\`${JSON.stringify(answerBasedOnData)}\`\`\` pick one that are related to this question \`${ctx.callbackQuery.data}\``, `you're a url picker based on a data provided, pick the best url that are related to the question, dont hallucinate the url, only pick url from the data provided,only answer in url from the data,no explanation needed,pick only one url`, nodd)
        const theAnswer = await answer.json()
        const theURL = (theAnswer as any).choices[0].message.content
        const getTextOnly = await getTextFromWebpage(theURL)
        ctx.reply("summarizing the answer based on data from " + theURL)
        const pacinok = await ask(`based on this data \`\`\`${getTextOnly}\`\`\` answer this question \`${ctx.callbackQuery.data}\``, `Based on the data provided answer the question`, qwen)
        const resulta = await pacinok.json()
        console.log((resulta as any).choices[0].message.content)
        // const summarize = await askGemini(`based on this data \`\`\`${getTextOnly}\`\`\` answer this question \`${sentence}\``, `Based on the data provided answer the question`)
        // console.log((summarize as any))
        const keyboard = new InlineKeyboard().url(theURL, theURL).url(`node URL:0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network`, `https://www.gaianet.ai/chat?domain=0x4884741aa3fe9e335794f86071fa7f5991dacc5c.us.gaianet.network`);
        await ctx.answerCallbackQuery(); // remove loading animation
        return ctx.reply((resulta as any).choices[0].message.content, { reply_markup: keyboard })
    } catch (e) {
        //@ts-ignore
        console.log(e.message)
        //@ts-ignore
        return ctx.reply(`error please ask again`, { reply_parameters: { message_id: ctx.msg.message_id } })
    }

});

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