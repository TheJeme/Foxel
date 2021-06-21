module.exports = {
  name: "settimezone",
  description: "Sets your timezone.",
  execute(msg, args) {
    if (args.length !== 1) {
      msg.channel.send("Incorrect use.\n**Example:** >settimezone UTC+2");
      return;
    }
    msg.channel.send(`Your time zone is set to ${args[0]}`);
  },
};
