const ytdl = require("ytdl-core");

module.exports = {
  name: "join",
  description: "Joins voice channel.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in server!");
      return;
    }

    if (msg.member.voice.channel) {
      bot.connection = await msg.member.voice.channel.join();
    } else {
      msg.reply("You need to join a voice channel first!");
    }
  },
};
