module.exports = {
  name: "dimitri",
  description: "dimitri, secret command",
  execute(msg, args) {
    msg.channel.send("Fake taxi driver!");
  },
};
