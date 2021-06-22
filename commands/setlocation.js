const firebase = require("firebase");

module.exports = {
  name: "setlocation",
  description: "Sets your location.",
  execute(msg, args) {
    if (args.length !== 2) {
      msg.channel.send("Incorrect use.\n**Example:** >setlocation Kuopio FI");
      return;
    }

    var db = firebase.firestore();

    db.collection("users")
      .doc(msg.author.id)
      .update({
        location: `${args[0]}, ${args[1]}`,
      });

    msg.channel.send(`Your location is set to ${args[0]}, ${args[1]}`);
  },
};
