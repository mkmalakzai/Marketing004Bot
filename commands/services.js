/*CMD
  command: services
  help:
  need_reply: false
  auto_retry_time:
  folder: CATALOG
  aliases:
CMD*/

// Bots.Business command: services
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "🚀 SERVICES\n\nCategories and packages are being prepared."
);
