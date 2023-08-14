const axios = require("axios");

module.exports = {
  name: "neko",
  description:
    "Sends random neko picture, based on 'https://nekos.best/' api.",
  execute(msg, args) {
    axios
      .get("https://nekos.best/api/v2/neko")
      .then((response) => {
        msg.channel.send(response.data.results[0].url);
      })
      .catch((err) => console.log(err));
  },
};
