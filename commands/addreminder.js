const firebase = require("firebase");

module.exports = {
  name: "addreminder",
  description: "Adds new reminder.",
  execute(msg, args) {
    if (args.length < 3) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >addreminder 17.6.2021 16.20 Remember to feed cat!"
      );
      return;
    }
    var db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .update({
        reminders: firebase.firestore.FieldValue.arrayUnion({
          datetime: `${args[0]} ${args[1]}`,
          message: `${args[2]}`,
        }),
      });

    msg.channel.send("Reminder has been added!");
  },
};
