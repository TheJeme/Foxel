const axios = require("axios");

module.exports = {
  name: "hentai",
  description:
    "Sends random hentai picture, based on 'https://waifu.pics/' api.",
  execute(msg, args) {
    axios
      .get("https://api.waifu.pics/nsfw/waifu")
      .then((response) => {
        msg.channel.send(response.data.url);
      })
      .catch((err) => console.log(err));
  },
};
