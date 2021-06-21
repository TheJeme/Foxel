module.exports = {
  name: "setlocation",
  description: "Sets your location.",
  execute(msg, args) {
    if (args.length !== 1) {
      msg.channel.send("Incorrect use.\n**Example:** >setlocation Kuopio");
      return;
    }
  },
};
