module.exports = {
  name: "disable",
  description: "Disables daily message from bot",
  execute(msg, args) {
    if (msg.guild !== null) {
      msg.channel.send("This command can only be used in my direct messages!");
    } else {
      msg.channel.send(
        "Daily messages has been disabled!\nEnable them with **>enable**"
      );
    }
  },
};
