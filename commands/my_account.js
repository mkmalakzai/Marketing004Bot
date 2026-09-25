/*CMD
  command: my_account
  help:
  need_reply: false
  auto_retry_time:
  folder: ACCOUNT
  aliases:
CMD*/

// Bots.Business command: my_account
var joined = User.getProperty("tpl004_joined_at") || "—";
var orders = Number(User.getProperty("tpl004_total_orders") || 0);
var spent = Number(User.getProperty("tpl004_total_spent_cents") || 0);
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "👤 MY ACCOUNT\n\n" +
  "Orders: " + orders + "\n" +
  "Total spent: $" + (spent / 100).toFixed(2) + "\n" +
  "Joined: " + joined + "\n\n" +
  "Powered by BOTBOX • @BotboxOfficial"
);
