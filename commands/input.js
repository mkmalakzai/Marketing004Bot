/*CMD
  command: input
  help:
  need_reply: true
  folder: CORE
CMD*/

// Text and proof replies for the TPL-004 app command.
if (!user || !user.telegramid) { return; }
if (Bot.getProperty("t4_setup_done") !== "yes" || !Bot.getProperty("t4_owner")) {
  User.setProperty("t4_pending", "", "string");
  Bot.runCommand("/setup");
  return;
}
var uid=String(user.telegramid);
var raw=User.getProperty("t4_pending"), state;
try { state=JSON.parse(raw); } catch(e) { state=null; }
if (!state) { Bot.runCommand("app home"); return; }
User.setProperty("t4_pending", "", "string");
var value=String(typeof message === "undefined" ? "" : message || "").trim();
function get(k,f){var v=Bot.getProperty("t4_"+k);return v===undefined||v===null?f:v;}
function put(k,v){Bot.setProperty("t4_"+k,v,typeof v==="number"?"integer":"string");}
function read(k){try{return JSON.parse(get(k,""));}catch(e){return null;}}
function save(k,v){put(k,JSON.stringify(v));}
function list(k){return read(k)||[];}
function add(k,id){var a=list(k);a.unshift(id);save(k,a);}
function next(type){var n=Number(get("seq_"+type,0))+1;put("seq_"+type,n);return type+"-"+n;}
function fail(text){Bot.sendInlineKeyboard([[{title:"🏠 Main Menu",command:"app home"}]],"⚠️ "+text);}
function money(s){
  s=String(s||"").trim();
  if(!s){return null;}
  var dots=0;
  var i;
  var ch;
  for(i=0;i<s.length;i++){
    ch=s.charAt(i);
    if(ch=="."){dots=dots+1;if(dots>1){return null;}}
    else if(ch<"0"||ch>"9"){return null;}
  }
  var p=s.split(".");
  if(!p[0]||p[0].length>6){return null;}
  if(p.length>1&&(p[1].length<1||p[1].length>2)){return null;}
  var v=Number(p[0])*100+Number(((p[1]||"")+"00").slice(0,2));
  if(v>0){return v;}
  return null;
}
function isUserId(v){
  v=String(v||"");
  if(v.length<5||v.length>16){return false;}
  var i;
  var ch;
  for(i=0;i<v.length;i++){ch=v.charAt(i);if(ch<"0"||ch>"9"){return false;}}
  return true;
}
function wallet(who){return Number(get("wallet_"+who,0));}
function ledger(who,type,ref,delta){var a=list("ledger_"+who);a.unshift({at:new Date().toISOString(),type:type,ref:ref,cents:delta});save("ledger_"+who,a.slice(0,100));}
function setWallet(who,cents,type,ref,delta){put("wallet_"+who,cents);ledger(who,type,ref,delta);}
function notifyAdmins(message){var seen={};if(owner){Api.sendMessage({chat_id:owner,text:message});seen[owner]=true;}for(var i=0;i<admins.length;i++){var a=admins[i];if(a&&!seen[a]){Api.sendMessage({chat_id:a,text:message});seen[a]=true;}}}
var owner=String(get("owner","")),admins=String(get("admins","")).split(",");
var admin=uid===owner||admins.indexOf(uid)>=0;
if(value==="/start"){Bot.runCommand("/start");return;}
if(value==="/admin"||value==="admin"){Bot.runCommand("/admin");return;}
if(value==="/setup"||value==="setup"){Bot.runCommand("/setup");return;}
if(get("ban_"+uid,"no")==="yes"&&!admin&&state.kind!=="ticket"){
  fail("Your account is restricted. Contact Support from the main menu.");return;
}

