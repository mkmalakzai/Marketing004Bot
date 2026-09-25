/*CMD
  command: offers
  help:
  need_reply: false
  auto_retry_time:
  folder: OFFERS
  aliases:
CMD*/

// Bots.Business command: offers
Bot.sendInlineKeyboard(
  [[{ title: "🏠 Main Menu", command: "main_menu" }]],
  "🎁 OFFERS\n\nOffers are being prepared."
);
