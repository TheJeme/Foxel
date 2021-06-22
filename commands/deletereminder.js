const firebase = require("firebase");

module.exports = {
  name: "deletereminder",
  description: "Deletes given reminder by id.",
  execute(msg, args) {
    if (arguments.length < 3) {
      msg.channel.send(
        "Incorrect use.\nTake id with command: >showreminders\n**Example:** >deletereminder 6"
      );
      return;
    }
    var db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .update({
        reminders: firebase.firestore.FieldValue.arrayRemove({}),
      });

    msg.channel.send("Reminder has been deleted!");
  },
};
