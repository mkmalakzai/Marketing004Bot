/*CMD
  command: provider_services_result
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
if(!data.length){
  Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+ctx.provider}]],"⚠️ No services returned.");
  return;
}
var keep=[],i,s;
for(i=0;i<data.length&&i<500;i++){
  s=data[i]||{};
  keep.push({
    service:String(s.service||""),
    name:String(s.name||""),
    type:String(s.type||""),
    category:String(s.category||""),
    rate:String(s.rate||""),
    min:String(s.min||""),
    max:String(s.max||""),
    refill:s.refill===true,
    cancel:s.cancel===true
  });
}
Bot.setProperty("t4_provider_services_"+ctx.provider,JSON.stringify(keep),"string");
Bot.setProperty("t4_provider_services_count_"+ctx.provider,keep.length,"integer");
var lines=[],limit=keep.length<12?keep.length:12;
for(i=0;i<limit;i++){
  s=keep[i];
  lines.push(s.service+" • "+s.name+" • $"+s.rate+"/1000");
}
Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+ctx.provider},{title:"🛠 Admin Panel",command:"app admin"}]],"✅ Services fetched: "+keep.length+"\n\n"+lines.join("\n")+(keep.length>limit?"\n\nShowing first "+limit+".":""));
