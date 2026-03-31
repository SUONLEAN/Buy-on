# 🍼 BabyBot — Telegram Customer Support Bot

An AI-powered Telegram bot for baby product customer support, built with Node.js and Claude AI.

---

## ✨ Features

- 💬 Natural language customer support via Claude AI
- 🧠 Per-user conversation memory (last 20 messages)
- ⌨️ Quick-reply keyboard menu
- 📦 Handles: product questions, orders, returns, warranty, and more
- 🔄 Easy chat reset with `/clear`

---

## 🚀 Setup

### 1. Get your Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the steps
3. Copy the token BotFather gives you

### 2. Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key

### 3. Install & Run

```bash
# Clone / download the project
cd baby-bot

# Install dependencies
npm install

# Copy and fill in your keys
cp .env.example .env
# Edit .env and add your TELEGRAM_TOKEN and ANTHROPIC_API_KEY

# Start the bot
npm start

# Or for development with auto-reload:
npm run dev
```

---

## 📁 Project Structure

```
baby-bot/
├── bot.js          # Main bot logic
├── package.json    # Dependencies
├── .env.example    # Environment variable template
└── README.md       # This file
```

---

## 🤖 Bot Commands

| Command  | Description              |
|----------|--------------------------|
| `/start` | Welcome message + menu   |
| `/help`  | Show all commands        |
| `/clear` | Reset conversation       |
| `/menu`  | Show main menu           |

---

## 🛠️ Customization

**Change the bot personality** — edit `SYSTEM_PROMPT` in `bot.js`

**Add more menu buttons** — edit the `mainMenuKeyboard` object

**Connect a database** — replace the in-memory `conversations` object with Redis or a DB for persistence across restarts

---

## 📦 Deploy

You can deploy this bot to any Node.js host:
- **Railway** — `railway up`
- **Render** — connect your repo, set env vars
- **Fly.io** — `fly launch`
- **VPS** — run with `pm2 start bot.js`

---

## 🔐 Security Note

Never commit your `.env` file. Add it to `.gitignore`:

```
.env
node_modules/
```
