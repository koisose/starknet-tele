
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { askTool } from '~~/apa/gaianet';
import { chainlinkTools } from '~~/apa/chainlink';
import { searchENS } from '~~/apa/ens';
import { formatEther, isAddress,http, createPublicClient } from 'viem'
import { optimismSepolia,baseSepolia } from 'viem/chains'
import { Alchemy, Network, Utils } from "alchemy-sdk";

const token = process.env.CHAINLINKAI_BOT

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

const bot = new Bot(token)
bot.command("start", async (ctx) => {
    return ctx.reply("WELCOME TO CHAINLINK CCIP AI CHATBOT POWERED BY GAIANET AI");
});
let finish = [] as any
bot.on('message', async (ctx) => {
    if (!finish.includes(ctx.msgId)) {
        finish.push(ctx.msgId)
    } else {
        console.log("already answered")
        return
    }
    console.log(ctx.message.text)
    
    const messageText = ctx.message.text;
    const whatTool = await askTool(messageText as string, chainlinkTools)
    const whatFunction = await whatTool.response.json()
    console.log(whatFunction)
    if ((whatFunction as any).choices[0].message.tool_calls) {
        console.log((whatFunction as any).choices[0].message.tool_calls)
        if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "faucet") {
            const keyboard = new InlineKeyboard().url('Launch Faucet', "https://ethglobal.com/faucet");
            return ctx.reply('Launch faucet', { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
        }
        if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "check_balance") {
            const settings = {
                apiKey: process.env.ALCHEMY as string,
                network: Network.ETH_MAINNET,
              };
              const alchemy = new Alchemy(settings);        
            try {
                const address = JSON.parse((whatFunction as any).choices[0].message.tool_calls[0].function.arguments).address
                if (address.includes("0x")) {
                    if (isAddress(address)) {
                        let balance = await alchemy.core.getBalance((address as any).value, 'latest');
                        balance = (Utils.formatEther(balance) as any);
                          return ctx.reply(`${address} balance is ${balance} ETH`)
                    } else {
                        return ctx.reply(`${address} is not an ethereum address`)
                    }
                } else {
                    const addresss = await searchENS(address as string)
                    const publicClient= createPublicClient({
  chain: optimismSepolia,
  transport: http(),
})
const balance = await publicClient.getBalance({
    address: (addresss as any).value,
    blockTag: 'safe'
  })
  const balanceAsEther = formatEther(balance) 
                    // console.log((addresss as any).value.toLowerCase())
                    // let balance = await alchemy.core.getBalance((addresss as any).value, 'latest');
                    // balance = (Utils.formatEther(balance) as any);
                    
                    // console.log(balance)
                    // let balance = await alchemy.core.getBalance((addresss as any).value, 'latest');
                    // balance = (Utils.formatEther(balance) as any);
                      return ctx.reply(`${(addresss as any).value} balance is ${balanceAsEther} ETH`)
                }
                // const keyboard = new InlineKeyboard().url('Launch Faucet', "https://ethglobal.com/faucet");
                // return ctx.reply('Balance', { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
            } catch (e) {
                console.log(e.message)
                return ctx.reply('Error please ask again', { reply_parameters: { message_id: ctx.msg.message_id } })
            }

        }
    }
})

export const POST = webhookCallback(bot, 'std/http',{   timeoutMilliseconds: 60000, })