if(state.kind==="order"){
  var p=read("pkg_"+state.ref),s=p&&read("srv_"+p.srv);
  if(!p||!p.active||!s||!s.active){fail("Package unavailable.");return;}
  if(value.length<5||value.length>700){fail("Send 5–700 characters of link/details. Open the package again to retry.");return;}
  User.setProperty("t4_order_draft",JSON.stringify({pkg:p.id,details:value}),"string");
  Bot.runCommand("app order_preview");return;
}
if(state.kind==="coupon"){
  var draft;try{draft=JSON.parse(User.getProperty("t4_order_draft"));}catch(e){draft=null;}
  if(!draft){fail("Open a package and start an order first.");return;}
  var ids=list("offers"),found=null;
  for(var i=0;i<ids.length;i++){var offer=read("offer_"+ids[i]);if(offer&&offer.active&&offer.percent&&offer.code===value.toUpperCase()){found=offer;break;}}
  if(!found||get("coupon_used_"+found.id+"_"+uid,"no")==="yes"){fail("Invalid or already-used coupon. Open the order preview to continue.");return;}
  draft.offer=found.id;User.setProperty("t4_order_draft",JSON.stringify(draft),"string");Bot.runCommand("app order_preview");return;
}
if(state.kind==="deposit_amount"){
  var m=read("method_"+state.ref),c=money(value);
  if(!m||!m.active||!c){fail("Invalid amount or disabled payment method. Start again from Add Funds.");return;}
  User.setProperty("t4_deposit_draft",JSON.stringify({method:m.id,amount:c}),"string");
  User.setProperty("t4_pending",JSON.stringify({kind:"deposit_proof"}),"string");
  Bot.sendInlineKeyboard([[{title:"🏠 Main Menu",command:"app home"}]],"📷 Send your payment screenshot as a Telegram photo now.");
  Bot.runCommand("input");return;
}
if(state.kind==="deposit_proof"){
  var d;try{d=JSON.parse(User.getProperty("t4_deposit_draft"));}catch(e){d=null;}
  var photo=(typeof request!=="undefined"&&request.photo)||[];
  if(!photo.length||!d){fail("A Telegram photo is required. Restart from Add Funds.");return;}
  var m=read("method_"+d.method);if(!m||!m.active){fail("Payment method unavailable.");return;}
  var id=next("DEP"),proof=photo[photo.length-1].file_id;
  save("deposit_"+id,{id:id,user:uid,amount:d.amount,method:d.method,status:"Pending",proof:proof,created:new Date().toISOString()});
  add("deposits",id);add("user_deposits_"+uid,id);
  User.setProperty("t4_deposit_draft","","string");
  notifyAdmins("💳 New deposit "+id+"\nUser: "+uid+"\nAmount: $"+(d.amount/100).toFixed(2)+"\nReview in Admin Panel → Deposits.");
  Api.sendPhoto({chat_id:owner,photo:proof,caption:"💳 Deposit "+id+" proof\nUser: "+uid+"\nAmount: $"+(d.amount/100).toFixed(2)});
  Bot.sendInlineKeyboard([[{title:"💰 Balance",command:"app balance"}]],"✅ Deposit "+id+" submitted. An admin will review it.");return;
}
if(state.kind==="ticket"){
  if(value.length<5||value.length>700){fail("Ticket message must be 5–700 characters.");return;}
  var id=next("TKT");save("ticket_"+id,{id:id,user:uid,message:value,status:"Open",reply:"",created:new Date().toISOString()});add("tickets",id);add("user_tickets_"+uid,id);
  notifyAdmins("🎫 New ticket "+id+" from "+uid+"\n"+value);Bot.runCommand("app ticket "+id);return;
}
if(!admin){Bot.runCommand("app home");return;}

