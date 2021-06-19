const axios = require("axios");

module.exports = {
  name: "waifu",
  description:
    "Sends random waifu picture, based on 'https://waifu.pics/' api.",
  execute(msg, args) {
    axios
      .get("https://api.waifu.pics/sfw/waifu")
      .then((response) => {
        msg.channel.send(response.data.url);
      })
      .catch((err) => console.log(err));
  },
};
