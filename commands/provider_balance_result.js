/*CMD
  command: provider_balance_result
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
if(!ctx||!ctx.provider){Bot.runCommand("app admin_providers");return;}
var raw=String(content||"");
var data;try{data=JSON.parse(raw);}catch(e){data=null;}
if(!data){
  Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+ctx.provider}]],"❌ Invalid API response.\n\n"+raw.slice(0,300));
  return;
}
if(data.error){
  Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+ctx.provider}]],"❌ API Error\n\n"+data.error);
  return;
}
var bal=data.balance;
var cur=data.currency||"";
var title=ctx.mode==="admin_provider_test"?"✅ Connection Successful":"💰 Provider Balance";
var text=title+"\n\nBalance: "+bal+" "+cur;
Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+ctx.provider},{title:"🛠 Admin Panel",command:"app admin"}]],text);
