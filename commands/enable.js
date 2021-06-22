module.exports = {
  name: "enable",
  description: "Enables daily message from bot",
  execute(msg, args) {
    if (msg.guild) {
      msg.channel.send("This command can only be used in my direct messages!");
    } else {
      msg.channel.send(
        "Daily messages has been enabled!\nDisable them with **>disable**"
      );
    }
  },
};
