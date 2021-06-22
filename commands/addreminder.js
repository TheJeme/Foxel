const firebase = require("firebase");
const moment = require("moment");

module.exports = {
  name: "addreminder",
  description: "Adds a new reminder.",
  execute(msg, args) {
    if (
      args.length < 3 ||
      !moment(
        `${args[0].split(".")[2]}-${args[0].split(".")[1]}-${
          args[0].split(".")[0]
        } ${args[1].split(".")[0]}:${args[1].split(".")[1]}`
      ).isValid() ||
      moment(
        `${args[0].split(".")[2]}-${args[0].split(".")[1]}-${
          args[0].split(".")[0]
        } ${args[1].split(".")[0]}:${args[1].split(".")[1]}`
      ).unix() < moment().unix()
    ) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >addreminder 17.6.2021 16.20 Remember to feed cat!"
      );
      return;
    }

    var db = firebase.firestore();

    db.collection("users")
      .doc(msg.author.id)
      .get()
      .then((doc) => {
        if (doc.data().reminders && doc.data().reminders.length >= 20) {
          msg.channel.send(
            "You have too many reminders at the moment! You can't add more yet."
          );
          return;
        }
        const _datetime = `${args[0]} ${args[1]}`;
        const _message = args.slice(2).join(" ");
        if (_message.length > 75) {
          msg.channel.send("Message is too long, max is 75.");
          return;
        }
        db.collection("users")
          .doc(msg.author.id)
          .update({
            reminders: firebase.firestore.FieldValue.arrayUnion({
              datetime: _datetime,
              message: _message,
            }),
          });

        msg.channel.send("Reminder has been added!");
      });
  },
};
