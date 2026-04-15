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

async function executeCommand(command, msg, args) {
  try {
    await Promise.resolve(command.execute(msg, args, bot));
  } catch (error) {
    console.error(`Failed to execute command ${command.name}:`, error);

    try {
      await msg.reply(`the \`${command.name}\` command failed. please try again later.`);
    } catch (replyError) {
      console.error(`Failed to send command error for ${command.name}:`, replyError);
    }
  }
}

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

bot.login(DISCORD_BOT_TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}`);
  bot.user.setActivity(`${prefix}help`);
});

bot.on("messageCreate", async (msg) => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (msg.author.bot) return;

  if (!command.startsWith(prefix)) return;

  console.info(`Called command: ${command}`);

  const resolvedCommand = bot.commands.get(command) || bot.commands.get(`${prefix}chat`);

  if (!resolvedCommand) {
    console.error(`No command handler found for ${command} and no chat fallback is registered.`);
    await msg.reply("that command is unavailable right now.");
    return;
  }

  await executeCommand(resolvedCommand, msg, args);
});
