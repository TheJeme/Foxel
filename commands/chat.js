const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  name: "chat",
  description: "Interact with GPT-4o model",
  async execute(msg, args, bot) { 
    const prompt = msg.content.slice(1);

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.data.choices[0].message.content;
      msg.channel.send(reply);
    } catch (error) {
      console.error(error);
      msg.channel.send("womp womp");
    }
  },
};