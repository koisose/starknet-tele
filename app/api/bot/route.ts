
export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { Bot, webhookCallback } from 'grammy'

const token = process.env.SUPERFLUIDAI_BOT

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

const bot = new Bot(token)
bot.on('message:text', async (ctx) => {
    console.log("dsa")
  await ctx.reply(ctx.message.text)
})

export const POST = webhookCallback(bot, 'std/http')