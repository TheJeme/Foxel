const Discord = require("discord.js");

module.exports = {
  name: "random",
  description: "Sends random number between args: min, max.",
  execute(msg, args) {
    if (args.length !== 2 || parseInt(args[0]) > parseInt(args[1])) {
      msg.channel.send("Incorrect use.\n**Example:** >random 0 100");
      return;
    }

    let embed = new Discord.RichEmbed()
      .setAuthor(
        `${msg.author.username}#${msg.author.discriminator}`,
        msg.author.avatarURL
      )
      .setColor(0xf66464)
      .setDescription(
        `You got ${Math.floor(
          Math.random() * (args[1] - args[0] + 1) + args[0]
        )}.`
      );
    msg.channel.send(embed);
  },
};
