module.exports = {
  name: "dice",
  description: "Rolls a dice.",
  execute(msg, args) {
    msg.channel.send(`You rolled ${Math.floor(Math.random() * 6) + 1}.`);
  },
};
