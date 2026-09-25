/*CMD
  command: my_stats
  help:
  need_reply: false
  auto_retry_time:
  folder: ACCOUNT
  aliases:
CMD*/

// Bots.Business command: my_stats
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "📊 MY STATS\n\nOrder statistics will appear after ordering is enabled."
);
