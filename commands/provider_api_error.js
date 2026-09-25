/*CMD
  command: provider_api_error
  help:
  need_reply: false
  folder: PROVIDERS
CMD*/

if (!user || !user.telegramid) { return; }
var uid=String(user.telegramid);
var owner=String(Bot.getProperty("t4_owner")||"");
var admins=String(Bot.getProperty("t4_admins")||"").split(",");
if(uid!==owner&&admins.indexOf(uid)<0){return;}
var ctx;try{ctx=JSON.parse(User.getProperty("t4_provider_request"));}catch(e){ctx=null;}
var back=ctx&&ctx.provider?ctx.provider:"";
Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+back},{title:"🛠 Admin Panel",command:"app admin"}]],"❌ Provider request failed.\n\nCheck API URL, API key, provider availability, and Bots.Business HTTP access.");
