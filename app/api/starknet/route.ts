
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'
import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { marked } from 'marked';
import { askTool, ask,askGemini } from '~~/apa/gaianet';
import { LivingKnowledgeTools } from '~~/apa/livingknowledge';
import { braveSearch } from '~~/apa/brave';
import ky from 'ky'
//@ts-ignore
import { convert } from 'html-to-text';
//@ts-ignore
import showdown from 'showdown'
//@ts-ignore
import sanitizeHtml from 'sanitize-html';
const token = process.env.STARKNETAI_BOT
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
    return ctx.reply("WELCOME TO STARKNET AI DOCS");
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
   * Getting Started [/docs/guides/intro]
   * What is Starknet.js ? [/docs/guides/what_s_starknet.js]
   * RpcProvider object 🔌 connect to the network [/docs/guides/connect_network]
   * 🔌 Connect to an existing account [/docs/guides/connect_account]
   * 🔌 Connect a deployed contract [/docs/guides/connect_contract]
   * Interact with your contract [/docs/guides/interact]
   * Create a new contract [/docs/guides/create_contract]
   * Create an account [/docs/guides/create_account]
   * WalletAccount [/docs/guides/walletAccount]
   * Data transformation [/docs/guides/define_call_message]
   * Estimate fees [/docs/guides/estimate_fees]
   * Work with ERC20 tokens [/docs/guides/use_ERC20]
   * Events [/docs/guides/events]
   * Messages with L1 network [/docs/guides/L1message]
   * Signature [/docs/guides/signature]
   * Interact with more than one contract within one transaction [/docs/guides/multiCall]
   * Cairo Enums [/docs/guides/cairo_enum]
   * Automatic TypeScript parsing of Cairo ABI-s [/docs/guides/automatic_cairo_ABI_parsing]
   * Migrate from v5 to v6 [/docs/guides/migrate]
   * Migrate from v4 to v5 [/docs/guides/migrate_v4]
   From this topic only answer the \`[]\` no explanation necessary for example i ask what is starknet you will only answer '[/docs/guides/what_s_starknet.js]'
        `)
        const str = topicPicker;
const trimmedStr = str.replace(/[\[\]]/g, '');
    // console.log(systemMessage)
    // https://starknetjs.com/docs/guides/intro
    const web=await getTextFromWebpage(`https://starknetjs.com${trimmedStr}`)
    ctx.reply("answering based on data from documentation...")
const theAnswer= await askGemini(`based on this data \`\`\`${web as string}\`\`\` what is the answer to this question \`${messageText as string}\``,"answer the question based on the data as detailed as possible, make your answer in markdown")
const html = marked(theAnswer);
const cleanString = removeHtmlTags(html as string);
// console.log(html);    
  return ctx.reply(`${decodeHtmlEntity(cleanString) as string}\n reference: https://starknetjs.com${trimmedStr}`)
  
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