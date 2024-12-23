const firebase = require("firebase");

module.exports = {
  name: "disable",
  description: "Disables daily message from bot.",
  execute(msg, args) {
    if (msg.guild) {
      msg.channel.send("This command can only be used in my direct messages!");
      return;
    }
    const db = firebase.firestore();

    db.collection("users").doc(msg.author.id).set(
      {
        enabled: false,
      },
      { merge: true }
    );

    msg.channel.send(
      "Daily messages has been disabled!\nEnable them with **>enable**"
    );
  },
};
