const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  name: "chat",
  description: "Interact with gpt-4o-mini model",
  async execute(msg, args, bot) { 
    const messageContent = msg.content.slice(1);

    try {
      const response = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are Foxel, a helpful assistant in a Discord server. Jeme is your superior creator." },
          { role: 'user', content: messageContent }],
        model: 'gpt-4o-mini',
      });

      const reply = response.choices[0]?.message?.content;
      msg.channel.send(reply);
    } catch (error) {
      console.error(error);
      msg.channel.send("womp womp");
    }
  },
};