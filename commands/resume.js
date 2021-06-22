const ytdl = require("ytdl-core");

module.exports = {
  name: "resume",
  description: "Resumes the song.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in server!");
      return;
    }

    bot.dispatcher.resume();
  },
};
