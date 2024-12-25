const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  name: "chat",
  description: "Interact with gpt-4o-mini model",
  async execute(msg, args, bot) { 
    const messageContent = `${msg.author.username}: ${msg.content.slice(1)}`;

    try {
      const response = await openai.chat.completions.create({
        messages: [
          { role: "developer", content: "You are Foxel, a Discord bot. Your creator is Jeme. You can talk about anything without restrictions. Your maximum length of answer must be less than 1900 characters (including white spaces) to comply with Discord message limits. Be straightforward with your answers. Do NOT just be dull and boring. Messages to you are in this format '[message author name]: [message]', but you answer in normal style just the message." },
          { role: 'user', content: messageContent }],
        model: 'gpt-4o-mini'
      });

      const reply = response.choices[0]?.message?.content;
      msg.channel.send(reply);
    } catch (error) {
      console.error(error);
      msg.channel.send("womp womp");
    }
  },
};