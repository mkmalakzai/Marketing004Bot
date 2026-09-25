/*CMD
  command: provider_order_result
  help:
  need_reply: false
  folder: PROVIDERS
CMD*/

if (!user || !user.telegramid) { return; }

var uid=String(user.telegramid);
var owner=String(Bot.getProperty("t4_owner")||"");
var admins=String(Bot.getProperty("t4_admins")||"").split(",");
if(uid!==owner&&admins.indexOf(uid)<0){return;}

function read(k){
  var v=Bot.getProperty("t4_"+k);
  try{return v?JSON.parse(v):null;}catch(e){return null;}
}
function save(k,v){
  Bot.setProperty("t4_"+k,JSON.stringify(v),"string");
}
function wallet(who){
  return Number(Bot.getProperty("t4_wallet_"+who)||0);
}
function addLedger(who,type,ref,delta){
  var raw=Bot.getProperty("t4_ledger_"+who)||"[]";
  var a;try{a=JSON.parse(raw);}catch(e){a=[];}
  a.unshift({at:new Date().toISOString(),type:type,ref:ref,cents:delta});
  Bot.setProperty("t4_ledger_"+who,JSON.stringify(a.slice(0,100)),"string");
}
function refund(o,reason){
  if(o.api_refunded){return;}
  var amount=Number(o.price||0);
  Bot.setProperty("t4_wallet_"+o.user,wallet(o.user)+amount,"integer");
  addLedger(o.user,"API Refund",o.id,amount);
  o.api_refunded=true;
  o.api_refund_reason=reason;
}

var ctx;
try{ctx=JSON.parse(User.getProperty("t4_api_order_request"));}catch(e){ctx=null;}
if(!ctx||!ctx.order){return;}

var o=read("order_"+ctx.order);
if(!o){return;}

var raw=String(content||"");
var data;
try{data=JSON.parse(raw);}catch(e){data=null;}

if(!data||data.error||!data.order){
  var err=data&&data.error?String(data.error):"Invalid provider response";
  refund(o,err);
  o.status="API Failed";
  o.api_error=err;
  save("order_"+o.id,o);
  Api.sendMessage({chat_id:o.user,text:"⚠️ Order "+o.id+" could not be sent to the provider. Your payment was refunded."});
  if(owner){Api.sendMessage({chat_id:owner,text:"⚠️ API order failed "+o.id+"\n"+err});}
  return;
}

o.provider_order_id=String(data.order);
o.status="Processing";
o.api_error="";
save("order_"+o.id,o);

Api.sendMessage({chat_id:o.user,text:"✅ Order "+o.id+" was accepted by the provider.\nStatus: Processing"});
if(owner){Api.sendMessage({chat_id:owner,text:"⚡ API order sent "+o.id+"\nProvider Order: "+o.provider_order_id});}
