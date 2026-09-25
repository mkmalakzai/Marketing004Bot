// Bots.Business command: main_menu
var buttons = [
  [{ title: "🚀 Services", command: "services" }, { title: "📦 My Orders", command: "my_orders" }],
  [{ title: "💰 Balance", command: "balance" }, { title: "🎁 Offers", command: "offers" }],
  [{ title: "📊 My Stats", command: "my_stats" }, { title: "🎫 Support", command: "support" }],
  [{ title: "👤 My Account", command: "my_account" }]
];
Bot.sendInlineKeyboard(buttons, "🏠 MARKETING & PROMOTION\n\nChoose an option below.");
