const rgbToHex = require("rgb-to-hex");

module.exports = {
  name: "color",
  description: "Sends a picture of the specified color (hex/rgb).",
  execute(msg, args) {
    let color;
    if (args.length === 1 && args[0].startsWith("#") && args[0].length === 7) {
      color = args[0].substring(1);
    } else if (args.length === 1 && args[0].length === 6) {
      color = args[0];
    } else if (
      args.length === 3 &&
      parseInt(args[0]) >= 0 &&
      parseInt(args[0]) <= 255 &&
      parseInt(args[1]) >= 0 &&
      parseInt(args[1]) <= 255 &&
      parseInt(args[2]) >= 0 &&
      parseInt(args[2]) <= 255
    ) {
      color = rgbToHex(
        `rgb(${parseInt(args[0])}, ${parseInt(args[1])}, ${parseInt(args[2])})`
      );
    } else {
      msg.channel.send(
        "Incorrect use.\n**Hex example:** >color #f66464\n**RGB example:** >color 96 39 39"
      );
      return;
    }
    msg.channel.send(`https://singlecolorimage.com/get/${color}/256x256.png`);
  },
};