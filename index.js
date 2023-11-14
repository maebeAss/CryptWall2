// import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
// import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
require('dotenv').config()
const text = require('./const')
const funcs = require("./functions.js");
const ERC20 = require('./jacket.json');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply(`Привет ${ctx.message.from.first_name ? ctx.message.from.first_name : 'Привет!'}!`));
bot.help((ctx) => ctx.reply(text.commands));

bot.command('balanceETH', async (ctx) => {
    let balance_eth = await funcs.getBalanceETH("amount");
    ctx.reply(`${balance_eth} ETH`);
})

bot.command('balanceERC20', async(ctx) =>{
    let balance_erc20 = await funcs.getBalanceERC20(ERC20.ERC20, "amount");
    let balance_erc20_symbol = await funcs.getBalanceERC20(ERC20.ERC20, "symbol");
    ctx.reply(`${balance_erc20} ${balance_erc20_symbol}`);
})

bot.command('sendETH', async(ctx) => {
    let get_address, get_amount;
    ctx.reply('Адрес кошелька?')
    bot.hears(/^0x\w+/, async (ctx) => {
        get_address = ctx.message.text;  
        ctx.reply('Сколько перевести?')
        bot.hears(/^\d+/, async (ctx) => {
            get_amount = ctx.message.text;
            let getBalanceETH = await funcs.getBalanceETH('amount'); {
                if (getBalanceETH >= get_amount) {
                    let sendETH = await funcs.sendETH(get_address, get_amount);
                }
                else {
                    ctx.reply('Недостаточно Средств');
                }
            }
        });
    });
});

bot.command ("sendERC20", async (ctx) => {
    ctx.replyWithHTML("Введите по формуле:\n\nадресТокена адресКому кол-во");
    bot.on ("text", async (ctx) => {
        const get_form_message = ctx.message.text.split(" ");

        if ( get_form_message.length === 3 && get_form_message[0].startsWith("0x") && get_form_message[1].startsWith("0x") && !isNaN(get_form_message[2]) ) {
            const get_address_token_send = get_form_message[0];
            const get_address = get_form_message[1];
            const get_amount = get_form_message[2];
            const get_balance_erc20 = await funcs.getBalanceERC20(ERC20.nodeUrl, ERC20.ERC20, get_address_token_send, "amount");

            if ( get_balance_erc20 >= get_amount ) {
                let get_chain_id = await funcs.getBalanceETH("id");
                let send_erc20 = await funcs.sendERC20(ERC20.ERC20, get_address_token_send, get_address, get_amount);

                if ( get_chain_id === 97n ) {
                    ctx.replyWithHTML(`https://testnet.bscscan.com/tx/${send_erc20}`);
                } else {
                    ctx.replyWithHTML(`<code>${send_erc20}</code>`);
                }
            } else {
                ctx.replyWithHTML("Недостаточно средств");
            }
        } else {
            ctx.reply("error");
        }
    });
});

// bot.command('sendERC20', (ctx) => {
//     let get_tokenAdress, get_address, get_amount;
//     ctx.reply('Адрес конратка токена?')
//     bot.hears(/^0x\w+/, async (ctx) => {
//         get_tokenAdress = ctx.message.text;
//         ctx.reply('Адрес кошелька?')
//         bot.hears(/^0x\w+/, async (ctx) => {
//             get_address = ctx.message.text;
//             ctx.reply('Сколько перевести?')
//             bot.hears(/^\d+/, async (ctx) => {
//                 get_amount = ctx.message.text;
//                 let getBalanceERC20 = await funcs.getBalanceERC20('amount'); {
//                     if (getBalanceERC20 >= get_amount) {
//                         let sendERC20 = await funcs.sendERC20(get_tokenAdress, get_address, get_amount);
//                     }
//                     else {
//                         ctx.reply('Недостаточно Средств');
//                     }
//                 }    
//             });
//         });
//     });
// });

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))