const Discord = require("discord.js");
const axios = require("axios");
const moment = require("moment");

module.exports = {
  name: "weather",
  description: "Shows weather in given place.",
  execute(msg, args, bot) {
    if (args.length !== 1 && args.length !== 2) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >weather London\n**Example:** >weather Kuopio FI"
      );
      return;
    }

    const [city, countryCode = "eur"] = args;

    axios
      .get(
        `http://api.openweathermap.org/data/2.5/forecast?cnt=1&q=${city},${countryCode}&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`
      )
      .then((response) => {
        const embed = new Discord.MessageEmbed()
          .setTitle(`${response.data.city.name} Weather`)
          .addField(
            "Temperature",
            `${Math.round(response.data.list[0].main.temp)}°C`
          )
          .addField(
            "Wind",
            `${response.data.list[0].wind.speed.toFixed(1)} m/s`
          )
          .addField("Weather", `${response.data.list[0].weather[0].main}`)
          .addField(
            "More info",
            `https://openweathermap.org/city/${response.data.city.id}`
          )
          .setColor(0xf66464)
          .setThumbnail(
            `https://openweathermap.org/img/wn/${response.data.list[0].weather[0].icon}@2x.png`
          )
          .setFooter(moment().format("MMMM Do YYYY, HH:mm:ss"));
        msg.channel.send(embed);
      })
      .catch((err) => console.log(err));
  },
};
