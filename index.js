require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const { reminders } = require("./db");

const bot = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
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

  // Check for due reminders every 30 seconds
  setInterval(async () => {
    const due = reminders.getPending();
    for (const reminder of due) {
      try {
        const channel = await bot.channels.fetch(reminder.channel_id).catch(() => null);
        if (channel) {
          await channel.send(`<@${reminder.user_id}> ${reminder.message}`);
        }
        reminders.markDelivered(reminder.id);
      } catch (err) {
        console.error("Failed to deliver reminder:", err);
        reminders.markDelivered(reminder.id);
      }
    }
  }, 30_000);
});

bot.on("messageCreate", async (msg) => {
  if (msg.author.id === bot.user.id) return;

  // Reply-chain: if someone replies to the bot's message, treat as chat
  if (msg.reference && !msg.content.trim().startsWith(prefix)) {
    try {
      const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId);
      if (repliedTo.author.id === bot.user.id) {
        const chatCommand = bot.commands.get(`${prefix}chat`);
        if (chatCommand) {
          const args = msg.content.split(/ +/);
          await executeCommand(chatCommand, msg, args);
        }
        return;
      }
    } catch {}
  }

  // React with emoji when @mentioned (but don't process as command)
  if (msg.mentions.has(bot.user) && !msg.content.trim().startsWith(prefix)) {
    try { await msg.react("🦊"); } catch {}
    return;
  }

  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

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
