/*CMD
  command: /setup
  help: Initialize this template
  need_reply: false
  folder: SETUP
  aliases: setup
CMD*/

// The current BOTBOX owner's Telegram ID. Before distributing a copy, set
// t4_setup_owner from the trusted Bots.Business properties screen, or replace
// this value with the buyer's Telegram ID. Never let the first visitor claim it.
var INITIAL_OWNER_ID = "6589090462";
if (!user || !user.telegramid) { return; }
var uid = String(user.telegramid);
var savedOwner = String(Bot.getProperty("t4_owner") || "");
var setupOwner = savedOwner || String(Bot.getProperty("t4_setup_owner") || INITIAL_OWNER_ID);
var ready = Bot.getProperty("t4_setup_done") === "yes" && !!savedOwner;
if (uid !== setupOwner) {
  Bot.sendInlineKeyboard(
    [[{ title: "🏠 Main Menu", command: "main_menu" }]],
    ready ? "🔒 Setup is available to the owner only." : "🛠 This bot is being configured. Please try again soon."
  );
  return;
}
User.setProperty("t4_pending", "", "string");
if (ready) {
  Bot.sendInlineKeyboard(
    [[{title:"🛠 Admin Panel",command:"/admin"},{title:"🏠 Main Menu",command:"main_menu"}]],
    "✅ *SETUP COMPLETE*\n\nYour configuration is already saved."
  );
  return;
}
var setupAction = String(typeof params === "undefined" ? "" : params || "").trim();
if (setupAction === "later") {
  Bot.sendInlineKeyboard([[{title:"⚙️ Resume Setup",command:"/setup"}]], "⏳ Setup paused. The bot will stay inactive until setup is complete.");
  return;
}
if (setupAction !== "confirm") {
  Bot.sendInlineKeyboard(
    [[{title:"✅ Complete Setup",command:"/setup confirm"},{title:"⏳ Later",command:"/setup later"}]],
    "⚙️ *TPL-004 SETUP*\n\nOwner ID: " + setupOwner + "\nCurrency: USD\nFulfillment: Manual\n\nComplete setup to activate the bot and admin panel. Existing records and balances will be preserved."
  );
  return;
}
Bot.setProperty("t4_owner", setupOwner, "string");
if (!Bot.getProperty("t4_store_name")) {
  Bot.setProperty("t4_store_name", "MARKETING & PROMOTION", "string");
}
Bot.setProperty("t4_setup_version", 1, "integer");
Bot.setProperty("t4_setup_done", "yes", "string");
Bot.runCommand("app admin");
