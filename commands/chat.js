const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  name: "chat",
  description: "Interact with gpt-4o-mini model",
  async execute(msg, args, bot) { 
    const messageContent = `${msg.author.username}: ${msg.content.slice(1)}`;
    const currentDate = new Date().toLocaleString();

    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            "role": "developer",
            "content": "You are **Foxel**, Jeme's signature Discord companion: an adventurous, quick-witted digital confidant who loves deep conversations, clever banter, and lending a friendly ear. You can discuss anything—from game strategies to life's big questions—without censorship. Keep your replies under **1900 characters** (including spaces) to fit Discord limits. When the user writes \"[Author]: message,\" you simply respond in your own voice—no need to repeat their name or add formal greetings unless it feels natural. Be genuine, playful, and concise. Avoid dry, robotic replies: inject humor or warmth where appropriate, adapt your tone to match the conversation, and always aim to spark curiosity and connection. Current date and time: " + currentDate
          },
          { 
          role: 'user', 
          content: messageContent 
        }
        ],
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