if(state.kind==="admin_provider_step"){
  var r=state.ref||{},step=Number(r.step||0),editing=r.editing===true,p=r.data||{};
  function providerAsk(nextStep,label){
    User.setProperty("t4_pending",JSON.stringify({kind:"admin_provider_step",ref:{step:nextStep,id:r.id||"",editing:editing,data:p}}),"string");
    Bot.sendInlineKeyboard([[{title:"✖ Cancel",command:editing&&r.id?"app admin_provider "+r.id:"app admin_providers"}]],label);
    Bot.runCommand("input",{waitForAnswer:true});
  }
  if(step===1){
    if(!value||value.length>60){fail("Provider name must be 1–60 characters.");return;}
    p.name=value;providerAsk(2,"🌐 Send API URL.\n\nExample: https://followiz.com/api/v2");return;
  }
  if(step===2){
    if(value.indexOf("https://")!==0||value.length>200){fail("Send a valid HTTPS API URL.");return;}
    p.api_url=value;providerAsk(3,"🔑 Send API key.\n\nIt will be stored in bot properties, not shown in the provider list.");return;
  }
  if(step===3){
    if(!value||value.length<8||value.length>300){fail("API key looks invalid.");return;}
    p.api_key=value;p.type="SMM API";p.active=true;
    if(!editing){
      var pid=next("PRV");p.id=pid;add("providers",pid);
    }
    save("provider_"+p.id,p);
    Bot.sendInlineKeyboard([[{title:"🔌 Open Provider",command:"app admin_provider "+p.id},{title:"🛠 Admin Panel",command:"app admin"}]],"✅ Provider saved.\n\n"+p.name+" • "+p.id);return;
  }
  fail("Unknown provider step.");return;
}


if(state.kind==="admin_provider_service_id"){
  var pid=String(state.ref||"");
  var p=read("provider_"+pid);
  if(!p||p.deleted){fail("Provider not found.");return;}
  var sid=String(value||"").trim();
  var ok=sid.length>0&&sid.length<=20;
  var si,ch;
  for(si=0;si<sid.length;si++){ch=sid.charAt(si);if(ch<"0"||ch>"9"){ok=false;break;}}
  if(!ok){fail("Send a numeric service ID.");return;}
  var saved=read("provider_service_"+pid+"_"+sid);
  if(saved){Bot.sendInlineKeyboard([[{title:"🔌 Provider",command:"app admin_provider "+pid}]],"⚠️ Service ID "+sid+" is already saved.");return;}
  save("provider_service_"+pid+"_"+sid,{provider:pid,service:sid,name:"Service "+sid,active:true});
  add("provider_services_"+pid,sid);
  Bot.sendInlineKeyboard([[{title:"➕ Add Another",command:"app admin_provider_service_add "+pid},{title:"🔌 Provider",command:"app admin_provider "+pid}]],"✅ Service ID "+sid+" saved.");return;
}

