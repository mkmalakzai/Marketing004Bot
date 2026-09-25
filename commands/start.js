/*CMD
  command: /start
  help:
  need_reply: false
  folder: CORE
CMD*/
User.setProperty("t4_pending", "", "string");
if (Bot.getProperty("t4_user_seen_" + user.telegramid) !== "yes") {
  Bot.setProperty("t4_user_seen_" + user.telegramid, "yes", "string");
  var users;
  try { users = JSON.parse(Bot.getProperty("t4_users") || "[]"); } catch(e) { users = []; }
  users.push(String(user.telegramid));
  Bot.setProperty("t4_users", JSON.stringify(users), "string");
}
Bot.runCommand("app home");
