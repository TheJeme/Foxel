const Discord = require("discord.js");

module.exports = {
  name: "invite",
  description: "Sends invitation link on this bot with right permissions.",
  execute(msg, args, bot) {
    let embed = new Discord.MessageEmbed()
      .setAuthor("Foxel Invitation Link", bot.user.displayAvatarURL())
      .setColor(0xf66464)
      .setDescription(
        "https://discord.com/api/oauth2/authorize?client_id=855042237687791646&permissions=8&scope=bot"
      );
    msg.channel.send(embed);
  },
};
