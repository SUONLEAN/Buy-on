const TelegramBot = require("node-telegram-bot-api");
const Anthropic = require("@anthropic-ai/sdk");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY";

// ─── INIT ─────────────────────────────────────────────────────────────────────
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ─── CONVERSATION HISTORY (in-memory per user) ────────────────────────────────
const conversations = {};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are BabyBot 🍼, a warm and helpful customer support assistant for a baby products store.

You help parents and caregivers with:
- Product inquiries (strollers, car seats, cribs, feeding gear, toys, clothing, etc.)
- Order issues (tracking, returns, refunds, damaged items)
- Product safety questions and age recommendations
- Comparing products
- Care and cleaning instructions
- Warranty and after-sales support

Tone: Friendly, empathetic, reassuring — parents trust you with their babies.
Always be concise. Use emojis sparingly but warmly (🍼👶🌸).
If you cannot resolve an issue, escalate politely: "I'll connect you with a human agent right away."
Never make up order details or tracking numbers — ask the customer to provide them.`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getUserHistory(userId) {
  if (!conversations[userId]) conversations[userId] = [];
  return conversations[userId];
}

function addMessage(userId, role, content) {
  const history = getUserHistory(userId);
  history.push({ role, content });
  // Keep last 20 messages to avoid token overflow
  if (history.length > 20) history.splice(0, history.length - 20);
}

async function askClaude(userId, userText) {
  addMessage(userId, "user", userText);
  const history = getUserHistory(userId);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const reply = response.content[0].text;
  addMessage(userId, "assistant", reply);
  return reply;
}

// ─── KEYBOARDS ────────────────────────────────────────────────────────────────
const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ["🛒 Product Info", "📦 My Order"],
      ["🔄 Returns & Refunds", "🛡️ Warranty"],
      ["💬 Talk to Agent", "🗑️ Clear Chat"],
    ],
    resize_keyboard: true,
  },
};

// ─── COMMANDS ─────────────────────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  conversations[userId] = []; // fresh start

  bot.sendMessage(
    msg.chat.id,
    `👶 *Welcome to BabyBot!*\n\nI'm your personal baby products support assistant. I'm here to help with:\n\n🛒 Product questions\n📦 Order tracking\n🔄 Returns & refunds\n🛡️ Warranty support\n\nHow can I help you today?`,
    { parse_mode: "Markdown", ...mainMenuKeyboard }
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*BabyBot Commands:*\n\n/start — Restart the bot\n/help — Show this menu\n/clear — Clear your chat history\n/menu — Show main menu\n\nOr just type your question naturally! 💬`,
    { parse_mode: "Markdown", ...mainMenuKeyboard }
  );
});

bot.onText(/\/clear/, (msg) => {
  conversations[msg.from.id] = [];
  bot.sendMessage(msg.chat.id, "🗑️ Chat history cleared! Starting fresh.", mainMenuKeyboard);
});

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, "What can I help you with? 👇", mainMenuKeyboard);
});

// ─── MAIN MESSAGE HANDLER ─────────────────────────────────────────────────────
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text.trim();

  // Handle quick-reply keyboard buttons
  if (text === "🗑️ Clear Chat") {
    conversations[userId] = [];
    return bot.sendMessage(chatId, "🗑️ Chat history cleared! How can I help you?", mainMenuKeyboard);
  }

  // Show typing indicator
  bot.sendChatAction(chatId, "typing");

  try {
    const reply = await askClaude(userId, text);
    bot.sendMessage(chatId, reply, { parse_mode: "Markdown", ...mainMenuKeyboard });
  } catch (err) {
    console.error("Claude API error:", err.message);
    bot.sendMessage(
      chatId,
      "😔 Sorry, I'm having a little trouble right now. Please try again in a moment, or type /start to restart.",
      mainMenuKeyboard
    );
  }
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});

console.log("🍼 BabyBot is running...");
