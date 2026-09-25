/*CMD
  command: my_orders
  help:
  need_reply: false
  auto_retry_time:
  folder: ORDERS
  aliases:
CMD*/

// Bots.Business command: my_orders
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "📦 MY ORDERS\n\nOrdering is being prepared. No orders are active yet."
);
