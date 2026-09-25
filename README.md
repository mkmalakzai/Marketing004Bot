# TPL-004 — Professional Marketing & Promotion Bot

Bots.Business template for an all-in-one marketing service bot.

## Installed milestone

- `/start` initializes the user's basic account once.
- `main_menu` presents inline navigation.
- `my_account` shows the account and the single BOTBOX credit line.
- Other menu routes explicitly say that the feature is being built.

No orders, deposits, payments, SMM provider calls or fulfillment are active yet. Do not accept payments before those flows and admin review are implemented and tested.

## Install in Bots.Business

Create one command for each file in `commands/`. Use the filename without `.js` as the command name and paste in its JavaScript. Set `/start` as the entry command. Inline buttons refer to those command names.

## Architecture to implement next

Admin-managed categories, services, packages; durable order records indexed by user and admin; USD wallet ledger and manual deposit review; manual fulfillment plus optional SMM API; offers, support and settings. Store provider credentials in admin configuration, never user properties. Validate prices and idempotency on the server side before accepting orders.

Watermark: `Powered by BOTBOX • @BotboxOfficial` appears only on My Account.
