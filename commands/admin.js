/*CMD
  command: /admin
  help: Open the admin panel
  need_reply: false
  folder: ADMIN
  aliases: admin
CMD*/

User.setProperty("t4_pending", "", "string");
Bot.runCommand("app admin");
