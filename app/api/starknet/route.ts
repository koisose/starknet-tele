
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
import { fetchTokens, fetchPrice, fetchTransactions, fetchBalance, fetchTransactionByHash, fetchTransactionByHashTrace, fetchToken } from '~~/apa/starknet'
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
async function realBalance(amount: number, contract: string): Promise<number> {
    const provider = new Provider({
        nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
    });



    // Call the contract to extract the decimals used in the balance
    const decimalCall: Call = {
        contractAddress: contract,
        entrypoint: 'decimals',
    };
    const decimalResponse = await provider.callContract(decimalCall);

    // Calculate the actual balance
    const decimals = parseInt(decimalResponse[0].toString(), 16);
    const balance = parseInt(amount as any, 16) * 10 ** -decimals;

    return balance;
}
async function decimalBalance(amount: number, contract: string): Promise<number> {
    const provider = new Provider({
        nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7"
    });



    // Call the contract to extract the decimals used in the balance
    const decimalCall: Call = {
        contractAddress: contract,
        entrypoint: 'decimals',
    };
    const decimalResponse = await provider.callContract(decimalCall);

    // Calculate the actual balance
    const decimals = parseInt(decimalResponse[0].toString(), 16);
    const balance = parseFloat(amount as any) * 10 ** decimals;

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
function cleanMarkdown(text: string) {
    const markdownUrlRegex = /!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g;
    const popo = escapeMarkdownV2(text).replace(/\\([\[\]()])/g, "$1")
    const poci = popo.replace(markdownUrlRegex, (match) => `{{${match}}}`)
    const escapedStr = poci.replace(/([()[\]])/g, '\\$1');
    return escapedStr.replace(/{{(.*?)}}/g, (match, p1) => p1.replace(/\\([\[\]()])/g, "$1"))
        .replace(/(^|\s)\*(\w+\s+\w+)\*(\s|$)/g, '$1\\*$2\\*$3')
        .replace(/(^|\s)\*(\s|$)/g, '$1\\-$2');
}
function unixTimestampToHumanReadable(timestamp: number) {

    const date = new Date(timestamp * 1000);

    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false
    });
    const formatted2 = formatter.format(new Date(timestamp * 1000));
    return formatted2
}
function starknetHexToDec(hexAddress: string): string {
    // Remove 0x prefix if present
    const cleanHex = hexAddress.replace('0x', '');

    // Convert hex to decimal using BigInt
    const decimal = BigInt('0x' + cleanHex);

    // Return decimal as string
    return decimal.toString();
}
function numberToHex(num: any, addPrefix = true, minLength = 0) {
    if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('Input must be a valid number.');
    }
    let hex = num.toString(16).toUpperCase();
    if (minLength > 0) {
        hex = hex.padStart(minLength, '0');
    }
    return addPrefix ? `0x${hex}` : hex;
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
    return ctx.reply(escapeMarkdownV2(`WELCOME TO STARKNET AI BOT, this is some of the feature:
1. search - to search starknetjs.com documentation
2. transfer - to transfer token between starknet address
3. list of transaction - to list a transaction of particular address
4. list token - list all the token you can swap on avnu sorted from verified
5. balance - check balance of particular address only sepolia for now
6. swap - swap between token powered by AVNU
7. transaction detail - see detail of transaction

basically this bot will try to understand if your query is about search, transfer, balance, or anything that listed above, you triggering it by putting the word above in your query, for example "search what is starknet" or "please search for me what is starknet" this two query will share similar result even though different sentence
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
        const theAnswer = await askLlama(`based on this data ${allRelevantData.length > 0 ? allRelevantData[0] : ''} what is the answer to this question \`${parsedQuestion.question as string}\``, "answer the question based on the data as detailed as possible, make your answer in markdown")
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
            const allBalance = await fetchBalance(address)

            await ctx.replyWithMarkdown(cleanMarkdown(`balance of address [${address.slice(0, 5)}...${address.slice(-5)}](https://sepolia.voyager.online/contract/${address}) is:
                            \`\`\`
${//@ts-ignore
                allBalance.erc20TokenBalances.map(bal => `${bal.formattedBalance} ${bal.symbol}\n`).join('')} 
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
            const allTransactions = transactions.items.reverse()

            await ctx.replyWithMarkdown(cleanMarkdown(`${allTransactions.map((tx: any) => `${tx.type.toLowerCase()} operation ${tx.operations === null ? "" : tx.operations} at ${unixTimestampToHumanReadable(tx.timestamp)} ${tx.execution_status} with [hash](https://sepolia.voyager.online/tx/${tx.hash}):
                \`\`\`
${tx.hash}
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
        const inlineKeyboard = new InlineKeyboard().url("transfer", `${process.env.NEXT_PUBLIC_URL}/starknet/transfer?chatId=${ctx.update.message.from.id}&recipientAddress=${address}&amountToSend=${value}&symbol=${symbol}`)
        return await ctx.reply(cleanMarkdown(`Click button below to transfer ${value} ${symbol} to ${address.slice(0, 5)}...${address.slice(-5)}`), {
            reply_markup: inlineKeyboard,
        })

    }
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "transaction_detail") {
        // console.log(ctx.update.message.from.id)
        //@ts-ignore
        const hash = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).hash
        const transactionDetail = await fetchTransactionByHash(hash) as any;
        const transactionTrace = await fetchTransactionByHashTrace(hash) as any;
        const fee = await realBalance(transactionTrace.feeTransferInvocationTrace.inputs.amount.value, transactionTrace.feeTransferInvocationTrace.contract);
        return await ctx.replyWithMarkdown(cleanMarkdown(`
hash:[${transactionDetail.header.hash.slice(0, 6)}...${transactionDetail.header.hash.slice(-8)}](https://sepolia.voyager.online/tx/${transactionDetail.header.hash})
timestamp:${unixTimestampToHumanReadable(transactionDetail.header.timestamp)}
sender address:[${transactionDetail.header.contract_address.slice(0, 6)}...${transactionDetail.header.contract_address.slice(-8)}](https://sepolia.voyager.online/contract/${transactionDetail.header.contract_address})
transaction fee: ${fee} ${transactionDetail.actualFeeUnit}
execution status: ${transactionDetail.header.execution_status}
`))

    }
    //0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080 usdc on sepolia
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "swap") {
        // console.log(ctx.update.message.from.id)
        //@ts-ignore
        const sell_token = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).sell_token
        //@ts-ignore
        const buy_token = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).buy_token
        //@ts-ignore
        const value = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).value

        const tokenSell = await fetchToken(sell_token) as any
        const tokenBuy = await fetchToken(buy_token) as any
        if (tokenSell.content.length === 0) {
            return await ctx.reply(cleanMarkdown(`${sell_token} token not found`))
        }
        if (tokenBuy.content.length === 0) {
            return await ctx.reply(cleanMarkdown(`${buy_token} token not found`))
        }
        const theValue = await decimalBalance(value, tokenSell.content[0].address)
        const price = await fetchPrice(tokenSell.content[0].address, tokenBuy.content[0].address, numberToHex(theValue)) as any

        if (price.length === 0) {
            return await ctx.reply(cleanMarkdown(`price not found`))
        }
        const theRealValue = await realBalance(price[0].buyAmount, tokenBuy.content[0].address)
        const inlineKeyboard = new InlineKeyboard().url("Swap", `${process.env.NEXT_PUBLIC_URL}/starknet/swap?chatId=${ctx.update.message.from.id}&tokenFrom=${tokenSell.content[0].address}&tokenTo=${tokenBuy.content[0].address}&amount=${value}`)
        return await ctx.replyWithMarkdown(cleanMarkdown(`The estimated price of ${value} ${sell_token} is ${theRealValue} ${buy_token} using AVNU`), {
            reply_markup: inlineKeyboard,
        })
        //https://app.avnu.fi/tokenFrom=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7&tokenTo=0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080&amount=1
        //https://app.ekubo.org/?outputCurrency=USDC&amount=1&inputCurrency=ETH
    }
    // //@ts-ignore
    // if (functionToCall.choices[0].message.tool_calls[0].function.name === "deposit") {
    //     // console.log(ctx.update.message.from.id)
    //     //@ts-ignore
    //     const address = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).address
    //     //@ts-ignore
    //     const value = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).value
    //     const inlineKeyboard = new InlineKeyboard().url("Deposit", `${process.env.NEXT_PUBLIC_URL}/starknet/deposit?chatId=${ctx.update.message.from.id}&address=${address}&value=${value}`)
    //         return await ctx.replyWithMarkdown(cleanMarkdown(`You're about to deposit ${value} ETH from ethereum to starknet click deposit button below to deposit`), {
    //             reply_markup: inlineKeyboard,
    //         }) 
    // }
    // //@ts-ignore
    // if (functionToCall.choices[0].message.tool_calls[0].function.name === "withdraw") {
    //     // console.log(ctx.update.message.from.id)
    //     //@ts-ignore
    //     const address = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).address
    //     //@ts-ignore
    //     const value = JSON.parse(functionToCall.choices[0].message.tool_calls[0].function.arguments).value
    //     const inlineKeyboard = new InlineKeyboard().url("Withdraw", `${process.env.NEXT_PUBLIC_URL}/starknet/withdraw?chatId=${ctx.update.message.from.id}&address=${address}&value=${value}`)
    //         return await ctx.replyWithMarkdown(cleanMarkdown(`You're about to withdraw ${value} ETH from starknet to ethereum click withdraw button below to withdraw`), {
    //             reply_markup: inlineKeyboard,
    //         }) 
    // }
    //@ts-ignore
    if (functionToCall.choices[0].message.tool_calls[0].function.name === "list_token") {
        // console.log(ctx.update.message.from.id)
          
        //@ts-ignore
        const value = await fetchTokens() as any
        
        return await ctx.replyWithMarkdown(cleanMarkdown(`This is the list of token you can swap on avnu(only sepolia for now):
${value.content.map((val: any) => `- ${val.symbol}\n`).join('')}`))
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