const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: "join",
  description: "Joins voice channel.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in a server!");
      return;
    }

    if (msg.member.voice.channel) {
      const connection = joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator,
      });
      bot.connection = connection;
    } else {
      msg.reply("You need to join a voice channel first!");
    }
  },
};