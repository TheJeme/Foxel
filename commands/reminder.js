const Discord = require("discord.js");
const firebase = require("firebase");

module.exports = {
  name: "reminder",
  description: "Shows the reminder.",
  execute(msg, args) {
    const db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .get()
      .then((doc) => {
        if (!doc.data().reminders) {
          msg.channel.send(
            "You don't have reminder set.\nMake one with: **>addreminder [date] [time] [message]**"
          );
          return;
        }

        let embed = new Discord.MessageEmbed()
          .setTitle(`Reminder`)
          .setColor(0xf66464);
        doc.data().reminders.map((reminder, index) => {
          embed.addField(`**${reminder.datetime}**`, `${reminder.message}`);
        });
        msg.channel.send(embed);
      });
  },
};
