/*CMD
  command: provider_status_error
  help:
  need_reply: false
  folder: PROVIDERS
CMD*/

if (!user || !user.telegramid) { return; }

var uid=String(user.telegramid);
var owner=String(Bot.getProperty("t4_owner")||"");
var admins=String(Bot.getProperty("t4_admins")||"").split(",");
if(uid!==owner&&admins.indexOf(uid)<0){return;}

var ctx;
try{ctx=JSON.parse(User.getProperty("t4_api_status_request"));}catch(e){ctx=null;}

var buttons=[[{title:"🛠 Admin Panel",command:"app admin"}]];
if(ctx&&ctx.order){
  buttons=[[{title:"🛒 Open Order",command:"app admin_order "+ctx.order},{title:"🛠 Admin Panel",command:"app admin"}]];
}

Bot.sendInlineKeyboard(buttons,"❌ STATUS CHECK FAILED\n\nThe provider did not return a valid status. Please try again in a moment.");
