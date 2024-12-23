const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const moment = require("moment");

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
      .get(`https://api.coingecko.com/api/v3/coins/${crypto.toLowerCase()}`)
      .then((response) => {
        let price, rank, pricechange;
        if (currency.toLowerCase() == "eur") {
          price = response.data.market_data.current_price[currency] + "€";
        } else if (currency.toLowerCase() == "usd") {
          price = "$" + response.data.market_data.current_price[currency];
        } else {
          msg.channel.send(
            "Incorrect use.\nUse either **eur** or **usd** as a currency."
          );
          return;
        }
        rank = response.data.market_cap_rank;
        pricechange =
          response.data.market_data.price_change_percentage_24h_in_currency[
            currency
          ].toFixed(2) + "%";
        let embed = new EmbedBuilder()
          .setTitle(
            `${
              crypto.toLowerCase().charAt(0).toUpperCase() +
              crypto.toLowerCase().slice(1)
            }`
          )
          .setColor(0xf66464)
          .setThumbnail(response.data.image.large)
          .addFields(
            { name: "Rank", value: rank.toString(), inline: true },
            { name: "Price", value: price, inline: true },
            { name: "Price Change (24h)", value: pricechange, inline: true }
          )
          .setFooter({ text: moment().format("MMMM Do YYYY, HH:mm:ss") });
        msg.channel.send({ embeds: [embed] });
      })
      .catch((err) => console.log(err));
  },
};