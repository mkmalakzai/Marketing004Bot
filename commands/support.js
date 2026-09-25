/*CMD
  command: support
  help:
  need_reply: false
  auto_retry_time:
  folder: SUPPORT
  aliases:
CMD*/

// Bots.Business command: support
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "🎫 SUPPORT\n\nSupport tickets are being prepared."
);
