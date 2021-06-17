const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "Help, shows all non-secret commands",
  execute(msg, args) {
    const embed = new Discord.RichEmbed()
      .setTitle("Help")
      .setAuthor("Foxel Commands", "https://i.imgur.com/TibvXvx.jpg")
      .setColor(0xf66464)
      .addField(
        "__General__",
        '**>serverinfo** : "Shows information about this server"\n**>userinfo** : "Shows information about specific user"\n**>botinfo** : "Shows information about this bot"\n**>avatar [@user]** : "Shows tagged user avatar"\n**>invite** : "Send my invitation link"\n',
        false
      )
      .addField(
        "__Fun__",
        '**>coinflip** : "Flips a coin"\n**>dice** : "Rolls a dice"\n**>random [min, max]** : "Generates random number"',
        false
      )
      .addField(
        "__Music__",
        '**>play [youtube_video]** : "Plays a song with the given name or url"\n**>skip** : "Skips the current song"\n**>loop** : "Loops the current song"\n**>np** : "Shows what song is currently playing"\n**>join** : "Joins the voice channel"\n**>leave** : "Leaves the voice channel"',
        false
      )
      .addField("__Crypto__", "Some value here", false)
      .addField(
        "__Notes__",
        '**>shownotes** : "Shows your notes"\n**>addnote [message]** : "Adds a new note"\n**>deletenote [id]** : "Deletes the specific note"\n**>deleteallnotes** : "Deletes all your notes"',
        false
      )
      .addField("__Anime__", '**>wip** : "Waifu.pics api"', false)
      .addField(
        //TODO
        "__Reminder__",
        '**>wip** : "Work in progress"',
        false
      )
      .addField(
        "__Convert__",
        '**>text->morse [message]** : "Converts message to morse message"\n**>morse->text [message]** : "Converts morse message to normal message"\n**>dec->bin [message]** : "Converts decimal to binary"\n**>bin->dec [message]** : "Converts binary to decimal"\n**>hex->rgb [message]** : "Converts hex to rgb"\n**>rgb->hex [message]** : "Converts rgb to hex"\n**>hex->rgb [message]** : "Converts hex to rgb"\n**>reverse [message]** : "Reverses the message"\n**>resize [image-link] [width] [height]** : "Resizes the image to specific dimensions"',
        false
      )
      .addField(
        "__Misc__",
        '**>fox** : "Sends a picture of fox"\n**>weather [city/place]** : "Shows weather in specific place"\n**>color [hex/rgb]** : "Sends a picture of specific color"\n**>setbirthday [dd/mm]** : "Sets your birthday for nice a surprise."\n**>timepercentage [hour/day/week/month/year]** : "Shows time in percentage"',
        false
      )
      .setFooter("For more specific info, type: help [command_name]");
    msg.channel.send(embed);
  },
};
