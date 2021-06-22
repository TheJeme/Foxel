module.exports = {
  name: "pause",
  description: "Pauses the song.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in server!");
      return;
    }

    bot.dispatcher.pause();
  },
};
