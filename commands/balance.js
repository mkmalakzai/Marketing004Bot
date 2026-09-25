/*CMD
  command: balance
  help:
  need_reply: false
  auto_retry_time:
  folder: WALLET
  aliases:
CMD*/

// Bots.Business command: balance
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "💰 BALANCE\n\nDeposits and balance payments are being prepared. Do not send a payment yet."
);
