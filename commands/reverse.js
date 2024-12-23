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
    const splitString = baseString.split("");
    const reversedSplitString = splitString.reverse();
    const reversedString = reversedSplitString.join("");
    msg.channel.send(reversedString);
  },
};
