/*CMD
  command: provider_order_error
  help:
  need_reply: false
  folder: PROVIDERS
CMD*/

if (!user || !user.telegramid) { return; }

var owner=String(Bot.getProperty("t4_owner")||"");
var ctx;
try{ctx=JSON.parse(User.getProperty("t4_api_order_request"));}catch(e){ctx=null;}
if(!ctx||!ctx.order){return;}

var raw=Bot.getProperty("t4_order_"+ctx.order);
var o;
try{o=JSON.parse(raw);}catch(e){o=null;}
if(!o){return;}

if(!o.api_refunded){
  var bal=Number(Bot.getProperty("t4_wallet_"+o.user)||0);
  var amount=Number(o.price||0);
  Bot.setProperty("t4_wallet_"+o.user,bal+amount,"integer");

  var lraw=Bot.getProperty("t4_ledger_"+o.user)||"[]";
  var ledger;
  try{ledger=JSON.parse(lraw);}catch(e){ledger=[];}
  ledger.unshift({at:new Date().toISOString(),type:"API Refund",ref:o.id,cents:amount});
  Bot.setProperty("t4_ledger_"+o.user,JSON.stringify(ledger.slice(0,100)),"string");

  o.api_refunded=true;
}

o.status="API Failed";
o.api_error="Provider request failed";
Bot.setProperty("t4_order_"+o.id,JSON.stringify(o),"string");

Api.sendMessage({chat_id:o.user,text:"⚠️ ORDER FAILED\n\nOrder: "+o.id+"\nThe provider connection failed before the order could be confirmed.\nRefund: Completed\nAmount returned: $"+(Number(o.price||0)/100).toFixed(2)+"\n\nPlease try again later."});
if(owner){Api.sendMessage({chat_id:owner,text:"⚠️ PROVIDER REQUEST FAILED\n\nOrder: "+o.id+"\nThe user was refunded automatically."});}
