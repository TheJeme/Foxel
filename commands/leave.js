module.exports = {
  name: "leave",
  description: "Leaves voice channel.",
  async execute(msg, args, bot) {
    if (!msg.guild) {
      msg.channel.send("This command can only be used in a server!");
      return;
    }

    if (msg.member.voice.channel) {
      if (bot.connection) {
        bot.connection.disconnect();
        msg.channel.send("Disconnected from the voice channel!");
      } else {
        msg.reply("I'm not connected to any voice channel!");
      }
    } else {
      msg.reply("You need to join a voice channel first!");
    }
  },
};