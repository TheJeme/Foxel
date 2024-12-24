module.exports = {
  name: "prefix",
  description: "send prefix",
  execute(msg, args, bot) {
    msg.channel.send(`**${bot.prefix}** is the prefix for this bot!`);
  },
};
