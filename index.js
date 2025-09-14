import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Configuration
API_KEY = "8262576157:AAGB4V5TwAtYX5Wcxv7zVlrke1hIvY0Eui8"
GROUP_ID = 1002914341678
PORT = int(os.environ.get('PORT', 5000))

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Roast messages
ROASTS = [
    "If laughter is the best medicine, your face must be curing the world.",
    "You're not stupid; you just have bad luck thinking.",
    "I'd agree with you but then we'd both be wrong.",
    "You bring everyone so much joy... when you leave the room.",
    "I'd explain it to you but I don't have any crayons with me.",
    "You have a face for radio... and a voice for silent film.",
    "Is your ass jealous of the amount of shit that just came out of your mouth?",
    "I'd roast you but my mom said not to burn trash.",
    "You're the reason the gene pool needs a lifeguard.",
    "If I wanted to kill myself I'd climb your ego and jump to your IQ."
]

# Start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("Roast Me! 🔥", callback_data='roast_me')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        'Welcome to the Roast Bot! Ready to get roasted? 😈',
        reply_markup=reply_markup
    )
    
    # Log to group
    user = update.effective_user
    log_message = f"User {user.first_name} (@{user.username}) started the bot"
    await context.bot.send_message(chat_id=GROUP_ID, text=log_message)

# Handle button presses
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == 'roast_me':
        import random
        roast = random.choice(ROASTS)
        
        # Send roast to user
        await query.edit_message_text(text=roast)
        
        # Log to group
        user = update.effective_user
        log_message = f"User {user.first_name} (@{user.username}) got roasted: '{roast}'"
        await context.bot.send_message(chat_id=GROUP_ID, text=log_message)

# Error handler
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Update {update} caused error {context.error}")
    
    # Log error to group
    error_message = f"Error occurred: {context.error}"
    await context.bot.send_message(chat_id=GROUP_ID, text=error_message)

# Main function
def main():
    # Create application
    application = Application.builder().token(API_KEY).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(button_handler))
    application.add_error_handler(error_handler)
    
    # Start webhook
    application.run_webhook(
        listen="0.0.0.0",
        port=PORT,
        url_path=API_KEY,
        webhook_url=f"https://your-app-name.onrender.com/{API_KEY}"
    )

if __name__ == "__main__":
    main()
