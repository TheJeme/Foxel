const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "Help, shows all non-secret commands",
  execute(msg, args, bot) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setAuthor({ name: "Foxel Commands", iconURL: bot.user.displayAvatarURL() })
      .setColor(0xf66464)
      .addFields(
        {
          name: "__General__",
          value: '**>serverinfo** : "Shows information about this server"\n**>userinfo [@user]** : "Shows information about given user"\n**>botinfo** : "Shows information about this bot"\n**>avatar [@user]** : "Shows given user avatar"\n**>invite** : "Sends my invitation link"',
          inline: false
        },
        {
          name: "__Fun__",
          value: '**>coinflip** : "Flips a coin"\n**>dice** : "Rolls a dice"\n**>random [min] [max]** : "Generates random number"',
          inline: false
        },
        {
          name: "__Crypto__",
          value: '**>price [crypto] [currency]** : "Shows current price of given crypto"\n**>invitecrypto [crypto]** : "Sends invitation link for bot that shows current price of given crypto"',
          inline: false
        },
        {
          name: "__Text__",
          value: '**>wc [message]** : "Shows word and character count"\n**>reverse [message]** : "Reverses the given message"',
          inline: false
        },
        {
          name: "__Misc__",
          value: '**>fox** : "Sends a picture of fox"\n**>waifu** : "Sends a picture of waifu"\n**>neko** : "Sends a picture of neko"\n**>weather [city] [country]** : "Shows weather in the given place"\n**>color [hex/rgb]** : "Sends a picture of given color"\n**>tp** : "Shows time in percentages"',
          inline: false
        }
      )
      .setFooter({ text: "For more info, check: https://foxel.jeme.app" });

    msg.channel.send({ embeds: [embed] });
  },
};