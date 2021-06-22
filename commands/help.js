const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "Help, shows all non-secret commands",
  execute(msg, args, bot) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Help")
      .setAuthor("Foxel Commands", bot.user.displayAvatarURL())
      .setColor(0xf66464)
      .addField(
        "__General__",
        '**>serverinfo** : "Shows information about this server"\n**>userinfo [@user]** : "Shows information about given user"\n**>botinfo** : "Shows information about this bot"\n**>avatar [@user]** : "Shows given user avatar"\n**>invite** : "Sends my invitation link"\n',
        false
      )
      .addField(
        "__Fun__",
        '**>coinflip** : "Flips a coin"\n**>dice** : "Rolls a dice"\n**>random [min] [max]** : "Generates random number"',
        false
      )
      .addField(
        "__Crypto__",
        '**>price [crypto] [currency]** : "Shows current price of given crypto"\n**>invitecrypto [crypto]** : "Sends invitation link for bot that shows current price of given crypto."\n',
        false
      )
      .addField(
        "__Reminder__",
        '**>reminder** : "Shows your reminder"\n**>addreminder [date] [time] [message]** : "Adds a new reminder"\n**>deletereminder** : "Deletes your reminder"',
        false
      )
      .addField(
        "__Personal__",
        '**>setlocation [city] [country code]** : "Sets your default location for weather"\n**>enable** : "Enables daily message from me"\n**>disable** : "Disables daily message from me"',
        false
      )
      .addField(
        "__Text__",
        '**>wc [message]** : "Shows word and character count"\n**>reverse [message]** : "Reverses the given message"\n',
        false
      )
      .addField(
        "__Misc__",
        '**>fox** : "Sends a picture of fox"\n**>waifu** : "Sends a picture of waifu"\n**>weather [city] [country code]** : "Shows weather in the given place"\n**>color [hex/rgb]** : "Sends a picture of given color"\n**>tp** : "Shows time in percentages"',
        false
      )
      .setFooter("For more specific info, check: https://jemedev.netlify.com");
    msg.channel.send(embed);
  },
};
