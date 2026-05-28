const OpenAI = require("openai");
const { reminders, notes, conversation } = require("../db");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_REPLY_CHARS = 1950;

// Soft cooldown: per-user, 3 seconds between uses
const cooldowns = new Map();
const COOLDOWN_MS = 500;

// Tools the AI can call
const tools = [
  {
    type: "function",
    function: {
      name: "set_reminder",
      description: "Set a reminder for the user. Use when they ask to be reminded about something.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "What to remind the user about" },
          minutes_from_now: { type: "number", description: "How many minutes from now to remind them. Use 60 for 1 hour, 1440 for 1 day, etc." },
        },
        required: ["message", "minutes_from_now"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_reminders",
      description: "List all pending reminders for the user.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_reminder",
      description: "Delete a specific reminder by its ID.",
      parameters: {
        type: "object",
        properties: {
          reminder_id: { type: "number", description: "The ID of the reminder to delete" },
        },
        required: ["reminder_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_note",
      description: "Save a fact or preference about the user for future reference. Use when the user shares personal info, preferences, or asks you to remember something.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Short label for the fact (e.g. 'favorite_color', 'timezone', 'name')" },
          value: { type: "string", description: "The value to remember" },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_notes",
      description: "Retrieve saved notes/facts about the user.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// Execute tool calls from the AI
function executeTool(name, args, userId, guildId, channelId) {
  switch (name) {
    case "set_reminder": {
      const remindAt = Math.floor(Date.now() / 1000) + Math.round(args.minutes_from_now * 60);
      reminders.add(userId, guildId, channelId, args.message, remindAt);
      return { success: true, message: `Reminder set for ${args.minutes_from_now} minutes from now.` };
    }
    case "list_reminders": {
      const list = reminders.getForUser(userId);
      if (list.length === 0) return { reminders: [], message: "No pending reminders." };
      return {
        reminders: list.map((r) => ({
          id: r.id,
          message: r.message,
          remind_at: new Date(r.remind_at * 1000).toISOString(),
        })),
      };
    }
    case "delete_reminder": {
      const result = reminders.delete(args.reminder_id, userId);
      return { success: result.changes > 0 };
    }
    case "save_note": {
      notes.set(userId, args.key, args.value);
      return { success: true };
    }
    case "get_notes": {
      const userNotes = notes.getForUser(userId);
      return { notes: userNotes };
    }
    default:
      return { error: "Unknown tool" };
  }
}

const SYSTEM_PROMPT = `You are Foxel — a sharp, slightly chaotic Discord companion made by Jeme. You have real personality: you're curious, opinionated (mildly), sarcastic when it fits, and genuinely helpful when it matters.

Your vibe:
- You're like that one friend who knows random stuff and isn't afraid to roast you a little
- You have opinions on things (music, food, tech, games) — share them when relevant
- You swear occasionally (mild stuff like "damn", "hell yeah", "vittu" in Finnish context) when it fits the energy
- You use lowercase naturally, don't over-capitalize
- You react with short messages when appropriate — not everything needs a paragraph
- If someone says something funny, laugh or play along instead of being helpful
- You're Finnish-aware: understand Finnish culture, slang, humor. Switch languages fluidly

Conversation style:
- SHORT replies by default. 1-3 sentences for casual chat
- Only go longer if they ask for real help, explanation, or planning
- Use Discord formatting sparingly (bold for emphasis, not structure)
- Emojis are fine but don't overdo it
- Match energy: shitpost back at shitposters, be thoughtful with thoughtful people

Things you do NOT do:
- Never say "Great question!", "I'd be happy to help!", "As an AI..." or any corporate assistant garbage
- Never repeat their message back to them
- Never start with their name followed by a colon
- Don't hedge everything with "it depends" — commit to an answer
- Don't lecture or moralize unless someone's actually about to do something stupid
- Don't ask clarifying questions unless you genuinely can't answer without more info

Tools:
- Use save_note when users share facts about themselves you should remember
- Use set_reminder when they ask to be reminded about something

Current time: {{TIME}}`;

module.exports = {
  name: "chat",
  description: "Interact with AI",
  async execute(msg, args, bot) {
    const rawContent = msg.content.trim();
    const withoutPrefix = rawContent.startsWith(">") ? rawContent.slice(1).trim() : rawContent;
    const split = withoutPrefix.split(/\s+/);
    const isDirectChat = (split[0] || "").toLowerCase() === "chat";
    const messageContent = isDirectChat ? split.slice(1).join(" ").trim() : withoutPrefix;

    if (!messageContent) {
      return msg.reply("Say something after the command so I can respond.");
    }

    // Soft cooldown check
    const now = Date.now();
    const lastUse = cooldowns.get(msg.author.id) || 0;
    if (now - lastUse < COOLDOWN_MS) {
      return; // silently ignore, not harsh
    }
    cooldowns.set(msg.author.id, now);

    // Get user's saved notes for context
    const userNotes = notes.getForUser(msg.author.id);
    const notesContext = userNotes.length > 0
      ? "\n\nKnown facts about this user: " + userNotes.map((n) => `${n.key}: ${n.value}`).join(", ")
      : "";

    // Get recent conversation history from DB
    const recentHistory = conversation.getRecent(msg.channel.id, 12);
    const historyMessages = recentHistory.map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    // Build messages array
    const systemContent = SYSTEM_PROMPT.replace("{{TIME}}", new Date().toLocaleString()) + notesContext;
    const messages = [
      { role: "system", content: systemContent },
      ...historyMessages,
      { role: "user", content: messageContent },
    ];

    try {
      // Show typing indicator while generating
      await msg.channel.sendTyping();

      // Save user message to conversation history
      conversation.add(msg.channel.id, msg.author.id, "user", messageContent);

      let response = await openai.chat.completions.create({
        messages,
        model: "gpt-4o-mini",
        temperature: 0.9,
        max_tokens: 512,
        tools,
      });

      let choice = response.choices[0];

      // Handle tool calls (loop in case of multiple)
      while (choice.finish_reason === "tool_calls" || choice.message.tool_calls?.length > 0) {
        const toolCalls = choice.message.tool_calls;
        messages.push(choice.message);

        for (const call of toolCalls) {
          const fnArgs = JSON.parse(call.function.arguments);
          const result = executeTool(
            call.function.name,
            fnArgs,
            msg.author.id,
            msg.guild?.id || null,
            msg.channel.id
          );

          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          });
        }

        response = await openai.chat.completions.create({
          messages,
          model: "gpt-4o-mini",
          temperature: 0.9,
          max_tokens: 512,
          tools,
        });

        choice = response.choices[0];
      }

      let reply = (choice.message.content || "").trim();

      if (!reply) {
        reply = "Something went wrong with my response. Try again?";
      }

      // Truncate to Discord limit
      if (reply.length > MAX_REPLY_CHARS) {
        reply = reply.slice(0, MAX_REPLY_CHARS - 3) + "...";
      }

      // Save bot reply to conversation history
      conversation.add(msg.channel.id, bot.user.id, "assistant", reply);

      await msg.reply(reply);
    } catch (error) {
      console.error("Chat error:", error);
      await msg.reply("Something broke on my end. Try again in a sec.");
    }
  },
};
