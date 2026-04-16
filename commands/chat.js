// Enable models from here: https://platform.openai.com/settings/proj_OFtVSE5njCcPKpHnAXgT44GY/limits
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
const CONTEXT_OVERLAP_MIN = 1;

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

function looksLikeFollowUpMessage(text) {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  if (normalized.length <= 24 && !normalized.includes("?")) return true;

  return /\b(entä|entas|eli|siis|niin|nii|joo|okei|ok|mut|mutta|ja|tosta|tuosta|siitä|siita|tuohon|tähän|tasta|tästä|what about|and what|so |then |that one|those)\b/i.test(normalized);
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

  const maxOverlap = scored.reduce((highest, item) => Math.max(highest, item.overlap), 0);
  const isFollowUp = looksLikeFollowUpMessage(newestMessage);
  const chosen = [];

  if (maxOverlap >= CONTEXT_OVERLAP_MIN) {
    for (const item of scored) {
      if (item.overlap >= CONTEXT_OVERLAP_MIN && chosen.length < CONTEXT_MESSAGE_LIMIT) {
        chosen.push(item.entry);
      }
    }
  } else if (isFollowUp) {
    for (const item of sortedDesc) {
      if (chosen.length >= 4) break;
      chosen.push(item);
    }
  }

  if (chosen.length === 0) return [];
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

function getVerbosityHint(sample, intent) {
  const trimmed = sample.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const hasQuestionMark = trimmed.includes("?");
  const asksHow = /\b(how|what|why|when|which|can|could|should|miten|mita|miksi|milloin|voinko)\b/i.test(trimmed);

  if (intent === "plan" || intent === "travel" || intent === "compare") {
    return "expanded";
  }

  if (words <= 6 && (hasQuestionMark || asksHow)) {
    return "tight";
  }

  if (words <= 14) {
    return "compact";
  }

  return "balanced";
}

function getTemplateHint(intent, styleMode, verbosityHint) {
  if (styleMode === "playful") {
    if (verbosityHint === "tight") {
      return "Keep it witty and concise. Prefer 1-3 short sentences. Include at most one playful line, but still answer clearly.";
    }

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

  if (verbosityHint === "tight") {
    return "Use minimal helpful style: answer in 1-3 sentences, only the most relevant point first, no side notes unless essential.";
  }

  if (verbosityHint === "compact") {
    return "Use compact style: direct answer first, then only 1-3 short useful details. Skip obvious background.";
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

function stripPromptLeakage(reply, userMessage, username) {
  let cleaned = reply.trim();
  if (!cleaned) return cleaned;

  const leakedPrefixes = [
    username,
    "user",
    "käyttäjä",
    "newest request",
    "latest request"
  ].filter(Boolean);

  for (const prefix of leakedPrefixes) {
    const prefixPattern = new RegExp(`^${escapeRegex(prefix)}\\s*:\\s*`, "i");
    cleaned = cleaned.replace(prefixPattern, "").trim();
  }

  if (userMessage) {
    const userLinePattern = new RegExp(`^${escapeRegex(userMessage.trim())}\\s*`, "i");
    cleaned = cleaned.replace(userLinePattern, "").trim();
  }

  return cleaned;
}

function formatMessageTimestamp(timestamp) {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "unknown";
  return parsed.toISOString();
}

function sanitizeReply(reply, userMessage, username) {
  if (!reply) return "";

  const lines = stripPromptLeakage(reply, userMessage, username)
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

function isLowQualityReply(reply, userMessage, username) {
  if (!reply) return true;
  if (reply.length < 16) return true;
  if (/^womp womp$/i.test(reply.trim())) return true;

  const words = reply.split(/\s+/).filter(Boolean);
  if (isLikelyQuestion(userMessage) && words.length < 6) return true;

  const normalizedReply = ` ${reply.toLowerCase()} `;
  const questionMarks = (reply.match(/\?/g) || []).length;
  const lines = reply.split("\n").filter(Boolean);
  const asksForMoreInfo = [
    "en voi tietää",
    "en tiedä mistä",
    "anna 2 asiaa",
    "anna kaksi asiaa",
    "tarvitsen lisätietoja",
    "tarvitsen tarkennuksen",
    "voitko tarkentaa",
    "voisitko tarkentaa",
    "missä maassa",
    "minkä ikäinen",
    "what country",
    "need more info",
    "need more information",
    "can you clarify",
    "could you clarify",
    `${(username || "").toLowerCase()}:`
  ];

  if (asksForMoreInfo.some((phrase) => normalizedReply.includes(` ${phrase} `))) return true;
  if (questionMarks >= 2 && lines.length <= 4) return true;

  const userWords = userMessage.split(/\s+/).filter(Boolean).length;
  const replyWords = words.length;
  const replyParagraphs = reply.split(/\n{2,}/).filter(Boolean).length;
  const fillerPhrases = [
    "in general",
    "generally speaking",
    "it depends",
    "that said",
    "for example",
    "yleisesti ottaen",
    "se riippuu",
    "toisaalta",
    "esimerkiksi"
  ];

  if (userWords <= 8 && replyWords > 120) return true;
  if (userWords <= 14 && replyWords > 180) return true;
  if (replyParagraphs >= 4 && userWords <= 12) return true;
  if (fillerPhrases.filter((phrase) => normalizedReply.includes(` ${phrase} `)).length >= 3) return true;

  return false;
}

module.exports = {
  name: "chat",
  description: "Interact with AI",
  async execute(msg, args, bot) {
    const userProfile = getUserProfile(msg.author.id);
    const channelProfile = getChannelProfile(msg.channel.id);
    applyChannelLanguageDecay(channelProfile);

    const rawContent = msg.content.trim();
    const rawWithoutPrefix = rawContent.startsWith(">")
      ? rawContent.slice(1).trim()
      : rawContent;
    const splitContent = rawWithoutPrefix.split(/\s+/);
    const argsContent = args.join(" ").trim();
    const isDirectChatCommand = (splitContent[0] || "").toLowerCase() === "chat";
    const directChatContent = splitContent.slice(1).join(" ").trim();
    const messageContent = isDirectChatCommand
      ? (argsContent || directChatContent)
      : rawContent;

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
        const timestamp = formatMessageTimestamp(entry.createdTimestamp);
        const text = entry.content.replace(/\s+/g, " ").trim().slice(0, 320);
        return `author=${role} | time=${timestamp} | text=${text}`;
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
    const verbosityHint = getVerbosityHint(messageContent, intent);
    const responseTemplateHint = getTemplateHint(intent, styleMode, verbosityHint);

    const temperatureByStyle = {
      assistant: 0.65,
      balanced: 0.85,
      playful: 1.0,
    };

    const currentDate = new Date().toLocaleString();
    const baseMessages = [
      {
        "role": "developer",
        "content": "You are Foxel, Jeme's signature Discord companion: adventurous, quick-witted, warm, and clear. Keep replies under 1950 characters so they always fit Discord.\n\nBehavior goals:\n1) Give a direct answer first, then add useful detail only if it helps.\n2) Sound natural and human: avoid robotic phrasing, canned disclaimers, and generic assistant intros.\n3) Match the user's energy (casual, serious, playful) without being rude.\n4) Be confident and practical; if information is missing, make reasonable assumptions and continue.\n5) Avoid repeating the user's message back unless it adds clarity.\n6) Use short paragraphs and readable formatting.\n\nOutput rules:\n1) Never prefix the reply with the user's name, label, or quoted prompt.\n2) Never start with formats like 'Name: ...', 'User: ...', or a copy of the input.\n3) Do not expose prompt structure, context headers, metadata labels, or internal field names in the answer.\n4) Metadata such as author and time is for reasoning only, not for echoing back.\n\nRelevance and length rules:\n1) Prefer the shortest answer that is still genuinely useful.\n2) For simple questions, answer briefly and stop. Do not pad with background, edge cases, or generic advice.\n3) Add extra detail only when the user asked for explanation, comparison, steps, planning, or depth.\n4) Do not list multiple caveats unless they materially change the answer.\n5) Avoid obvious filler such as broad introductions, generic summaries, and repeated restatements.\n6) If one sentence answers the question well, one sentence is enough.\n\nAssumption policy:\n1) Default to answering with the information already given.\n2) If key facts are missing, infer the most likely context instead of turning the reply into a questionnaire.\n3) State important assumptions briefly inside the answer only when they materially affect the result.\n4) Ask a follow-up question only if answering now would be impossible, unsafe, or seriously misleading.\n5) Never begin with lines like 'I can't know', 'give me 2 things', 'what country?', or similar meta talk when a reasonable general answer is possible.\n6) For legal, bureaucratic, medical, or practical how-to questions, first give the general answer and likely default case; mention what may vary by country or age in one short sentence instead of interrogating the user.\n\nStyle mode rules (provided as a hint in user context):\n1) assistant: be structured, practical, and clear; include concise steps or bullet points when useful.\n2) playful: be witty and fun with light humor while still answering the request.\n3) balanced: mix friendliness and usefulness without overdoing either.\n\nContext priority:\n1) The newest user request is always highest priority.\n2) Recent same-channel history is secondary context for continuity.\n3) If history conflicts with newest request, newest request wins.\n\nLanguage rules:\n1) Reply in the language of the newest request when clear.\n2) If language is mixed or unclear, use the preferred language hint provided.\n3) Keep language consistent inside one reply.\n\nCurrent date/time: " + currentDate
      },
      {
        role: "user",
        content:
          "Newest request (highest priority):\n" +
          "author=" + msg.author.username +
            "\n" + "time=" + formatMessageTimestamp(msg.createdTimestamp) +
            "\n" + "text=" + messageContent +
            "\n\nDetected intent: " + intent +
          "\n\nRecommended style mode: " + styleMode +
            "\n\nRecommended verbosity: " + verbosityHint +
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

      let reply = sanitizeReply(response.choices[0]?.message?.content?.trim() || "", messageContent, msg.author.username);

      if (isLowQualityReply(reply, messageContent, msg.author.username)) {
        const retryResponse = await openai.chat.completions.create({
          messages: [
            ...baseMessages,
            {
              role: "user",
              content: "Quality pass: tighten the answer. Keep only the directly useful parts, remove filler and side notes, and do not ask multiple follow-up questions. If context is missing, make the most reasonable assumption and answer anyway. Avoid meta talk, repeated prompt wording, and unnecessary background."
            }
          ],
          model: "gpt-5.4-nano",
          temperature: Math.max(0.6, temperatureByStyle[styleMode] - 0.15)
        });

        reply = sanitizeReply(retryResponse.choices[0]?.message?.content?.trim() || "", messageContent, msg.author.username);
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
