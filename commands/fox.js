const axios = require("axios");

module.exports = {
  name: "fox",
  description:
    "Sends random fox picture, based on 'https://randomfox.ca/' api.",
  execute(msg, args) {
    axios
      .get("https://randomfox.ca/floof/")
      .then((response) => {
        msg.channel.send(response.data.image);
      })
      .catch((err) => console.log(err));
  },
};
