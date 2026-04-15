const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const USER_MEMORY_PATH = path.join(__dirname, "..", "assets", "chat-user-memory.json");
const MAX_REPLY_CHARS = 1970;
const CONTEXT_FETCH_LIMIT = 24;
const CONTEXT_MESSAGE_LIMIT = 8;
const CHANNEL_MEMORY_KEY = "__channels";
const CHANNEL_LANGUAGE_HALF_LIFE_DAYS = 21;

const finnishHints = [
  " on ", " ei ", " ja ", " että ", " mitä ", " miten ", " tämä ", " se ", " mutta ", " kun ",
  " olen ", " oon ", " sä ", " mä ", " moi ", " kiitos ", " kyllä ", " eikä ", " olisi ", " vois",
  " ä", " ö"
];

const englishHints = [
  " the ", " and ", " what ", " how ", " this ", " that ", " is ", " are ", " can ", " could ",
  " should ", " would ", " thanks ", " please ", " i ", " you ", " we ", " they "
];

const playfulSignals = [
  " joke ", " funny ", " meme ", " roast ", " lol ", " lmao ", " haha ", " xd ",
  " vitsi ", " hauska ", " meemi ", " läppä ", " heh ", " :d "
];

const assistantSignals = [
  " how to ", " guide ", " tips ", " plan ", " compare ", " explain ", " help me ",
  " travel ", " itinerary ", " budget ", " visa ", " country ", " safety ", " best time ",
  " suositus ", " vinkki ", " opas ", " matk ", " budjetti ", " viisumi ", " turvallisuus "
];

const travelSignals = [
  " travel ", " trip ", " itinerary ", " flights ", " visa ", " country ", " destination ",
  " matk ", " matka ", " matkustus ", " reissu ", " viisumi ", " kohde "
];

const compareSignals = [
  " compare ", " vs ", " difference ", " better ", " best ", " which ",
  " vertaa ", " ero ", " parempi ", " kumpi "
];

