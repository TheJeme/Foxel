const firebase = require("firebase");

module.exports = {
  name: "deleteallreminders",
  description: "Deletes all reminders.",
  execute(msg, args) {
    var db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .update({ reminders: firebase.firestore.FieldValue.delete() });
    msg.channel.send("All reminders have been deleted!");
  },
};
