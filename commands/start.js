/*CMD
  command: /start
  help:
  need_reply: false
  auto_retry_time:
  folder: CORE
  aliases:
CMD*/

// Bots.Business command: /start
if (User.getProperty("tpl004_initialized") !== true) {
  User.setProperty("tpl004_initialized", true, "boolean");
  User.setProperty("tpl004_joined_at", new Date().toISOString(), "string");
  User.setProperty("tpl004_total_orders", 0, "integer");
  User.setProperty("tpl004_total_spent_cents", 0, "integer");
}
Bot.runCommand("main_menu");
