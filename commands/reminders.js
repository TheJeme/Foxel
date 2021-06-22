const Discord = require("discord.js");
const firebase = require("firebase");

module.exports = {
  name: "reminders",
  description: "Shows all reminders.",
  execute(msg, args) {
    var db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .get()
      .then((doc) => {
        let embed = new Discord.MessageEmbed()
          .setTitle(`Reminders`)
          .setColor(0xf66464);
        doc.data().reminders.map((reminder, index) => {
          embed.addField(
            `[${index + 1}]`,
            `__${reminder.datetime}__: ${reminder.message}`
          );
        });
        msg.channel.send(embed);
      });
  },
};
