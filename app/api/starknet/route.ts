
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'
import { Bot, webhookCallback, InlineKeyboard, Context } from 'grammy'
import { marked } from 'marked';
import { askGemini } from '~~/apa/gaianet';
import { getDataByAggregate } from '~~/apa/mongo_atlas'
import { makeEmbedding, askGeminiTool } from '~~/apa/gemini'
import { Provider, Call, validateAndParseAddress } from 'starknet'
import { toBigInt, toNumber } from 'ethers'
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import { fetchTransactions } from '~~/apa/starknet'
import { searchKnowledge } from '~~/apa/brian'
import { askTool, embedding, askLlama } from '~~/apa/akash'
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { timeStamp } from 'console';

const token = process.env.STARKNETAI_BOT
//https://github.com/extrimian/starknet-balance/blob/master/src/index.ts

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

function removeHtmlTags(str: string) {
    return str.replace(/<[^>]*>/g, '');
}
function decodeHtmlEntity(str: any) {
    return str.replace(/&#(\d+);/g, (match: any, dec: any) => String.fromCharCode(dec));
}
function replaceSpecialCharacter(str: string) {
    return str.replace(/&quot;/g, '"');
}
async function getBalance(address: string, contract: string): Promise<number> {
    const provider = new Provider({
        nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
    });

    // Validate the Starknet address
    if (!address || !address.match(/^0x[0-9a-fA-F]+$/)) {
        throw new Error("not a starknet address")
    }

    const ethTokenContract = contract;
    const accountContract = toBigInt(address).toString();

    // Call the contract to get the account's balance
    const balanceCall: Call = {
        contractAddress: ethTokenContract,
        entrypoint: 'balanceOf',
        calldata: [accountContract],
    };
    const balanceResponse = await provider.callContract(balanceCall);

    // Call the contract to extract the decimals used in the balance
    const decimalCall: Call = {
        contractAddress: ethTokenContract,
        entrypoint: 'decimals',
    };
    const decimalResponse = await provider.callContract(decimalCall);

    // Calculate the actual balance
    const decimals = parseInt(decimalResponse[0].toString(), 16);
    const balance = parseInt(balanceResponse[0].toString(), 16) * 10 ** -decimals;

    return balance;
}
function escapeMarkdownV2(text: string) {
    text = text.replace(/(^|\s)(####|###|##|#)\s*(\S.*)/g, (match, prefix, hash, content) => {
        return `${prefix}*${content}*`;
    });

    // Replace all instances of '**' with '*'
    text = text.replace(/\*\*/g, '*');
    const reservedCharacters = /([_[\]()~>#+\-=|{}.!])/g; // Removed '\\' from regex
    text = text.replace(reservedCharacters, '\\$1');

    // Unescape any Markdown URLs of the format []()
    // Remove any '\' from Markdown links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '[$1]($2)');

    // Replace all instances of "\'\'" with "'"
    return text.replace(/\\'\\'/g, "'");
}
function cleanMarkdown(text:string){
    const markdownUrlRegex = /!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g;
    const popo = escapeMarkdownV2(text).replace(/\\([\[\]()])/g, "$1")
    const poci = popo.replace(markdownUrlRegex, (match) => `{{${match}}}`)
    const escapedStr = poci.replace(/([()[\]])/g, '\\$1');
    return escapedStr.replace(/{{(.*?)}}/g, (match, p1) => p1.replace(/\\([\[\]()])/g, "$1"))
                      .replace(/(^|\s)\*(\w+\s+\w+)\*(\s|$)/g, '$1\\*$2\\*$3')
                      .replace(/(^|\s)\*(\s|$)/g, '$1\\-$2');
                    }
//@ts-ignore
let finish = []
const bot = new Bot<ParseModeFlavor<Context>>(token)
bot.use(hydrateReply);

// Sets default parse_mode for ctx.reply
bot.api.config.use(parseMode("MarkdownV2"));
bot.command("start", async (ctx) => {
    //@ts-ignore
    if (!finish.includes(ctx.msgId)) {
        finish.push(ctx.msgId)
    } else {
        console.log("already answered")
        return
    }
    return ctx.reply(escapeMarkdownV2(`WELCOME TO STARKNET AI DOCS, using this bot you can interact with starknet blockchain only using your own natural language no need to use bot language like /balance, /transfer, /search or whatnot just use your natural language, there are three functionalities,
search documentation, get balance of an address, transfer eth to an address, this some of the example query to interact with this bot:
1. search about how to use starknet?

2. transfer 0.00001 to this address 0x00fb75ec33b0f6e8664273511cfd7b6eec0763e99d0b6980a95263f077c7e1c0

3. what is the balance of this address 0x00fb75ec33b0f6e8664273511cfd7b6eec0763e99d0b6980a95263f077c7e1c0

basically this bot will try to understand if your query is about search, transfer or check balance
`));
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
    //@ts-ignore
    if (messageText.includes("###")) {
        return
    }
    await ctx.reply("thinking")

    const functionToCall = await askTool(messageText as string);
    console.log(JSON.stringify(functionToCall))
    //https://app.ekubo.org/
    if (functionToCall?.choices[0].finish_reason !== "tool_calls") {
        return ctx.reply(escapeMarkdownV2(`sorry we can't understand your query, this is an example query you can try:
1. search about how to use starknet?

2. transfer 0.00001 to this address 0x00fb75ec33b0f6e8664273511cfd7b6eec0763e99d0b6980a95263f077c7e1c0

3. what is the balance of this address 0x00fb75ec33b0f6e8664273511cfd7b6eec0763e99d0b6980a95263f077c7e1c0 `))
    }
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "search_documentation") {
        //@ts-ignore
        const parsedQuestion = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments)
        //@ts-ignore
        const embed = await embedding(parsedQuestion.question)
        const allData = await getDataByAggregate("starknet", [
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'vectorContent',
                    'queryVector': embed,
                    'numCandidates': 22,
                    'limit': 1
                }
            }, {
                '$project': {
                    '_id': 1,
                    'url': 1,
                    'title': 1,
                    'content': 1,
                    'score': {
                        '$meta': 'vectorSearchScore'
                    }
                }
            }
        ])
        
        const sorted = allData.sort((a, b) => b.score - a.score);
        const allRelevantData = sorted.map(a => a.content)
        const allURL = sorted.map(a => escapeMarkdownV2(a.url))
        //@ts-ignore
        const theAnswer = await askLlama(`based on this data ${allRelevantData.length>0?allRelevantData[0]:''} what is the answer to this question \`${parsedQuestion.question as string}\``, "answer the question based on the data as detailed as possible, make your answer in markdown")
        //@ts-ignore
            await ctx.replyWithMarkdown(cleanMarkdown(theAnswer?.choices[0].message.content as string))
        return ctx.reply(`reference is from this url ${allURL[0]}`)
    }
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "get_balance") {
        //@ts-ignore
        const address = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).address
        //https://free-rpc.nethermind.io/sepolia-juno/v0_7
        try {
            const ethBalance = await getBalance(address, "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
            const strkBalance = await getBalance(address, "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d")
            await ctx.replyWithMarkdown(cleanMarkdown(`balance of address [${address.slice(0,5)}...${address.slice(-5)}](https://sepolia.voyager.online/contract/${address}) is:
                \`\`\`
${ethBalance.toString()} ETH
${strkBalance.toString()} STRK
            \`\`\`
            `))
        } catch (e) {
            //@ts-ignore
            console.log(e.message)
            ctx.reply("there is some error please try again")
        }
        return
    }
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "list_transaction") {
        //@ts-ignore
        const address = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).address
        //https://free-rpc.nethermind.io/sepolia-juno/v0_7
        try {
            const transactions = await fetchTransactions(address)
            //@ts-ignore
            const allTransaction = transactions.items.map(item => ({
                tokenSymbol: item.tokenSymbol,
                transferValue: item.transferValue,
                transferFrom: item.transferFrom,
                transferTo: item.transferTo,
                transfer: item.transferTo === address ? 'IN' : 'OUT',
                txHash: item.txHash,
                timestamp:item.timestamp
            })).reverse();

            await ctx.replyWithMarkdown(cleanMarkdown(`${allTransaction.map((tx: any) => `[transaction hash](https://sepolia.voyager.online/tx/${tx.txHash}) ${new Date(tx.timestamp * 1000).toLocaleString('en-US', { hour12: false })}
                \`\`\`
transfer ${tx.transfer} ${tx.transferValue} ${tx.tokenSymbol} from ${tx.transferFrom.slice(0,5)}...${tx.transferFrom.slice(-5)} to ${tx.transferTo.slice(0,5)}...${tx.transferTo.slice(-5)} 
                \`\`\`\n`).join('\n')}`));
        } catch (e) {
            //@ts-ignore
            console.log(e.message)
            ctx.reply("there is some error please try again")
        }
        return
    }
 //@ts-ignore
 if (functionToCall.choices[0].message.tool_calls[0].function.name === "transfer") {
    // console.log(ctx.update.message.from.id)
    //@ts-ignore
    const address = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).address
    //@ts-ignore
    const value = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).value
    //@ts-ignore
    const symbol = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).symbol
    //https://free-rpc.nethermind.io/sepolia-juno/v0_7
    const inlineKeyboard = new InlineKeyboard().url("transfer", `${process.env.NEXT_PUBLIC_URL}/starknet?chatId=${ctx.update.message.from.id}&recipientAddress=${address}&amountToSend=${value}&symbol=${symbol}`)
    return await ctx.reply(cleanMarkdown(`Click button below to transfer ${value} ${symbol} to ${address.slice(0,5)}...${address.slice(-5)}`), {
      reply_markup: inlineKeyboard,
    })
    
}

})


bot.catch((err) => {
    const ctx = err.ctx;
    console.log(ctx)
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    return ctx.reply(`error please search again`)
});

export const POST = webhookCallback(bot, 'std/http', {
    onTimeout: handleTimeout,
    timeoutMilliseconds: 60000,  // Set timeout to 60 seconds
})