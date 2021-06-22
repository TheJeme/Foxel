require("dotenv").config();
const Discord = require("discord.js");
const moment = require("moment");
const firebase = require("firebase");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require("./commands");
const prefix = ">";
Object.keys(botCommands).map((key) => {
  bot.commands.set(`${prefix}${botCommands[key].name}`, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

firebase.initializeApp({
  apiKey: "AIzaSyDVuW6ImazJK7hAukNx_IvnlnR8JbZjAQc",
  authDomain: "foxel-bot.firebaseapp.com",
  projectId: "foxel-bot",
  storageBucket: "foxel-bot.appspot.com",
  messagingSenderId: "879802527118",
  appId: "1:879802527118:web:0589bccf2cc6f4e3f2c8df",
  measurementId: "G-0FDNYTXXB7",
});

bot.login(TOKEN);

bot.on("ready", async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity(`${prefix}help`);
  await dailyMessage();
});

bot.on("message", (msg) => {
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

async function dailyMessage() {
  var db = firebase.firestore();
  db.collection("users")
    .get()
    .then((querySnapshot) => {
      let user;
      querySnapshot.forEach(async (doc) => {
        console.log(doc.id);
        if (!doc.data().enabled) return;
        user = await bot.users.fetch(doc.id);
        const embed = new Discord.MessageEmbed()
          .setTitle(`Good morning ${user.username}!`)
          .setDescription(
            "Today weather is clouds, and temperature will be 23/31°C. Have a great day!"
          )
          .setColor(0xf66464)
          .setFooter(moment().format("MMMM Do YYYY, HH:mm:ss"));
        user.send(embed);
      });
    });
}
