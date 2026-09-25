/*CMD
  command: provider_status_result
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
if(!ctx||!ctx.order){return;}

var raw=Bot.getProperty("t4_order_"+ctx.order);
var o;
try{o=JSON.parse(raw);}catch(e){o=null;}
if(!o){return;}

var data;
try{data=JSON.parse(String(content||""));}catch(e){data=null;}
if(!data||data.error){
  Bot.sendMessage("❌ Status error: "+(data&&data.error?data.error:"Invalid provider response"));
  return;
}

var s=String(data.status||"");
if(s==="Completed"){o.status="Completed";}
else if(s==="Partial"){o.status="Partial";}
else if(s==="Canceled"||s==="Cancelled"){o.status="Cancelled";}
else if(s==="Refunded"){o.status="Refunded";}
else if(s==="In progress"||s==="Processing"){o.status="Processing";}
else if(s==="Pending"){o.status="Pending";}

o.provider_status=s;
o.provider_charge=String(data.charge||"");
o.provider_remains=String(data.remains||"");
Bot.setProperty("t4_order_"+o.id,JSON.stringify(o),"string");

Bot.sendInlineKeyboard(
  [[{title:"🛒 Open Order",command:"app admin_order "+o.id}]],
  "✅ PROVIDER STATUS UPDATED\n\nOrder: "+o.id+"\nStatus: "+s+(o.provider_remains?"\nRemaining: "+o.provider_remains:"")+(o.provider_charge?"\nProvider charge: "+o.provider_charge:"")
);
