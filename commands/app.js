/*CMD
  command: app
  help:
  need_reply: false
  folder: CORE
CMD*/

// TPL-004 routing. All money is stored as integer USD cents.
var uid = String(user.telegramid);
var args = String(typeof params === "undefined" ? "" : params || "").split(" ");
var action = args[0] || "home", id = args[1] || "";
var owner = String(Bot.getProperty("t4_owner") || "6589090462");
var admins = String(Bot.getProperty("t4_admins") || "").split(",");
var admin = uid === owner || admins.indexOf(uid) >= 0;
function get(k, fallback) { var v = Bot.getProperty("t4_" + k); return v === undefined || v === null ? fallback : v; }
function put(k, v) { Bot.setProperty("t4_" + k, v, typeof v === "number" ? "integer" : "string"); }
function list(k) { var v = get(k, "[]"); try { return JSON.parse(v); } catch(e) { return []; } }
function saveList(k, v) { put(k, JSON.stringify(v)); }
function obj(k) { var v = get(k, ""); try { return v ? JSON.parse(v) : null; } catch(e) { return null; } }
function save(k, v) { put(k, JSON.stringify(v)); }
function key(type, n) { return type + "_" + n; }
function newId(type) { var n = Number(get("seq_" + type, 0)) + 1; put("seq_" + type, n); return type + "-" + n; }
function row(title, command) { return [{ title: title, command: "app " + command }]; }
function show(title, lines, buttons) { buttons.push(row("🏠 Main Menu", "home")); Bot.sendInlineKeyboard(buttons, title + "\n\n" + lines); }
function money(c) { return "$" + (Number(c || 0) / 100).toFixed(2); }
function notify(who, message) { Api.sendMessage({ chat_id: who, text: message }); }
function wallet(who) { return Number(get("wallet_" + who, 0)); }
function entries(who, type, id, delta) { var a = list("ledger_" + who); a.unshift({ at: new Date().toISOString(), type: type, ref: id, cents: delta }); saveList("ledger_" + who, a.slice(0, 100)); }
function setWallet(who, cents, type, ref, delta) { put("wallet_" + who, cents); entries(who, type, ref, delta); }
function amount(text) { var s = String(text || "").trim(); if (!/^(0|[1-9][0-9]{0,5})(\.[0-9]{1,2})?$/.test(s)) return null; var p=s.split("."); var n=Number(p[0])*100+Number(((p[1]||"")+"00").slice(0,2)); return n > 0 ? n : null; }
function safe(s) { return String(s || "").slice(0, 700); }
function ask(kind, ref, label) { User.setProperty("t4_pending", JSON.stringify({ kind: kind, ref: ref }), "string"); Bot.sendInlineKeyboard(row("✖ Cancel", "home"), label + "\n\nSend one text reply. /start cancels the step."); Bot.handleNextCommand("input"); }
function belong(o) { return o && String(o.user) === uid; }
if (get("ban_" + uid, "no") === "yes" && !admin && ["support","ticket_input","tickets","ticket"].indexOf(action)<0) { Bot.sendInlineKeyboard(row("🎫 Support", "support"), "🚫 Your account is restricted."); return; }

