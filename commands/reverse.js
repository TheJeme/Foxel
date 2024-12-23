module.exports = {
  name: "reverse",
  description: "Reverses the given message",
  execute(msg, args) {
    if (args.length === 0) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >reverse Hello this is Foxel bot!"
      );
      return;
    }
    const baseString = args.join(" ");
    const reversedString = baseString.split("").reverse().join("");
    msg.channel.send(reversedString);
  },
};