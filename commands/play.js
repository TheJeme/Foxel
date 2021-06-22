const ytdl = require("ytdl-core");

module.exports = {
  name: "play",
  description: "Plays given song.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in server!");
      return;
    }
    if (args.length !== 1) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >play https://www.youtube.com/watch?v=I0-Af7HiJng"
      );
      return;
    }

    bot.dispatcher = bot.connection.play(
      ytdl(args[0], {
        filter: "audioonly",
        bitrate: 192000,
      })
    );
  },
};
