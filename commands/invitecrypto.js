const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "invitecrypto",
  description: "Sends an invitation link for a crypto bot that shows crypto prices.",
  execute(msg, args, bot) {
    if (args.length !== 1) {
      msg.channel.send(
        "Please specify which bot you want to invite. Choose from these options: **btc**, **eth**, **ada**, **doge**\n**Example:** >invitecrypto doge"
      );
      return;
    }
    args[0] = args[0].toLowerCase();
    let embed = new EmbedBuilder();
    if (args[0] === "btc" || args[0] === "bitcoin") {
      embed
        .setAuthor({ name: "Bitcoin Bot Invitation Link", iconURL: bot.user.displayAvatarURL() })
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856648702169055262&permissions=0&scope=bot"
        );
    } else if (args[0] === "eth" || args[0] === "ethereum") {
      embed
        .setAuthor({ name: "Ethereum Bot Invitation Link", iconURL: bot.user.displayAvatarURL() })
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649788572565514&permissions=0&scope=bot"
        );
    } else if (args[0] === "ada" || args[0] === "cardano") {
      embed
        .setAuthor({ name: "Cardano Bot Invitation Link", iconURL: bot.user.displayAvatarURL() })
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649898723508224&permissions=0&scope=bot"
        );
    } else if (args[0] === "doge") {
      embed
        .setAuthor({ name: "Doge Bot Invitation Link", iconURL: bot.user.displayAvatarURL() })
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649971872694312&permissions=0&scope=bot"
        );
    } else {
      msg.channel.send(
        "Invalid option. Please choose from these options: **btc**, **eth**, **ada**, **doge**"
      );
      return;
    }
    msg.channel.send({ embeds: [embed] });
  },
};