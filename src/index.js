const dotenv = require('dotenv');
const http = require('http');
const { Telegraf, Markup } = require('telegraf');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in environment.');
  process.exit(1);
}

const bot = new Telegraf(token);

const inviteText =
  "Сонце, В мене є для тебе невеличкий сюрприз. ✨\n" +
  "Ти будеш моїм Валентином? 💌";

const yesRevealText =
  "Так! Ти щойно змусила моє серце шалено битися 💖\n" +
  "Хочу запросити тебе на особливу вечерю в ресторані ✨\n" +
  "Дата: 14 лютого 💌\n" +
  "Час: 19:00 🕖\n" +
  "Місце: тримаю інтригу 😉🍷";

const wrongAnswerText =
  "Ой, відповідь неправильна. Спробуй ще раз, кохана. 😘";

const keyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('Звісно', 'answer_yes'),
    Markup.button.callback('Ні', 'answer_no'),
    Markup.button.callback('Можливо', 'answer_maybe')
  ]
]);

const startMessageByChat = new Map();

bot.start(async (ctx) => {
  const msg = await ctx.reply(inviteText, keyboard);
  startMessageByChat.set(ctx.chat.id, msg.message_id);
});

bot.action('answer_yes', async (ctx) => {
  await ctx.answerCbQuery('Ти обрав "Так" 💖');
  const chatId = ctx.chat.id;
  const messageId = ctx.callbackQuery?.message?.message_id;
  const startMessageId = startMessageByChat.get(chatId);
  if (messageId && startMessageId && messageId === startMessageId) {
    await ctx.editMessageReplyMarkup(null);
  } else {
    await ctx.deleteMessage();
  }
  await ctx.reply(yesRevealText);
});

bot.action(['answer_no', 'answer_maybe'], async (ctx) => {
  await ctx.answerCbQuery('Відповідь неправильна');
  const chatId = ctx.chat.id;
  const messageId = ctx.callbackQuery?.message?.message_id;
  const startMessageId = startMessageByChat.get(chatId);
  if (messageId && startMessageId && messageId === startMessageId) {
    await ctx.editMessageReplyMarkup(null);
  } else {
    await ctx.deleteMessage();
  }
  await ctx.reply(wrongAnswerText, keyboard);
});

bot.launch().then(() => {
  console.log('Valentine bot is running.');
});

const healthPort = Number(process.env.PORT || 8000);
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  })
  .listen(healthPort, '0.0.0.0', () => {
    console.log(`Health check server listening on ${healthPort}`);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
