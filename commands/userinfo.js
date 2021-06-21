const Discord = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Shows user info.",
  execute(msg, args, bot) {
    if (args.length !== 1) {
      msg.channel.send("Incorrect use.\n**Example:** >userinfo @foxel#4142");
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
      console.log(args[0]);
      user = bot.users.fetch(args[0]);
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(`${args[0]} Information`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(0xf66464)
      .addField("Name", user.username)
      .addField("ID", user.id);
    msg.channel.send(embed);
  },
};
