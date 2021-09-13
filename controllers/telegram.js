const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID; //use getChatId() to get chat id first time

const bot = new TelegramBot(token, { polling: true });

const getUserTelegramId = () => {
  bot.onText(/\/getId (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, chatId);
  });
};

const notifyUpdateTelegram = (message, payload) => {
  if (payload.length === 0) return;

  const normalizedPayload = payload.map((game) => {
    return { title: game.title, price: game.price, link: game.href };
  });
  try {
    bot.sendMessage(
      chatId,
      `The following game${
        normalizedPayload.length > 0 && 's'
      } reached the target price` +
        '\n\n<pre>' +
        JSON.stringify(normalizedPayload, null, 2) +
        '</pre>',
      {
        parse_mode: 'html',
      }
    );
    console.log('Notification sended via Telegram');
  } catch (err) {
    console.log(
      'Something went wrong when trying to send a Telegram notification',
      err
    );
  }
};

module.exports = {
  getUserTelegramId,
  notifyUpdateTelegram,
};