const planSignals = [
  " plan ", " roadmap ", " step ", " checklist ", " schedule ", " timeline ",
  " suunnitelma ", " vaihe ", " checklista ", " aikataulu "
];

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countSignals(sample, signals) {
  return signals.reduce((sum, signal) => {
    const matches = sample.match(new RegExp(escapeRegex(signal), "g"));
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function keywordSet(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3)
  );
}

function overlapCount(a, b) {
  let count = 0;
  for (const item of a) {
    if (b.has(item)) count += 1;
  }
  return count;
}

function selectRelevantHistoryEntries(entries, newestMessage, authorId) {
  const newestKeywords = keywordSet(newestMessage);
  const sortedDesc = [...entries].sort((a, b) => b.createdTimestamp - a.createdTimestamp);

  const scored = sortedDesc.map((entry, index) => {
    const entryKeywords = keywordSet(entry.content || "");
    const overlap = overlapCount(newestKeywords, entryKeywords);
    const recencyBonus = Math.max(0, 4 - index);
    const sameAuthorBonus = entry.author.id === authorId ? 1 : 0;
    const score = overlap * 3 + recencyBonus + sameAuthorBonus;
    return { entry, score, overlap };
  });

  const chosen = [];
  for (const item of scored) {
    if (item.overlap > 0 && chosen.length < CONTEXT_MESSAGE_LIMIT) {
      chosen.push(item.entry);
    }
  }

  for (const item of scored) {
    if (chosen.length >= CONTEXT_MESSAGE_LIMIT) break;
    if (chosen.includes(item.entry)) continue;
    chosen.push(item.entry);
  }

  return chosen.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function detectLanguage(sample) {
  const normalized = ` ${sample.toLowerCase()} `;
  const fi = countSignals(normalized, finnishHints);
  const en = countSignals(normalized, englishHints);
  const delta = Math.abs(fi - en);

  let language = "English";
  if (fi > en) language = "Finnish";

  let confidence = "low";
  if (delta >= 3) confidence = "high";
  else if (delta >= 1) confidence = "medium";

  return {
    language,
    confidence,
    finnishScore: fi,
    englishScore: en,
  };
}

function detectIntent(sample) {
  const normalized = ` ${sample.toLowerCase()} `;

  if (countSignals(normalized, travelSignals) > 0) return "travel";
  if (countSignals(normalized, compareSignals) > 0) return "compare";
  if (countSignals(normalized, planSignals) > 0) return "plan";
  return "general";
}

function getTemplateHint(intent, styleMode) {
  if (styleMode === "playful") {
    return "Keep it witty and concise. Prefer 1-4 short sentences. Include one playful line, but still answer clearly.";
  }

  if (intent === "travel") {
    return "Use this structure: 1) Quick answer. 2) Best time to visit. 3) Budget level. 4) Safety basics. 5) Local etiquette tip. Keep each section short.";
  }

  if (intent === "plan") {
    return "Use this structure: 1) Goal summary. 2) Step-by-step plan. 3) Common mistakes to avoid. 4) First action to take today.";
  }

  if (intent === "compare") {
    return "Use this structure: 1) Short verdict. 2) Key differences. 3) Which option fits which user. 4) Final recommendation.";
  }

  if (styleMode === "assistant") {
    return "Use compact assistant style: direct answer first, then concise bullet points with practical details.";
  }

  return "Use balanced style: direct answer first, then brief useful details in short paragraphs.";
}

function loadUserMemory() {
  try {
    if (!fs.existsSync(USER_MEMORY_PATH)) return {};
    const raw = fs.readFileSync(USER_MEMORY_PATH, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load chat user memory:", error);
    return {};
  }
}

const userMemory = loadUserMemory();
if (!userMemory[CHANNEL_MEMORY_KEY] || typeof userMemory[CHANNEL_MEMORY_KEY] !== "object") {
  userMemory[CHANNEL_MEMORY_KEY] = {};
}

let pendingSave = false;
let saveInFlight = false;
let saveTimer = null;

function getUserProfile(userId) {
  if (!userMemory[userId]) {
    userMemory[userId] = {
      preferredLanguage: null,
      lastLanguage: null,
      lastStyleMode: "balanced",
      playfulCount: 0,
      assistantCount: 0,
      updatedAt: null,
    };
  }

  return userMemory[userId];
}

function getChannelProfile(channelId) {
  if (!userMemory[CHANNEL_MEMORY_KEY][channelId]) {
    userMemory[CHANNEL_MEMORY_KEY][channelId] = {
      preferredLanguage: null,
      lastLanguage: null,
      finnishCount: 0,
      englishCount: 0,
      updatedAt: null,
    };
  }

  return userMemory[CHANNEL_MEMORY_KEY][channelId];
}

function applyChannelLanguageDecay(channelProfile) {
  if (!channelProfile?.updatedAt) return;

  const lastUpdateMs = Date.parse(channelProfile.updatedAt);
  if (Number.isNaN(lastUpdateMs)) return;

  const elapsedDays = (Date.now() - lastUpdateMs) / (1000 * 60 * 60 * 24);
  if (elapsedDays < 1) return;

  const decayFactor = Math.pow(0.5, elapsedDays / CHANNEL_LANGUAGE_HALF_LIFE_DAYS);
  channelProfile.finnishCount = Math.max(0, channelProfile.finnishCount * decayFactor);
  channelProfile.englishCount = Math.max(0, channelProfile.englishCount * decayFactor);

  if (channelProfile.finnishCount < 0.1) channelProfile.finnishCount = 0;
  if (channelProfile.englishCount < 0.1) channelProfile.englishCount = 0;

  if (channelProfile.finnishCount === 0 && channelProfile.englishCount === 0) {
    channelProfile.preferredLanguage = null;
  }
}

async function flushUserMemorySave() {
  if (saveInFlight || !pendingSave) return;

  pendingSave = false;
  saveInFlight = true;

  try {
    await fs.promises.writeFile(USER_MEMORY_PATH, JSON.stringify(userMemory, null, 2));
  } catch (error) {
    console.error("Failed to save chat user memory:", error);
  } finally {
    saveInFlight = false;
    if (pendingSave) void flushUserMemorySave();
  }
}

function scheduleUserMemorySave() {
  pendingSave = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void flushUserMemorySave();
  }, 250);
}

function sanitizeReply(reply) {
  if (!reply) return "";

  const lines = reply
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const uniqueLines = [];
  const seen = new Set();
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueLines.push(line);
  }

  const compact = uniqueLines.join("\n").trim();
  return compact.slice(0, MAX_REPLY_CHARS);
}