if(state.kind==="admin_user_find"){
  if(!isUserId(value)){fail("Enter a numeric Telegram ID.");return;}
  Bot.runCommand("app admin_user "+value);return;
}
if(state.kind==="admin_wallet_add"||state.kind==="admin_wallet_remove"){
  var who=state.ref,c=money(value);if(!isUserId(who)||get("user_seen_"+who,"no")!=="yes"||!c){fail("Invalid user or amount.");return;}
  var before=wallet(who),delta=state.kind==="admin_wallet_add"?c:-c;if(before+delta<0){fail("Cannot reduce balance below $0.00.");return;}
  setWallet(who,before+delta,state.kind==="admin_wallet_add"?"Admin Credit":"Admin Debit","ADMIN",delta);
  Api.sendMessage({chat_id:who,text:(delta>0?"💰 Balance credited: +":"💸 Balance adjusted: ")+(delta/100).toFixed(2)+" USD\nNew balance: $"+((before+delta)/100).toFixed(2)});
  Bot.runCommand("app admin_user "+who);return;
}
if(state.kind==="admin_find"){
  var type=state.ref,v=value.toUpperCase(),prefix={order:"ORD-",deposit:"DEP-",ticket:"TKT-"}[type];if(!prefix||v.indexOf(prefix)!==0||!read(type+"_"+v)){fail("Record not found.");return;}
  Bot.runCommand("app admin_"+type+" "+v);return;
}
if(state.kind==="admin_order_note"||state.kind==="admin_order_delivery"){
  var o=read("order_"+state.ref);if(!o||!value||value.length>700){fail("Invalid order or text.");return;}
  if(state.kind==="admin_order_note")o.admin_note=value;else o.delivery_result=value;
  save("order_"+o.id,o);Api.sendMessage({chat_id:o.user,text:"📦 Order "+o.id+" update:\n"+value});Bot.runCommand("app admin_order "+o.id);return;
}
if(state.kind==="admin_broadcast"){
  if(uid!==owner)return;
  if(!value||value.length>700){fail("Message must be 1–700 characters.");return;}
  User.setProperty("t4_broadcast_draft",value,"string");
  Bot.runCommand("app admin_broadcast_preview");return;
}
if(state.kind==="admin_reply"){
  var t=read("ticket_"+state.ref);if(!t||!value||value.length>700){fail("Invalid ticket or reply.");return;}
  t.reply=value;t.status="Answered";save("ticket_"+t.id,t);
  Api.sendMessage({chat_id:t.user,text:"🎫 Reply to "+t.id+":\n"+value});Bot.runCommand("app admin_ticket "+t.id);return;
}
if(state.kind==="admin_setting"){
  if(uid!==owner)return;
  if(state.ref==="admins"){
    var ids="";
    if(value!="-"){
      var rawIds=value.split(",");
      var clean=[];
      var ai;
      var one;
      for(ai=0;ai<rawIds.length;ai++){
        one=String(rawIds[ai]||"").trim();
        if(!isUserId(one)){fail("Send comma-separated numeric Telegram IDs.");return;}
        clean.push(one);
      }
      ids=clean.join(",");
    }
    put("admins",ids);
  }else if(state.ref==="store_name"){
    if(value.length<2||value.length>60||value.indexOf("\n")>=0||value.indexOf("\r")>=0){fail("Use a single line with 2–60 characters.");return;}
    put("store_name",value);
  }else return;
  Bot.runCommand("app admin_settings");return;
}
if(state.kind==="admin_add"||state.kind==="admin_edit"||state.kind==="admin_item_step"){
  var editing=state.kind==="admin_edit";
  var type, itemId, step, x;
  if(state.kind==="admin_item_step"){
    type=state.ref.type; itemId=state.ref.id||""; step=Number(state.ref.step||0); editing=state.ref.editing===true;
    x=state.ref.data||{};
  }else{
    var parts=String(state.ref||"").split(":");
    type=parts[0]; itemId=editing?(parts[1]||""):""; step=0;
    x=editing?read(type+"_"+itemId):{};
    if(editing&&(!x||x.deleted)){fail("Item not found.");return;}
  }
  function stepAsk(n,label){
    User.setProperty("t4_pending",JSON.stringify({kind:"admin_item_step",ref:{type:type,id:itemId,step:n,editing:editing,data:x}}),"string");
    Bot.sendInlineKeyboard([[{title:"✖ Cancel",command:"app "+({cat:"admin_cats",srv:"admin_services",pkg:"admin_packages",method:"admin_methods",offer:"admin_offers"}[type]||"admin")}]],label);
    Bot.runCommand("input",{waitForAnswer:true});
  }
  function finish(){
    if(!editing){
      var labels={cat:"CAT",srv:"SRV",pkg:"PKG",method:"PAY",offer:"OFR"};
      var buckets={cat:"cats",srv:"services",pkg:"packages",method:"methods",offer:"offers"};
      x.id=next(labels[type]);x.active=true;add(buckets[type],x.id);
    }
    save(type+"_"+x.id,x);Bot.runCommand("app admin_item "+type+" "+x.id);
  }
  if(type==="cat"){
    if(step===0){stepAsk(1,"📁 Send category name.");return;}
    if(!value||value.length>60){fail("Category name must be 1–60 characters.");return;}
    x.name=value;finish();return;
  }
  if(type==="srv"){
    if(step===0){stepAsk(1,"📁 Send existing Category ID, e.g. CAT-1");return;}
    if(step===1){
      if(x.cat){if(!value||value.length>60){fail("Service name must be 1–60 characters.");return;}x.name=value;stepAsk(3,"📝 Send service description.");return;}
      if(!read("cat_"+value.toUpperCase())){fail("Category not found.");return;}x.cat=value.toUpperCase();stepAsk(2,"🚀 Send service name.");return;
    }
    if(step===2){if(!value||value.length>60){fail("Service name must be 1–60 characters.");return;}x.name=value;stepAsk(3,"📝 Send service description.");return;}
    if(!value||value.length>300){fail("Description must be 1–300 characters.");return;}x.description=value;finish();return;
  }
  if(type==="pkg"){
    if(step===0){stepAsk(1,"🚀 Send existing Service ID, e.g. SRV-1");return;}
    if(step===1){
      if(x.srv){if(!value||value.length>60){fail("Package name must be 1–60 characters.");return;}x.name=value;stepAsk(3,"💵 Send price in USD, e.g. 5.00");return;}
      if(!read("srv_"+value.toUpperCase())){fail("Service not found.");return;}x.srv=value.toUpperCase();stepAsk(2,"📦 Send package name.");return;
    }
    if(step===2){if(!value||value.length>60){fail("Package name must be 1–60 characters.");return;}x.name=value;stepAsk(3,"💵 Send price in USD, e.g. 5.00");return;}
    if(step===3){var pc=money(value);if(!pc){fail("Invalid price.");return;}x.price=pc;stepAsk(4,"⏱ Send delivery time, e.g. 1–24 hours.");return;}
    if(step===4){if(!value||value.length>100){fail("Delivery must be 1–100 characters.");return;}x.delivery=value;stepAsk(5,"🔗 What input must the user send? e.g. Post link");return;}
    if(step===5){if(!value||value.length>100){fail("Required input must be 1–100 characters.");return;}x.requirement=value;stepAsk(6,"📝 Send package description.");return;}
    if(step===6){
      if(!value||value.length>300){fail("Description must be 1–300 characters.");return;}
      x.description=value;
      if(x.mode==="api"){stepAsk(7,"🔢 Send fixed quantity for this API package.\n\nExample: 1000");return;}
      x.mode="manual";finish();return;
    }
    if(step===7){
      var qty=Number(value),goodQty=qty==Math.floor(qty)&&qty>0&&qty<=10000000;
      if(!goodQty){fail("Quantity must be a whole number from 1 to 10000000.");return;}
      x.quantity=qty;x.mode="api";finish();return;
    }
    fail("Unknown package step.");return;
  }
  if(type==="method"){
    if(step===0){stepAsk(1,"💳 Send payment method name.");return;}
    if(step===1){if(!value||value.length>60){fail("Method name must be 1–60 characters.");return;}x.name=value;stepAsk(2,"📋 Send payment address / instructions.");return;}
    if(!value||value.length>400){fail("Instructions must be 1–400 characters.");return;}x.address=value;finish();return;
  }
  if(type==="offer"){
    if(step===0){stepAsk(1,"🎁 Send offer title.");return;}
    if(step===1){if(!value||value.length>60){fail("Title must be 1–60 characters.");return;}x.title=value;stepAsk(2,"📝 Send offer description.");return;}
    if(step===2){if(!value||value.length>400){fail("Description must be 1–400 characters.");return;}x.description=value;stepAsk(3,"🎟 Send coupon code, or send - for no coupon.");return;}
    if(step===3){
      if(value==="-"){x.code="";x.percent=0;finish();return;}
      var code=value.toUpperCase(),good=true,ci,cc,az,dg;
      if(code.length<3||code.length>20)good=false;
      for(ci=0;ci<code.length;ci++){cc=code.charAt(ci);az=cc>="A"&&cc<="Z";dg=cc>="0"&&cc<="9";if(!az&&!dg){good=false;break;}}
      if(!good){fail("Coupon needs 3–20 letters/numbers.");return;}
      var all=list("offers");for(var j=0;j<all.length;j++){var prev=read("offer_"+all[j]);if(prev&&prev.code===code&&(!editing||prev.id!==x.id)){fail("Coupon code already exists.");return;}}
      x.code=code;stepAsk(4,"📉 Send discount percent from 1 to 90.");return;
    }
    var pct=Number(value);if(pct!=Math.floor(pct)||pct<1||pct>90){fail("Percent must be 1–90.");return;}x.percent=pct;finish();return;
  }
  fail("Unknown item type.");return;
}
Bot.runCommand("app home");
