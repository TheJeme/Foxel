const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Shows user info.",
  async execute(msg, args, bot) {
    if (args.length !== 1) {
      let embed = new EmbedBuilder()
        .setTitle(`User Information`)
        .setThumbnail(msg.author.avatarURL())
        .setColor(0xf66464)
        .addFields(
          { name: "Name", value: msg.author.username, inline: true },
          { name: "ID", value: msg.author.id, inline: true }
        );
      msg.channel.send({ embeds: [embed] });
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

    let embed = new EmbedBuilder()
      .setTitle(`User Information`)
      .setThumbnail(user.avatarURL())
      .setColor(0xf66464)
      .addFields(
        { name: "Name", value: user.username, inline: true },
        { name: "ID", value: user.id, inline: true }
      );
    msg.channel.send({ embeds: [embed] });
  },
};