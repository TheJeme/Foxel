const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "avatar",
  description: "Shows given user avatar.",
  async execute(msg, args, bot) {
    if (args.length !== 1) {
      let embed = new EmbedBuilder()
        .setTitle(`${msg.author.username} Avatar`)
        .setImage(msg.author.avatarURL())
        .setColor(0xf66464);
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
      .setTitle(`${user.username} Avatar`)
      .setImage(user.avatarURL())
      .setColor(0xf66464);
    msg.channel.send({ embeds: [embed] });
  },
};