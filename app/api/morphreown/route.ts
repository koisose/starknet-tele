
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import { askGeminiTool2 } from '~~/apa/gemini'
import { getDataByQuery } from '~~/apa/mongo_atlas'
const token = process.env.MORPHREOWN_BOT

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')
//@ts-ignore
let finish = []
const bot = new Bot(token)
bot.on('message:text', async (ctx) => {
  //@ts-ignore
  if (!finish.includes(ctx.msgId)) {
    finish.push(ctx.msgId)
  } else {
    console.log("already answered")
    return
  }
  try{
    const checkTelegram=await getDataByQuery("telegram",{tg_id:ctx.me.id})
    if(checkTelegram.length===0){
      const inlineKeyboard = new InlineKeyboard().webApp("connect", `${process.env.NEXT_PUBLIC_URL}/morphreown`)
      return await ctx.reply("In order to use this bot,please connect your reown wallet to telegram click connect button below", {
        reply_markup: inlineKeyboard,
      })
    }
  }catch{
    const inlineKeyboard = new InlineKeyboard().webApp("connect", `${process.env.NEXT_PUBLIC_URL}/morphreown`)
    return await ctx.reply("Please connect your reown wallet to telegram click connect button below", {
      reply_markup: inlineKeyboard,
    })
    
  }
  
  
  if (ctx.message.text.includes("faucet")) {
    const inlineKeyboard = new InlineKeyboard().webApp("faucet", `https://ultimate-faucet.vercel.app`)
    return await ctx.reply("Click button below to open faucet mini app", {
      reply_markup: inlineKeyboard,
    })
  }

  const functionCalling = await askGeminiTool2(ctx.message.text + " \"\"", "you're a chatbot called morphreown you can determine which command user want to pick is it faucet, balance, transactions, or transfer")
  await ctx.reply("thinking...")
  //@ts-ignore
  console.log(functionCalling.candidates[0].content.parts[0])
  //@ts-ignore
  if (functionCalling.candidates[0].content.parts[0].functionCall) {
    //@ts-ignore
    if (functionCalling.candidates[0].content.parts[0].functionCall.name === "balance") {
      //@ts-ignore
      if(functionCalling.candidates[0].content.parts[0].functionCall.args.address===""){
        const inlineKeyboard = new InlineKeyboard().webApp("check balance", `https://ultimate-faucet.vercel.app`)
        return await ctx.reply("Click button to check balance", {
          reply_markup: inlineKeyboard,
        })
      }else{

      }
      
    }
    //@ts-ignore
    if (functionCalling.candidates[0].content.parts[0].functionCall.name === "transfer") {

    }
    //@ts-ignore
    if (functionCalling.candidates[0].content.parts[0].functionCall.name === "transactions") {

    }
  } else {
    await ctx.reply(`We can't process your text this is some of the query you can ask the bot:
- check balance
- check transaction
- transfer 0.00001 eth to koisose.lol
- open faucet`)
  }

})

export const POST = webhookCallback(bot, 'std/http')