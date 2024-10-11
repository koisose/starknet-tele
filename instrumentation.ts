
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        //@ts-ignore
        // const { Worker } = await import('bullmq');
        const { Bot, InlineKeyboard } = await import("grammy");
        const { askTool } = await import('~~/lib/gaianet');
        const { searchENS } = await import('~~/lib/ens')
        const { escapeMarkdownV2 } = await import('~~/lib/parseString')
        
        console.log("bot started")

        const SUPERFLUIDAI_BOT = process.env.SUPERFLUIDAI_BOT
        const CHAINLINKAI_BOT = process.env.CHAINLINKAI_BOT
const startMessage=escapeMarkdownV2(`I'm superfluid ai bot start asking question in your own language we will try my best to answer it, some question you can try:

- show me faucet
- wrap 0.01 eth
- unwrap 0.01 eth
- send stream 0.01 eth to koisose.lol
- stop stream to koisose.lol
- update stream 0.02 eth to koisose.lol
- list stream of koisose.lol
- check balance of koisose.lol
- check address of koisose.lol   

Any of this only work on optimism sepolia testnet for now
                `)
        // Create a new bot instance
        const bot = new Bot(SUPERFLUIDAI_BOT as string); // Replace with your bot token
        bot.api.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'help', description: 'Help & Info' },
          ]);
        // Handle the /start command
        bot.command("start", async (ctx) => {
            return ctx.reply(startMessage, {
                parse_mode: 'MarkdownV2' // Set the parse mode to Markdown
            });
        });
        bot.command("help", async (ctx) => {
            return ctx.reply(startMessage,{
                parse_mode: 'MarkdownV2' // Set the parse mode to Markdown
            });
        });
      

        // Handle all other messages
        bot.on("message", async (ctx) => {
            const messageText = ctx.message.text;

            console.log(messageText)
            try {
                const whatTool = await askTool(messageText as string)
                const whatFunction = await whatTool.json()
                if ((whatFunction as any).choices[0].message.tool_calls) {
                    console.log((whatFunction as any).choices[0].message.tool_calls)
                    if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "faucet") {
                        const keyboard = new InlineKeyboard().url('Launch Faucet', "https://ethglobal.com/faucet");
                        return ctx.reply('Launch faucet', { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
                    }

                    if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "check_balance") {
                        const rawAddress = JSON.parse((whatFunction as any).choices[0].message.tool_calls[0].function.arguments)
                        if (rawAddress.address.includes("0x")) {
                           return ctx.reply("we going to what");
                        } else {
                            const parsedAddress = await searchENS(rawAddress.address);
                           return ctx.reply((parsedAddress as any).value);
                        }


                    }
                    
                   
                    if ((whatFunction as any).choices[0].message.tool_calls[0].function.name === "check_address") {
                        try {
                            const rawAddress = JSON.parse((whatFunction as any).choices[0].message.tool_calls[0].function.arguments)
                            const parsedAddress = await searchENS(rawAddress.address);
                            const keyboard = new InlineKeyboard().url('Check address', `https://sepolia-optimism.etherscan.io/address/${(parsedAddress as any).value}`);
                            return ctx.reply(`See eth address of ${(parsedAddress as any).value}`, { reply_markup: keyboard, reply_parameters: { message_id: ctx.msg.message_id } })
                        } catch (e) {
                            //@ts-ignore
                            console.log(e.message)
                            return ctx.reply(`Some error happened please ask again`);
                        }
                        // return ctx.reply((parsedAddress as any).value);
                    }
                } else {
                    return ctx.reply((whatFunction as any).choices[0].message.content);

                }

            } catch (e) {
                //@ts-ignore
                console.log(e.message)
                return ctx.reply(`Some error happened please ask again`);
            }

        });

        // Start the bot
        bot.start();
    }

}
