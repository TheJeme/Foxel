const moment = require("moment");
const firebase = require("firebase");

module.exports = {
  name: "setbirthday",
  description: "Sets your birthday.",
  execute(msg, args) {
    if (args.length !== 2 || !moment(`2021-${args[1]}-${args[0]}`).isValid()) {
      msg.channel.send(
        "Incorrect use.\n**Example:** >setbirthday 17 3\n(day), (month)"
      );
      return;
    }
    let date = moment(`2021-${args[1]}-${args[0]}`).format("MMMM Do");

    var db = firebase.firestore();

    db.collection("users")
      .doc(msg.author.id)
      .update({
        birthday: moment(`2021-${args[1]}-${args[0]}`).format("MM.DD"),
      });

    msg.channel.send(`Your birthday is set to ${date}`);
  },
};
