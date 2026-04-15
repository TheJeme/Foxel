const fs = require("fs");
const path = require("path");

const commandsDir = __dirname;

module.exports = fs
  .readdirSync(commandsDir)
  .filter((fileName) => fileName.endsWith(".js") && fileName !== "index.js")
  .sort((a, b) => a.localeCompare(b))
  .reduce((loadedCommands, fileName) => {
    const commandPath = path.join(commandsDir, fileName);

    try {
      const command = require(commandPath);

      if (!command?.name || typeof command.execute !== "function") {
        console.warn(`Skipping invalid command module: ${fileName}`);
        return loadedCommands;
      }

      loadedCommands[command.name] = command;
    } catch (error) {
      console.error(`Failed to load command module: ${fileName}`, error);
    }

    return loadedCommands;
  }, {});
