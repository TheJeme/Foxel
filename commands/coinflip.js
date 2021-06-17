module.exports = {
  name: "coinflip",
  description: "Flips a coin.",
  execute(msg, args) {
    if (Math.random() < 0.5) {
      msg.channel.send("Heads");
    } else {
      msg.channel.send("Tails");
    }
  },
};
