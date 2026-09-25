const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');
const globalData = new Map();
const userData = new Map();
const outputs = [];
let current = '6589090462';
let pendingMessage = '';
let photo = [];
function bucket(id) { if (!userData.has(id)) userData.set(id, new Map()); return userData.get(id); }
function run(name, params = '') {
  name = name.replace(/^\//, '');
  const src = fs.readFileSync(path.join(__dirname, '..', 'commands', name + '.js'), 'utf8');
  const ctx = {
    params, user: { telegramid: current }, message: pendingMessage, request: { photo },
    Bot: {
      getProperty: (k) => globalData.get(k),
      setProperty: (k,v) => globalData.set(k,v),
      runCommand: (s) => { const [cmd,...args] = s.split(' '); run(cmd, args.join(' ')); },
      sendInlineKeyboard: (buttons,text) => outputs.push({buttons,text}),
      handleNextCommand: () => {}
    },
    User: {getProperty: (k) => bucket(current).get(k),setProperty:(k,v) => bucket(current).set(k,v)},
    Api: {sendMessage:(x)=>outputs.push({notification:x}),sendPhoto:(x)=>outputs.push({photo:x})},
    console
  };
  vm.runInNewContext('(function(){\n'+src+'\n})()',ctx,{filename:name+'.js'});
}
function reply(s, images = []) { pendingMessage=s;photo=images;run('input');pendingMessage='';photo=[]; }
function last() { return outputs.filter(x=>x.text).at(-1)?.text || ''; }
// Setup and authorization regressions.
current='123456789';
run('app','admin');assert(!globalData.has('t4_setup_done'));
run('/setup','confirm');assert(!globalData.has('t4_owner'));
bucket(current).set('t4_pending',JSON.stringify({kind:'admin_add',ref:'cat'}));
reply('Unauthorized');assert(!globalData.has('t4_cats'));
globalData.set('t4_admins','123456789');
run('app','admin_add cat');assert(!globalData.has('t4_cats'));
globalData.set('t4_admins','');
globalData.set('t4_wallet_existing',12345);
current='6589090462';
run('/admin');assert(last().includes('TPL-004 SETUP'));
run('/setup','later');assert(!globalData.has('t4_setup_done'));
run('/setup','confirm');
assert.equal(globalData.get('t4_owner'),current);
assert.equal(globalData.get('t4_setup_done'),'yes');
assert.equal(globalData.get('t4_wallet_existing'),12345);
run('/admin');
const dashboard=outputs.filter(x=>x.text).at(-1);
assert(dashboard.buttons.every(row=>row.length===2));
assert.equal(dashboard.buttons.length,6);
const direct=JSON.stringify(dashboard);
run('app','admin');assert.equal(JSON.stringify(outputs.filter(x=>x.text).at(-1)),direct);
run('/setup','confirm');assert(last().includes('SETUP COMPLETE'));
assert.equal(globalData.get('t4_wallet_existing'),12345);
current='123456789';run('/admin');assert(last().includes('ADMIN ACCESS'));
run('app','admin_add cat');assert(!globalData.has('t4_cats'));
current='6589090462';
run('app','admin_add cat');reply('Telegram');assert(globalData.get('t4_cat_CAT-1'));
run('app','admin_add srv');reply('CAT-1 | Channel Promotion | Ads and growth');
run('app','admin_add pkg');reply('SRV-1 | Starter | 5.00 | 2 days | channel link | Manual delivery | manual');
run('app','admin_add method');reply('USDT BEP20 | wallet address');
run('app','admin_add offer');reply('Launch Deal | Save ten percent | LAUNCH10 | 10');
current='123456789';run('app','services');assert(last().includes('Choose a category'));
run('app','order_input PKG-1');reply('https://t.me/example');assert(last().includes('ORDER PREVIEW'));
run('app','order_confirm');assert(last().includes('INSUFFICIENT BALANCE'));
run('app','deposit_amount PAY-1');reply('10.00');reply('',[{file_id:'file123'}]);
assert(last().includes('submitted'));
current='6589090462';run('app','admin_deposit_status DEP-1 Approved');
assert.equal(globalData.get('t4_wallet_123456789'),1000);
run('app','admin_deposit_status DEP-1 Approved');assert.equal(globalData.get('t4_wallet_123456789'),1000);
current='123456789';run('app','order_confirm');assert.equal(globalData.get('t4_wallet_123456789'),500);
run('app','order_confirm');assert.equal(globalData.get('t4_wallet_123456789'),500);
assert(JSON.parse(globalData.get('t4_user_orders_123456789')).includes('ORD-1'));
current='6589090462';run('app','admin_order_status ORD-1 Refunded');assert.equal(globalData.get('t4_wallet_123456789'),1000);
run('app','admin_order_status ORD-1 Refunded');assert.equal(globalData.get('t4_wallet_123456789'),1000);
current='123456789';run('app','order_input PKG-1');reply('https://t.me/example2');run('app','order_coupon');reply('LAUNCH10');
assert(last().includes('Total: $4.50'));
run('app','order_confirm');assert.equal(globalData.get('t4_wallet_123456789'),550);
run('app','order_input PKG-1');reply('https://t.me/example3');run('app','order_coupon');reply('LAUNCH10');assert(last().includes('already-used'));
console.log('Catalog, order, deposit and duplicate action checks passed');

// Readable records, delete confirmation, photo review and canceled replies.
current='6589090462';
run('app','admin_item cat CAT-1');assert(last().includes('Name: Telegram'));assert(!last().includes('{"'));
run('app','admin_add cat');reply('Temporary');
run('app','admin_delete cat CAT-2');
assert(!JSON.parse(globalData.get('t4_cat_CAT-2')).deleted);
run('app','admin_delete_confirm cat CAT-2');
assert(JSON.parse(globalData.get('t4_cat_CAT-2')).deleted);
run('app','admin_toggle cat CAT-2');
assert(!JSON.parse(globalData.get('t4_cat_CAT-2')).active);
run('app','admin_proof DEP-1');
assert.equal(outputs.at(-1).photo.photo,'file123');
run('app','admin_setting store_name');reply('My Store');run('app','home');assert(last().includes('My Store'));
run('app','admin_setting admins');reply('123456789');
current='123456789';run('/admin');assert(last().includes('ADMIN PANEL'));
run('app','admin_setting admins');assert(!bucket(current).get('t4_pending'));
current='6589090462';run('app','admin_setting admins');reply('-');assert.equal(globalData.get('t4_admins'),'');
run('app','admin_add cat');run('app','home');reply('Must not create');
assert.equal(JSON.parse(globalData.get('t4_cats')).length,2);
current='123456789';bucket(current).set('t4_pending',JSON.stringify({kind:'deposit_amount',ref:'PAY-1'}));
globalData.set('t4_ban_'+current,'yes');reply('20.00');assert(last().includes('restricted'));
console.log('Setup, owner permissions, two-column dashboard, aliases, cancel, delete and proof checks passed');
