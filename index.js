require("dotenv").config();
const Discord = require("discord.js");
const moment = require("moment");
const axios = require("axios");
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
  dailyMessage();
  setInterval(function () {
    dailyMessage();
  }, 1000 * 60 * 60 * 24); // every 24 hours
  setInterval(function () {
    checkReminders();
  }, 10000); // every ten seconds
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

async function checkReminders() {
  var db = firebase.firestore();
  db.collection("users")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (!doc.data().reminders) return;

        doc.data().reminders.map(async (reminder) => {
          console.log(
            moment(
              `${reminder.datetime.split(" ")[0].split(".")[2]}-${
                reminder.datetime.split(" ")[0].split(".")[1]
              }-${reminder.datetime.split(" ")[0].split(".")[0]} ${
                reminder.datetime.split(" ")[1].split(".")[0]
              }:${reminder.datetime.split(" ")[1].split(".")[1]}`
            ).unix() < moment().unix()
          );
          if (
            moment(
              `${reminder.datetime.split(" ")[0].split(".")[2]}-${
                reminder.datetime.split(" ")[0].split(".")[1]
              }-${reminder.datetime.split(" ")[0].split(".")[0]} ${
                reminder.datetime.split(" ")[1].split(".")[0]
              }:${reminder.datetime.split(" ")[1].split(".")[1]}`
            ).unix() < moment().unix()
          ) {
            let user = await bot.users.fetch(doc.id);
            user.send(reminder.message);
            db.collection("users")
              .doc(user.id)
              .update({ reminders: firebase.firestore.FieldValue.delete() });
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

async function dailyMessage() {
  var db = firebase.firestore();
  db.collection("users")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        if (!doc.data().enabled || !doc.data().location) return;
        let user = await bot.users.fetch(doc.id);
        let embed = new Discord.MessageEmbed()
          .setTitle(`Hello ${user.username}!`)
          .setColor(0xf66464)
          .setFooter(moment().format("MMMM Do YYYY, HH:mm:ss"));
        await axios
          .get(
            `http://api.openweathermap.org/data/2.5/forecast?cnt=1&q=${
              doc.data().location
            }&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`
          )
          .then((response) => {
            embed
              .setDescription(
                `Today weather is ${
                  response.data.list[0].weather[0].main
                } and temperature will be ${Math.round(
                  response.data.list[0].main.temp_min
                )}/${Math.round(
                  response.data.list[0].main.temp_max
                )}°C.\nHave a great day!`
              )
              .setThumbnail(
                `https://openweathermap.org/img/wn/${response.data.list[0].weather[0].icon}@2x.png`
              );
            axios
              .get(`https://redpanda.pics/random`)
              .then((response) => {
                embed.setImage(response.data.url);
                user.send(embed);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
            user.send(
              "Please fix your invalid location with: **>setlocation [city] [country code]**"
            );
          });
      });
    });
}