if (action === "home") {
  var b = [
    [{title:"🚀 Services",command:"app services"},{title:"📦 My Orders",command:"app my_orders"}],
    [{title:"💰 Balance",command:"app balance"},{title:"🎁 Offers",command:"app offers"}],
    [{title:"📊 My Stats",command:"app stats"},{title:"🎫 Support",command:"app support"}],
    row("👤 My Account", "account")
  ];
  if (admin) b.push(row("🛠 Admin Panel", "admin"));
  Bot.sendInlineKeyboard(b, "🏠 MARKETING & PROMOTION\n\nChoose an option."); return;
}
if (action === "account") {
  show("👤 MY ACCOUNT", "User ID: " + uid + "\nOrders: " + list("user_orders_" + uid).length + "\nBalance: " + money(wallet(uid)) + "\n\nPowered by BOTBOX • @BotboxOfficial", []); return;
}
if (action === "services") {
  var cats = list("cats"), buttons = [];
  for (var i=0;i<cats.length;i++) { var c=obj(key("cat",cats[i])); if(c && c.active) buttons.push(row("📁 " + c.name,"cat " + c.id)); }
  show("🚀 SERVICES", buttons.length ? "Choose a category." : "No active categories yet.", buttons); return;
}
if (action === "cat") {
  var c=obj(key("cat",id)); if(!c || !c.active) { Bot.runCommand("app services"); return; }
  var services=list("services"), buttons=[];
  for(var i=0;i<services.length;i++){ var s=obj(key("srv",services[i])); if(s && s.active && s.cat===id) buttons.push(row("🚀 "+s.name,"service "+s.id)); }
  buttons.push(row("◀ Categories","services")); show("📁 "+c.name,buttons.length>1?"Choose a service.":"No active services.",buttons); return;
}
if (action === "service") {
  var s=obj(key("srv",id)); if(!s || !s.active) { Bot.runCommand("app services"); return; }
  var packages=list("packages"), buttons=[];
  for(var i=0;i<packages.length;i++){ var p=obj(key("pkg",packages[i])); if(p && p.active && p.srv===id) buttons.push(row(p.name+" • "+money(p.price),"package "+p.id)); }
  buttons.push(row("◀ Category","cat "+s.cat)); show("🚀 "+s.name,s.description+"\n\nChoose a package.",buttons); return;
}
if (action === "package") {
  var p=obj(key("pkg",id)), s=p && obj(key("srv",p.srv)); if(!p || !p.active || !s || !s.active){ Bot.runCommand("app services"); return; }
  show("📦 "+p.name,"Price: "+money(p.price)+"\nDelivery: "+safe(p.delivery)+"\nRequired: "+safe(p.requirement)+"\nMode: "+p.mode+"\n\n"+safe(p.description),[row("🛒 Continue","order_input "+p.id),row("◀ Service","service "+p.srv)]); return;
}
if (action === "order_input") { var p=obj(key("pkg",id)); if(!p || !p.active){Bot.runCommand("app services");return;} ask("order",id,"Send the required link/details for " + p.name + ": " + p.requirement); return; }
if (action === "order_preview") {
  var draft=User.getProperty("t4_order_draft"); try{draft=JSON.parse(draft);}catch(e){draft=null;}
  var p=draft && obj(key("pkg",draft.pkg)); if(!p || !p.active){Bot.runCommand("app services");return;}
  var offer=draft.offer&&obj(key("offer",draft.offer));if(!offer||!offer.active||!offer.percent)offer=null;
  var discount=offer?Math.floor(p.price*offer.percent/100):0;
  show("🛒 ORDER PREVIEW",p.name+"\nPrice: "+money(p.price)+(offer?"\nCoupon: "+offer.code+" (−"+money(discount)+")":"")+"\nTotal: "+money(p.price-discount)+"\nYour balance: "+money(wallet(uid))+"\nDetails: "+safe(draft.details),[row("🎟 Enter Coupon","order_coupon"),row("✅ Pay & Order","order_confirm"),row("✖ Cancel","services")]); return;
}
if (action === "order_coupon") {var draft=User.getProperty("t4_order_draft");if(!draft){Bot.runCommand("app services");return;}ask("coupon","","Enter your coupon code.");return;}
if (action === "order_confirm") {
  var draft=User.getProperty("t4_order_draft"); try{draft=JSON.parse(draft);}catch(e){draft=null;}
  var p=draft && obj(key("pkg",draft.pkg)), s=p && obj(key("srv",p.srv));
  if(!draft || !p || !p.active || !s || !s.active){Bot.runCommand("app services");return;}
  var offer=draft.offer&&obj(key("offer",draft.offer));
  if(draft.offer&&(!offer||!offer.active||!offer.percent||get("coupon_used_"+offer.id+"_"+uid,"no")==="yes")){show("⚠️ COUPON EXPIRED","Open order preview and select another coupon.",[row("◀ Preview","order_preview")]);return;}
  var finalPrice=p.price-(offer?Math.floor(p.price*offer.percent/100):0);
  if(wallet(uid)<finalPrice){show("💰 INSUFFICIENT BALANCE","Total: "+money(finalPrice)+"\nBalance: "+money(wallet(uid)),[row("Add Funds","deposit_methods")]);return;}
  User.setProperty("t4_order_draft","","string");
  var oid=newId("ORD"); var order={id:oid,user:uid,package:p.id,name:p.name,price:finalPrice,original_price:p.price,coupon:offer?offer.code:"",details:draft.details,status:"Pending",mode:p.mode,created:new Date().toISOString()};
  save(key("order",oid),order);
  var all=list("orders");all.unshift(oid);saveList("orders",all);
  var mine=list("user_orders_"+uid);mine.unshift(oid);saveList("user_orders_"+uid,mine);
  setWallet(uid,wallet(uid)-finalPrice,"Order",oid,-finalPrice);
  if(offer)put("coupon_used_"+offer.id+"_"+uid,"yes");
  notify(owner,"🛒 New order "+oid+"\n"+p.name+"\nUser: "+uid+"\nPrice: "+money(finalPrice));
  show("✅ ORDER PLACED",oid+"\nStatus: Pending\nPrice: "+money(finalPrice),[row("📦 View Order","order "+oid)]); return;
}
if (action === "my_orders") {
  var ids=list("user_orders_"+uid), buttons=[]; for(var i=0;i<ids.length && i<15;i++){ var o=obj(key("order",ids[i]));if(o)buttons.push(row(o.id+" • "+o.status,"order "+o.id)); }
  show("📦 MY ORDERS",buttons.length?"Choose an order (latest 15).":"You haven't placed an order yet.",buttons);return;
}
if (action === "order") { var o=obj(key("order",id)); if(!belong(o) && !admin){Bot.runCommand("app home");return;} show("📦 "+o.id,o.name+"\nStatus: "+o.status+"\nPrice: "+money(o.price)+"\nDetails: "+safe(o.details)+(o.provider_id?"\nProvider ID: "+o.provider_id:""),admin?[row("🛠 Manage","admin_order "+id)]:[row("◀ My Orders","my_orders")]);return; }
if (action === "balance") { var b=[row("➕ Add Funds","deposit_methods"),row("🧾 Transactions","ledger"),row("📨 My Deposits","my_deposits")];show("💰 YOUR BALANCE",money(wallet(uid))+" USD",b);return; }
if (action === "my_deposits") {var ids=list("user_deposits_"+uid),b=[];for(var i=0;i<ids.length&&i<15;i++){var d=obj(key("deposit",ids[i]));if(d)b.push(row(d.id+" • "+d.status+" • "+money(d.amount),"my_deposit "+d.id));}show("📨 MY DEPOSITS",b.length?"Latest 15 requests.":"No deposits yet.",b);return;}
if (action === "my_deposit") {var d=obj(key("deposit",id));if(!belong(d)){Bot.runCommand("app balance");return;}show("💳 "+d.id,"Amount: "+money(d.amount)+"\nMethod: "+d.method+"\nStatus: "+d.status,[row("◀ My Deposits","my_deposits")]);return;}
if (action === "ledger") {var a=list("ledger_"+uid), lines=[];for(var i=0;i<a.length && i<10;i++)lines.push((a[i].cents>=0?"+":"")+money(a[i].cents)+" • "+a[i].type+" • "+a[i].ref);show("🧾 TRANSACTIONS",lines.join("\n")||"No transactions yet.",[row("◀ Balance","balance")]);return;}
if (action === "deposit_methods") {var ids=list("methods"),b=[];for(var i=0;i<ids.length;i++){var m=obj(key("method",ids[i]));if(m&&m.active)b.push(row(m.name,"deposit "+m.id));}show("➕ ADD FUNDS",b.length?"Choose a method.":"No deposit methods enabled.",b);return;}
if (action === "deposit") {var m=obj(key("method",id));if(!m||!m.active){Bot.runCommand("app deposit_methods");return;}show("💳 "+m.name,"Address / instructions:\n"+m.address+"\n\nPay first, then submit the exact amount and screenshot. Only the admin can approve it.",[row("✅ I Have Paid","deposit_amount "+id)]);return;}
if (action === "deposit_amount") {var m=obj(key("method",id));if(!m||!m.active){Bot.runCommand("app deposit_methods");return;}ask("deposit_amount",id,"Enter amount in USD, e.g. 10.50");return;}
if (action === "offers") {var ids=list("offers"),lines=[];for(var i=0;i<ids.length;i++){var o=obj(key("offer",ids[i]));if(o&&o.active)lines.push("🎁 "+o.title+"\n"+o.description+(o.percent?"\nCode: "+o.code+" ("+o.percent+"% off, once per user)":""));}show("🎁 OFFERS",lines.join("\n\n")||"No active offers.",[]);return;}
if (action === "stats") {var ids=list("user_orders_"+uid),spent=0,done=0;for(var i=0;i<ids.length;i++){var o=obj(key("order",ids[i]));if(o&&o.status!=="Refunded"){spent+=o.price;if(o.status==="Completed")done++;}}show("📊 MY STATS","Orders: "+ids.length+"\nCompleted: "+done+"\nTotal spent: "+money(spent),[]);return;}
if (action === "support") {show("🎫 SUPPORT","Send a new ticket or view your recent tickets.",[row("✍ New Ticket","ticket_input"),row("📨 My Tickets","tickets")]);return;}
if (action === "ticket_input") {ask("ticket","","Describe your issue in one message.");return;}
if (action === "tickets") {var ids=list("user_tickets_"+uid),b=[];for(var i=0;i<ids.length&&i<15;i++){var t=obj(key("ticket",ids[i]));if(t)b.push(row(t.id+" • "+t.status,"ticket "+t.id));}show("📨 MY TICKETS",b.length?"Choose a ticket.":"No tickets yet.",b);return;}
if (action === "ticket") {var t=obj(key("ticket",id));if(!belong(t)&&!admin){Bot.runCommand("app home");return;}show("🎫 "+t.id,"Status: "+t.status+"\nMessage: "+safe(t.message)+"\nReply: "+safe(t.reply||"—"),admin?[row("↩ Reply","admin_ticket_reply "+id)]:[row("◀ Tickets","tickets")]);return;}
if (!admin) {Bot.runCommand("app home");return;}
if (action === "admin") {show("🛠 ADMIN PANEL","Users: "+list("users").length+"\nOrders: "+list("orders").length+"\nDeposits: "+list("deposits").length,[row("📁 Categories","admin_cats"),row("🚀 Services","admin_services"),row("📦 Packages","admin_packages"),row("🛒 Orders","admin_orders"),row("💳 Deposits","admin_deposits"),row("💰 Payment Methods","admin_methods"),row("🎁 Offers","admin_offers"),row("🎫 Tickets","admin_tickets"),row("👥 Users","admin_users"),row("📢 Broadcast","admin_broadcast"),row("⚙ Settings","admin_settings")]);return;}
if (action === "admin_users") {var ids=list("users"),b=[row("🔎 Find by Telegram ID","admin_user_find")];for(var i=ids.length-1;i>=0&&b.length<=20;i--)b.push(row("👤 "+ids[i],"admin_user "+ids[i]));show("👥 USERS","Recently joined users.",b);return;}
if (action === "admin_user_find") {ask("admin_user_find","","Enter a numeric Telegram user ID.");return;}
if (action === "admin_user") {var who=id;if(!/^\d{5,16}$/.test(who)||get("user_seen_"+who,"no")!=="yes"){show("👥 USERS","User not found.",[row("◀ Users","admin_users")]);return;}show("👤 USER "+who,"Status: "+(get("ban_"+who,"no")==="yes"?"Banned":"Active")+"\nBalance: "+money(wallet(who))+"\nOrders: "+list("user_orders_"+who).length,[row("🚫 Ban","admin_ban "+who),row("✅ Unban","admin_unban "+who)]);return;}
if (action === "admin_ban" || action === "admin_unban") {var who=id;if(who===owner||!/^\d{5,16}$/.test(who)||get("user_seen_"+who,"no")!=="yes")return;put("ban_"+who,action==="admin_ban"?"yes":"no");notify(who,action==="admin_ban"?"🚫 Your account has been restricted. Contact support.":"✅ Your account has been restored.");Bot.runCommand("app admin_user "+who);return;}
if (action === "admin_broadcast") {show("📢 BROADCAST","Sends one plain text message to registered users. Review before sending.",[row("✍ Compose","admin_broadcast_input")]);return;}
if (action === "admin_broadcast_input") {if(uid!==owner)return;ask("admin_broadcast","","Write the message to send to all registered users (up to 700 characters).");return;}
if (action === "admin_broadcast_preview") {var msg=User.getProperty("t4_broadcast_draft");if(!msg){Bot.runCommand("app admin");return;}show("📢 BROADCAST PREVIEW",msg+"\n\nRecipients: "+list("users").length,[row("✅ Send","admin_broadcast_send"),row("✖ Cancel","admin")]);return;}
if (action === "admin_broadcast_send") {if(uid!==owner)return;var msg=User.getProperty("t4_broadcast_draft");if(!msg)return;User.setProperty("t4_broadcast_draft","","string");var ids=list("users"),count=0;for(var i=0;i<ids.length&&i<100;i++){notify(ids[i],msg);count++;}show("📢 BROADCAST","Requested delivery to "+count+" users."+(ids.length>100?" This version sends only to the first 100; use smaller lists or a dedicated broadcast tool for larger audiences.":""),[]);return;}
if (action === "admin_cats" || action === "admin_services" || action === "admin_packages" || action === "admin_methods" || action === "admin_offers") {
  var typ={admin_cats:"cat",admin_services:"srv",admin_packages:"pkg",admin_methods:"method",admin_offers:"offer"}[action];
  var plural={cat:"cats",srv:"services",pkg:"packages",method:"methods",offer:"offers"}[typ],ids=list(plural),b=[row("➕ Add","admin_add "+typ)];
  for(var i=0;i<ids.length&&i<30;i++){var x=obj(key(typ,ids[i]));if(x)b.push(row((x.active?"✅ ":"⛔ ")+x.id+" "+(x.name||x.title),"admin_item "+typ+" "+x.id));}
  show("🛠 "+plural.toUpperCase(),"Add or edit an item.",b);return;
}
if (action === "admin_add") {
  var type=id; if(["cat","srv","pkg","method","offer"].indexOf(type)<0)return;
  var hint={cat:"Category name",srv:"Category ID | Service name | Description",pkg:"Service ID | Package name | Price USD | Delivery time | Required input | Description | manual",method:"Payment method name | Address/instructions",offer:"Offer title | Description | coupon code | discount percent (optional)"}[type];
  ask("admin_add",type,"Send fields separated by | :\n"+hint);return;
}
if (action === "admin_item") {var type=id,x=obj(key(type,args[2]));if(!x){Bot.runCommand("app admin");return;}show("🛠 "+x.id,JSON.stringify(x),[row(x.active?"⛔ Disable":"✅ Enable","admin_toggle "+type+" "+x.id),row("✏ Edit","admin_edit "+type+" "+x.id),row("🗑 Delete","admin_delete "+type+" "+x.id)]);return;}
if (action === "admin_toggle" || action === "admin_delete") {
  var type=id,x=obj(key(type,args[2]));if(!x)return;
  if(action==="admin_toggle")x.active=!x.active;else {x.active=false;x.deleted=true;}
  save(key(type,x.id),x);Bot.runCommand("app admin_item "+type+" "+x.id);return;
}
if (action === "admin_edit") {var type=id,x=obj(key(type,args[2]));if(!x)return;ask("admin_edit",type+":"+x.id,"Send the same | separated fields as when adding this item. Current record:\n"+JSON.stringify(x));return;}
if (action === "admin_orders" || action === "admin_deposits" || action === "admin_tickets") {
  var type={admin_orders:"order",admin_deposits:"deposit",admin_tickets:"ticket"}[action],ids=list({order:"orders",deposit:"deposits",ticket:"tickets"}[type]),b=[];
  for(var i=0;i<ids.length&&i<20;i++){var x=obj(key(type,ids[i]));if(x)b.push(row(x.id+" • "+x.status,"admin_"+type+" "+x.id));}
  show("🛠 "+action.toUpperCase(),b.length?"Latest 20 records.":"No records yet.",b);return;
}
if (action === "admin_order") {var o=obj(key("order",id));if(!o)return;show("🛒 "+o.id,"User: "+o.user+"\nStatus: "+o.status+"\nMode: "+o.mode+"\nPrice: "+money(o.price)+"\nDetails: "+safe(o.details),[row("▶ Processing","admin_order_status "+id+" Processing"),row("✅ Completed","admin_order_status "+id+" Completed"),row("↩ Refund","admin_order_status "+id+" Refunded")]);return;}
if (action === "admin_order_status") {
  var o=obj(key("order",id)),status=args[2];if(!o||["Processing","Completed","Refunded"].indexOf(status)<0)return;
  if(o.status==="Refunded"||o.status==="Completed"&&status!=="Refunded")return;
  if(status==="Refunded")setWallet(o.user,wallet(o.user)+o.price,"Refund",o.id,o.price);
  o.status=status;save(key("order",id),o);notify(o.user,"📦 Order "+id+" is now "+status+".");Bot.runCommand("app admin_order "+id);return;
}
if (action === "admin_deposit") {var d=obj(key("deposit",id));if(!d)return;show("💳 "+id,"User: "+d.user+"\nAmount: "+money(d.amount)+"\nMethod: "+d.method+"\nStatus: "+d.status+"\nProof file ID: "+d.proof,[row("✅ Approve","admin_deposit_status "+id+" Approved"),row("❌ Reject","admin_deposit_status "+id+" Rejected")]);return;}
if (action === "admin_deposit_status") {var d=obj(key("deposit",id)),status=args[2];if(!d||d.status!=="Pending"||["Approved","Rejected"].indexOf(status)<0)return;d.status=status;save(key("deposit",id),d);if(status==="Approved")setWallet(d.user,wallet(d.user)+d.amount,"Deposit",id,d.amount);notify(d.user,"💳 Deposit "+id+": "+status+(status==="Approved"?" ("+money(d.amount)+" credited).":"."));Bot.runCommand("app admin_deposit "+id);return;}
if (action === "admin_ticket") {var t=obj(key("ticket",id));if(!t)return;show("🎫 "+id,"User: "+t.user+"\nMessage: "+safe(t.message)+"\nStatus: "+t.status+"\nReply: "+safe(t.reply||"—"),[row("↩ Reply","admin_ticket_reply "+id)]);return;}
if (action === "admin_ticket_reply") {if(!obj(key("ticket",id)))return;ask("admin_reply",id,"Send the reply for ticket "+id);return;}
if (action === "admin_settings") {show("⚙ SETTINGS","Owner: "+owner+"\nAdditional admins: "+(get("admins","")||"—")+"\n\nAutomatic provider dispatch requires a separate integration review; this version processes orders manually.",[row("👥 Set Admin IDs","admin_setting admins")]);return;}
if (action === "admin_setting") {if(uid!==owner||id!=="admins")return;ask("admin_setting",id,"Send comma-separated Telegram IDs. Only the owner should add admins.");return;}
Bot.runCommand("app home");
