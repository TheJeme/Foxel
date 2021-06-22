const firebase = require("firebase");

module.exports = {
  name: "deletereminder",
  description: "Deletes the reminder.",
  execute(msg, args) {
    var db = firebase.firestore();
    db.collection("users")
      .doc(msg.author.id)
      .update({ reminders: firebase.firestore.FieldValue.delete() });
    msg.channel.send("Remindes has been deleted!");
  },
};
