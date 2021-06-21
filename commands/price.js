const Discord = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "price",
  description: "Gets current price on given crypto.",
  execute(msg, args) {
    if (args.length !== 1 && args.length !== 2) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >price bitcoin eur\n**Example:** >price ethereum usd"
      );
      return;
    }

    const [crypto, currency = "eur"] = args;
    axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`
      )
      .then((response) => {
        let price;
        if (currency == "eur") {
          price = response.data[crypto][currency] + "€";
        } else if (currency == "usd") {
          price = "$" + response.data[crypto][currency];
        } else {
          msg.channel.send(
            "Incorrect use.\nUse either **eur** or **usd** as a currency."
          );
          return;
        }
        let embed = new Discord.MessageEmbed()
          .setTitle(
            `${
              crypto.toLowerCase().charAt(0).toUpperCase() +
              crypto.toLowerCase().slice(1)
            } Price`
          )
          .setColor(0xf66464)
          .setDescription(`Price: ${price}`);
        msg.channel.send(embed);
      })
      .catch((err) => console.log(err));
  },
};
