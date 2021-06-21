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
    var baseString = args.join(" ");
    var splitString = baseString.split("");
    var reversedSplitString = splitString.reverse();
    var reversedString = reversedSplitString.join("");
    msg.channel.send(reversedString);
  },
};