function isLikelyQuestion(text) {
  const normalized = ` ${text.toLowerCase()} `;
  if (normalized.includes("?")) return true;
  return /\b(how|what|why|when|which|can|could|should|miten|mita|miksi|milloin|voinko)\b/.test(normalized);
}

function isLowQualityReply(reply, userMessage) {
  if (!reply) return true;
  if (reply.length < 16) return true;
  if (/^womp womp$/i.test(reply.trim())) return true;

  const words = reply.split(/\s+/).filter(Boolean);
  if (isLikelyQuestion(userMessage) && words.length < 6) return true;

  return false;
}

module.exports = {
  name: "chat",
  description: "Interact with AI",
  async execute(msg, args, bot) {
    const userProfile = getUserProfile(msg.author.id);
    const channelProfile = getChannelProfile(msg.channel.id);
    applyChannelLanguageDecay(channelProfile);

    const rawWithoutPrefix = msg.content.startsWith(">")
      ? msg.content.slice(1).trim()
      : msg.content.trim();
    const splitContent = rawWithoutPrefix.split(/\s+/);
    const messageContent = args.join(" ").trim() || splitContent.slice(1).join(" ").trim();

    if (!messageContent) {
      msg.channel.send("Give me a message after the command so I can respond.");
      return;
    }

    const recentMessages = await msg.channel.messages.fetch({
      limit: CONTEXT_FETCH_LIMIT,
      before: msg.id,
    });

    const candidateHistoryEntries = Array.from(recentMessages.values())
      .filter((entry) => {
        if (!entry.content?.trim()) return false;
        if (entry.author.bot && entry.author.id !== bot.user.id) return false;
        return true;
      });

    const selectedHistoryEntries = selectRelevantHistoryEntries(
      candidateHistoryEntries,
      messageContent,
      msg.author.id
    );

    const channelHistory = selectedHistoryEntries
      .map((entry) => {
        const role = entry.author.id === bot.user.id ? "Foxel" : entry.author.username;
        const text = entry.content.replace(/\s+/g, " ").trim().slice(0, 320);
        return `${role}: ${text}`;
      })
      .join("\n");

    const recentUserText = Array.from(recentMessages.values())
      .filter((entry) => !entry.author.bot && entry.content?.trim())
      .slice(0, 8)
      .map((entry) => entry.content)
      .join(" ");

    const messageLanguage = detectLanguage(messageContent);
    const combinedLanguage = detectLanguage(`${messageContent} ${recentUserText}`);
    const latestRecentUserMessage = Array.from(recentMessages.values())
      .filter((entry) => !entry.author.bot && entry.content?.trim())
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp)[0]?.content || "";
    const recentLanguage = latestRecentUserMessage ? detectLanguage(latestRecentUserMessage) : null;

    let preferredLanguage = messageLanguage.language;
    let languageConfidence = messageLanguage.confidence;

    if (languageConfidence === "low") {
      preferredLanguage = combinedLanguage.language;
      languageConfidence = combinedLanguage.confidence;
    }

    if (languageConfidence === "low" && recentLanguage?.confidence !== "low") {
      preferredLanguage = recentLanguage.language;
      languageConfidence = recentLanguage.confidence;
    }

    if (languageConfidence === "low" && channelProfile.preferredLanguage) {
      preferredLanguage = channelProfile.preferredLanguage;
    }

    if (languageConfidence === "low" && userProfile.preferredLanguage) {
      preferredLanguage = userProfile.preferredLanguage;
    }

    const loweredMessage = ` ${messageContent.toLowerCase()} `;
    const playfulScore = countSignals(loweredMessage, playfulSignals);
    const assistantScore = countSignals(loweredMessage, assistantSignals);
    let styleMode = "balanced";

    if (assistantScore >= playfulScore + 1) styleMode = "assistant";
    if (playfulScore >= assistantScore + 1) styleMode = "playful";

    if (styleMode === "balanced" && userProfile.lastStyleMode && userProfile.lastStyleMode !== "balanced") {
      styleMode = userProfile.lastStyleMode;
    }

    const intent = detectIntent(messageContent);
    const responseTemplateHint = getTemplateHint(intent, styleMode);

    const temperatureByStyle = {
      assistant: 0.65,
      balanced: 0.85,
      playful: 1.0,
    };

    const currentDate = new Date().toLocaleString();
    const baseMessages = [
      {
        "role": "developer",
        "content": "You are Foxel, Jeme's signature Discord companion: adventurous, quick-witted, warm, and clear. Keep replies under 1950 characters so they always fit Discord.\n\nBehavior goals:\n1) Give a direct answer first, then add useful detail if needed.\n2) Sound natural and human: avoid robotic phrasing and canned disclaimers.\n3) Match the user's energy (casual, serious, playful) without being rude.\n4) Be confident and practical; if information is missing, make reasonable assumptions and continue.\n5) Avoid repeating the user's message back unless it adds clarity.\n6) Use short paragraphs and readable formatting.\n\nStyle mode rules (provided as a hint in user context):\n1) assistant: be structured, practical, and clear; include concise steps or bullet points when useful.\n2) playful: be witty and fun with light humor while still answering the request.\n3) balanced: mix friendliness and usefulness without overdoing either.\n\nContext priority:\n1) The newest user request is always highest priority.\n2) Recent same-channel history is secondary context for continuity.\n3) If history conflicts with newest request, newest request wins.\n\nLanguage rules:\n1) Reply in the language of the newest request when clear.\n2) If language is mixed or unclear, use the preferred language hint provided.\n3) Keep language consistent inside one reply.\n\nCurrent date/time: " + currentDate
      },
      {
        role: "user",
        content:
          "Newest request (highest priority):\n" +
          `${msg.author.username}: ${messageContent}` +
            "\n\nDetected intent: " + intent +
          "\n\nRecommended style mode: " + styleMode +
            "\n\nResponse format hint: " + responseTemplateHint +
          "\n\nPreferred language if uncertain: " + preferredLanguage +
            "\n\nLanguage confidence: " + languageConfidence +
          "\n\nRecent same-channel context (oldest to newest, optional):\n" +
          (channelHistory || "[No recent context available]")
      }
    ];

    try {
      const response = await openai.chat.completions.create({
        messages: baseMessages,
        model: "gpt-5.4-nano",
        temperature: temperatureByStyle[styleMode]
      });

      let reply = sanitizeReply(response.choices[0]?.message?.content?.trim() || "");

      if (isLowQualityReply(reply, messageContent)) {
        const retryResponse = await openai.chat.completions.create({
          messages: [
            ...baseMessages,
            {
              role: "user",
              content: "Quality pass: answer directly and concretely in under 6 lines. Avoid filler, and make sure the main question is answered."
            }
          ],
          model: "gpt-5.4-nano",
          temperature: Math.max(0.6, temperatureByStyle[styleMode] - 0.15)
        });

        reply = sanitizeReply(retryResponse.choices[0]?.message?.content?.trim() || "");
      }

      if (!reply) reply = preferredLanguage === "Finnish"
        ? "Hups, vastaus tyhjeni. Kokeile uudelleen niin vastaan paremmin."
        : "My reply came out empty. Send that again and I will answer properly.";

      if (styleMode === "playful") userProfile.playfulCount += 1;
      if (styleMode === "assistant") userProfile.assistantCount += 1;

      userProfile.lastStyleMode = styleMode;
      userProfile.lastLanguage = preferredLanguage;
      if (languageConfidence !== "low") userProfile.preferredLanguage = preferredLanguage;
      userProfile.updatedAt = new Date().toISOString();

      channelProfile.lastLanguage = preferredLanguage;
      if (preferredLanguage === "Finnish") channelProfile.finnishCount += 1;
      if (preferredLanguage === "English") channelProfile.englishCount += 1;
      if (languageConfidence !== "low") {
        channelProfile.preferredLanguage =
          channelProfile.finnishCount >= channelProfile.englishCount ? "Finnish" : "English";
      }
      channelProfile.updatedAt = new Date().toISOString();

      scheduleUserMemorySave();

      msg.channel.send(reply);
    } catch (error) {
      console.error(error);
      msg.channel.send("womp womp");
    }
  },
};
