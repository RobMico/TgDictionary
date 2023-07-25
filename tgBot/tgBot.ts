import TelegramBot from 'node-telegram-bot-api';
import { DbWorker } from './db';
import { User } from './models/user';
import { Word } from './models/word';

function genRandonString(length: number): string {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charLength = chars.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}

class TgBot {
    bot: TelegramBot;
    dbWorker: DbWorker;
    async start(dbWorker: DbWorker, { botToken }: { botToken: string }) {
        this.dbWorker = dbWorker;
        this.bot = new TelegramBot(botToken, { polling: true });

        this.bot.on('callback_query', this.callbackQuery.bind(this));
        this.bot.on('message', this.gotMessage.bind(this));
    }

    async callbackQuery(query: TelegramBot.CallbackQuery) {
        try {
            const chatId = query.message.chat.id;
            let data = query.data.split('_');
            if (data.length != 2) {
                return;
            }

            if (!query.message.reply_markup) {
                return;
            }

            let counts = query.message.text.split(']')[0].replace('[', '').split('/');
            let currentNumber = parseInt(counts[0]) + 1, allCount = counts[1];
            if (!currentNumber || !allCount) {
                return;
            }

            let wordId = parseInt(data[0]), order = data[1] === 'True';

            await this.bot.editMessageText((query.message.text + (order ? '✅' : '❌')), { chat_id: chatId, message_id: query.message.message_id });
            await this.dbWorker.updateWordValue(wordId, order);

            let { word, current_test_errors, current_test_all_count } = await this.dbWorker.getWordUserList(chatId) || {};

            if (!word) {
                return await this.bot.sendMessage(chatId, `Test ended\nErrors:${current_test_errors + 1}/${current_test_all_count + 1}`);
            }

            await this.dbWorker.removeWordUserList(chatId, word, order);
            let wordFull = await this.dbWorker.getWord(word);
            let mesg = ''
            if (Math.random() > 0.5) {
                mesg = `[${currentNumber}/${allCount}]${wordFull.original}:<span class="tg-spoiler">${wordFull.translate}</span>\n<span class="tg-spoiler">${wordFull.description}</span>`;
            } else {
                mesg = `[${currentNumber}/${allCount}]${wordFull.translate}:<span class="tg-spoiler">${wordFull.original}</span>\n<span class="tg-spoiler">${wordFull.description}</span>`;
            }

            await this.bot.sendMessage(chatId, mesg, {
                parse_mode: "HTML", reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "True",
                                callback_data: `${wordFull.id}_True`
                            },
                            {
                                text: "False",
                                callback_data: `${wordFull.id}_False`
                            },

                        ]
                    ]
                }
            });
        } catch (ex) {
            console.log('callbackQuery', ex);
        }
    }

    async startTest(chatId: number, count: number) {
        try {
            let wordList = await this.dbWorker.getWordSet(count, chatId);
            if (wordList.length === 0) {
                await this.bot.sendMessage(chatId, "You have no words in your dictionary");
                return;
            }
            let first = wordList[0];
            await this.dbWorker.setUserWordSet(chatId, wordList.slice(1).map(e => e.id),);
            let mesg = `[${1}/${count}]:${first.original}:<span class="tg-spoiler">${first.translate}</span>\n<span class="tg-spoiler">${first.description}</span>`;
            await this.bot.sendMessage(chatId, mesg, {
                parse_mode: "HTML", reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "True",
                                callback_data: `${first.id}_True`
                            },
                            {
                                text: "False",
                                callback_data: `${first.id}_False`
                            },

                        ]
                    ]
                }
            });
        } catch (ex) {
            console.log('startTest', ex);
        }
    }

    async gotMessage(msg: TelegramBot.Message) {
        let command = null, data = null;
        if (msg.entities && msg.entities.length != 0) {
            if (msg.entities[0].type === 'bot_command') {
                command = msg.text.slice(msg.entities[0].offset, msg.entities[0].offset + msg.entities[0].length);
                data = msg.text.slice(msg.entities[0].offset + msg.entities[0].length);
            }
        }

        const chatId = msg.chat.id;
        let user = await this.dbWorker.getUser(chatId);
        if (!user) {
            let user = new User({ id: chatId, userId: msg.from.id, username: msg.from.username, name: [msg.from.first_name, msg.from.last_name].join(' ') });
            await this.dbWorker.insertUser(user);
            await this.bot.sendMessage(chatId, 'Hi, to add word just write it in such format:`word-translation-description`');
            return;
        }

        switch (command) {
            case "/web_token":
                if (user.webhash) {
                    await this.bot.sendMessage(chatId, 'Token:`' + user.webhash + '`', { parse_mode: "MarkdownV2" });
                    break;
                }
            case "/change_web_token":
                let token = genRandonString(20);
                await this.dbWorker.setUserSession(chatId, token);
                await this.bot.sendMessage(chatId, 'Token:`' + token + '`', { parse_mode: "MarkdownV2" });
                break;
            case "/daily":
                await this.startTest(chatId, 100);
                break;
            case "/test":
                let count = parseInt(data) || 10;
                await this.startTest(chatId, count);
                break;
            case null:
                let texts = msg.text.split('-');
                if (texts.length >= 2) {
                    let description = texts[2] || '';
                    let word = new Word({ userId: chatId, original: texts[0].trim(), translate: texts[1].trim(), description: description.trim() });
                    await this.dbWorker.insertWord(word);
                    await this.bot.sendMessage(chatId, 'Saved');
                } else {
                    await this.bot.sendMessage(chatId, 'Invalid');
                }
        }

    }
}

export { TgBot };

// daily - daily test
// test - 10 questions by default, set count like /test 25
// web_token - get web token
// change_web_token - chanege web token

