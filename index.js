require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.commands = new Collection();
const botCommands = require("./commands");
const prefix = ">";

Object.keys(botCommands).forEach((key) => {
  bot.commands.set(`${prefix}${botCommands[key].name}`, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}`);
  bot.user.setActivity(`${prefix}help`);
});

bot.on("messageCreate", (msg) => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (msg.author.bot) return;

  if (!command.startsWith(prefix)) return;

  console.info(`Called command: ${command}`);

  try {
    if (bot.commands.has(command)) {
      bot.commands.get(command).execute(msg, args, bot);
    } else {
      bot.commands.get(`${prefix}chat`).execute(msg, args, bot);
    }
  } catch (error) {
    console.error(error);
    msg.reply("there was an error trying to execute that command!");
  }
});