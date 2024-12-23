require("dotenv").config();
const Discord = require("discord.js");
const { Intents } = require("discord.js");
const bot = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ],
});
bot.commands = new Discord.Collection();
const botCommands = require("./commands");
const prefix = ">";
Object.keys(botCommands).forEach((key) => {
  bot.commands.set(`${prefix}${botCommands[key].name}`, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", async () => {
  console.info(`Logged in as ${bot.user.tag}`);
  bot.user.setActivity(`${prefix}help`);
});

bot.on("messageCreate", (msg) => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (msg.author.bot) return;
  if (!command.startsWith(prefix)) return;

  console.info(`Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args, bot);
  } catch (error) {
    console.error(error);
    msg.reply("there was an error trying to execute that command!");
  }
});