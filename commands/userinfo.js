const Discord = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Shows user info.",
  async execute(msg, args, bot) {
    if (args.length !== 1) {
      let embed = new Discord.MessageEmbed()
        .setTitle(`User Information`)
        .setThumbnail(msg.author.avatarURL())
        .setColor(0xf66464)
        .addField("Name", msg.author.username)
        .addField("ID", msg.author.id);
      msg.channel.send(embed);
      return;
    }

    let user;

    if (args[0].startsWith("<@") && args[0].endsWith(">")) {
      args[0] = args[0].slice(2, -1);

      if (args[0].startsWith("!")) {
        args[0] = args[0].slice(1);
      }
      if (args[0].startsWith("&")) {
        args[0] = args[0].slice(1);
      }
      user = await bot.users.fetch(args[0]);
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(`User Information`)
      .setThumbnail(user.avatarURL())
      .setColor(0xf66464)
      .addField("Name", user.username)
      .addField("ID", user.id);
    msg.channel.send(embed);
  },
};
