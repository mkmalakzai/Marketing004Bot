/*CMD
  command: input
  help:
  need_reply: true
  folder: CORE
CMD*/

// Text and proof replies for the TPL-004 app command.
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
function money(s){if(!/^(0|[1-9][0-9]{0,5})(\.[0-9]{1,2})?$/.test(s))return null;var p=s.split(".");var v=Number(p[0])*100+Number(((p[1]||"")+"00").slice(0,2));return v>0?v:null;}
var owner=String(get("owner","6589090462")),admins=String(get("admins","")).split(",");
var admin=uid===owner||admins.indexOf(uid)>=0;
if(value==="/start"){Bot.runCommand("/start");return;}

if(state.kind==="order"){
  var p=read("pkg_"+state.ref),s=p&&read("srv_"+p.srv);
  if(!p||!p.active||!s||!s.active){fail("Package unavailable.");return;}
  if(value.length<5||value.length>700){fail("Send 5–700 characters of link/details. Open the package again to retry.");return;}
  User.setProperty("t4_order_draft",JSON.stringify({pkg:p.id,details:value}),"string");
  Bot.runCommand("app order_preview");return;
}
if(state.kind==="deposit_amount"){
  var m=read("method_"+state.ref),c=money(value);
  if(!m||!m.active||!c){fail("Invalid amount or disabled payment method. Start again from Add Funds.");return;}
  User.setProperty("t4_deposit_draft",JSON.stringify({method:m.id,amount:c}),"string");
  User.setProperty("t4_pending",JSON.stringify({kind:"deposit_proof"}),"string");
  Bot.sendInlineKeyboard([[{title:"🏠 Main Menu",command:"app home"}]],"📷 Send your payment screenshot as a Telegram photo now.");
  Bot.handleNextCommand("input");return;
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
  Api.sendPhoto({chat_id:owner,photo:proof,caption:"💳 Deposit "+id+"\nUser: "+uid+"\nAmount: $"+(d.amount/100).toFixed(2)+"\nReview in Admin Panel → Deposits."});
  Bot.sendInlineKeyboard([[{title:"💰 Balance",command:"app balance"}]],"✅ Deposit "+id+" submitted. An admin will review it.");return;
}
if(state.kind==="ticket"){
  if(value.length<5||value.length>700){fail("Ticket message must be 5–700 characters.");return;}
  var id=next("TKT");save("ticket_"+id,{id:id,user:uid,message:value,status:"Open",reply:"",created:new Date().toISOString()});add("tickets",id);add("user_tickets_"+uid,id);
  Api.sendMessage({chat_id:owner,text:"🎫 New ticket "+id+" from "+uid+"\n"+value});Bot.runCommand("app ticket "+id);return;
}
if(!admin){Bot.runCommand("app home");return;}
if(state.kind==="admin_user_find"){
  if(!/^\d{5,16}$/.test(value)){fail("Enter a numeric Telegram ID.");return;}
  Bot.runCommand("app admin_user "+value);return;
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
    var ids=value.replace(/\s/g,"");if(ids&&!/^\d{5,16}(,\d{5,16})*$/.test(ids)){fail("Send comma-separated numeric Telegram IDs.");return;}
    put("admins",ids);
  }else return;
  Bot.runCommand("app admin_settings");return;
}
if(state.kind==="admin_add"||state.kind==="admin_edit"){
  var editing=state.kind==="admin_edit",parts=state.ref.split(":"),type=parts[0],old=editing?read(type+"_"+parts[1]):null;
  if(editing&&!old){fail("Item not found.");return;}
  var f=value.split("|").map(function(x){return x.trim();}),x=old||{};
  if(type==="cat"){
    if(f.length!==1||!f[0]||f[0].length>60){fail("Send one category name, up to 60 characters.");return;}
    x.name=f[0];
  }else if(type==="srv"){
    if(f.length!==3||!read("cat_"+f[0])||!f[1]||!f[2]){fail("Use: existing category ID | name | description.");return;}
    x.cat=f[0];x.name=f[1].slice(0,60);x.description=f[2].slice(0,300);
  }else if(type==="pkg"){
    var cents=money(f[2]||"");
    if(f.length!==7||!read("srv_"+f[0])||!f[1]||!cents||!f[3]||!f[4]||f[6].toLowerCase()!=="manual"){fail("Use: service ID | name | price USD | delivery | required input | description | manual. Invalid field.");return;}
    x.srv=f[0];x.name=f[1].slice(0,60);x.price=cents;x.delivery=f[3].slice(0,100);x.requirement=f[4].slice(0,100);x.description=f[5].slice(0,300);x.mode=f[6].toLowerCase();
  }else if(type==="method"){
    if(f.length!==2||!f[0]||!f[1]){fail("Use: payment method name | address/instructions.");return;}
    x.name=f[0].slice(0,60);x.address=f[1].slice(0,400);
  }else if(type==="offer"){
    if(f.length!==2||!f[0]||!f[1]){fail("Use: title | description.");return;}
    x.title=f[0].slice(0,60);x.description=f[1].slice(0,400);
  }else return;
  if(!editing){
    var labels={cat:"CAT",srv:"SRV",pkg:"PKG",method:"PAY",offer:"OFR"};
    var buckets={cat:"cats",srv:"services",pkg:"packages",method:"methods",offer:"offers"};
    x.id=next(labels[type]);x.active=true;add(buckets[type],x.id);
  }
  save(type+"_"+x.id,x);Bot.runCommand("app admin_item "+type+" "+x.id);return;
}
Bot.runCommand("app home");
