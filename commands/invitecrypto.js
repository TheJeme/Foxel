const Discord = require("discord.js");

module.exports = {
  name: "invitecrypto",
  description: "Sends Invitation link on cryptobot about cryptoprices.",
  execute(msg, args, bot) {
    if (args.length !== 1) {
      msg.channel.send(
        "Please specify which bot do you want to invite. Choose from these options: **btc**, **eth**, **ada**, **doge**\n**Example:** >invitecrypto doge"
      );
      return;
    }
    args[0] = args[0].toLowerCase();
    let embed = new Discord.MessageEmbed();
    if (args[0] == "btc" || args[0] == "bitcoin") {
      embed
        .setAuthor("Bitcoin Bot Invitation Link", bot.user.displayAvatarURL())
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856648702169055262&permissions=0&scope=bot"
        );
    } else if (args[0] == "eth" || args[0] == "ethreum") {
      embed
        .setAuthor("Ethereum Bot Invitation Link", bot.user.displayAvatarURL())
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649788572565514&permissions=0&scope=bot"
        );
    } else if (args[0] == "ada" || args[0] == "cardano") {
      embed
        .setAuthor("Cardano Bot Invitation Link", bot.user.displayAvatarURL())
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649898723508224&permissions=0&scope=bot"
        );
    } else if (args[0] == "doge") {
      embed
        .setAuthor("Doge Bot Invitation Link", bot.user.displayAvatarURL())
        .setColor(0xf66464)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=856649971872694312&permissions=0&scope=bot"
        );
    } else {
      return;
    }
    msg.channel.send(embed);
  },
};
