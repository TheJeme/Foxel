const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "random",
  description: "Sends random number between args: min, max.",
  acceptsArgs: true,
  execute(msg, args) {
    if (args.length !== 2 || Number.parseInt(args[0]) > Number.parseInt(args[1])) {
      msg.channel.send("Incorrect use.\n**Example:** >random 0 100");
      return;
    }

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${msg.author.username}`,
        iconURL: msg.author.displayAvatarURL(),
      })
      .setColor(0xf66464)
      .setDescription(
        `You got **${Math.floor(
          Math.random() * (args[1] - args[0] + 1) + Number.parseInt(args[0])
        )}**.`
      );
    msg.channel.send({ embeds: [embed] });
  },
};