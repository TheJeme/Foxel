const axios = require("axios");

module.exports = {
  name: "fox",
  description: "Sends a random fox picture, based on 'https://randomfox.ca/' API.",
  execute(msg, args) {
    axios
      .get("https://randomfox.ca/floof/")
      .then((response) => {
        msg.channel.send(response.data.image);
      })
      .catch((err) => {
        console.error(err);
        msg.channel.send("Failed to fetch a fox picture. Please try again later.");
      });
  },
};