# TPL-004 — Professional Marketing & Promotion Bot

## Important: GitHub does not automatically install the commands

These files are source code. Pushing to GitHub alone does not add them to a bot in Bots.Business.

### Quick installation (manual)

1. Open your **TPL-004 bot** in Bots.Business.
2. Create a command named `/start`. Copy only the JavaScript from [commands/start.js](commands/start.js) into its BJS/code field and save.
3. Create commands named `main_menu`, `my_account`, `services`, `my_orders`, `balance`, `offers`, `my_stats`, and `support`. Paste each matching `commands/<name>.js` file into its command's BJS/code field and save.
4. Send `/start` to your Telegram bot to check the menu. Every inline button should open its named command.

These `commands/*.js` files are individual scripts for manual installation. They have **not** been prepared or verified as a Bots.Business Git-import repository. Do not use **Sync → Import from Git rep** on a bot containing existing commands without first exporting/backing it up: importing can replace bot content.

Bots.Business has a separate Git sync setup involving a repository and deploy key. It does not happen simply by linking GitHub to ChatGPT.

## Current milestone

`/start` initializes a basic account, `main_menu` shows navigation, and `my_account` has the only BOTBOX credit line. Other routes clearly indicate work in progress. Orders, balance payments, deposits and SMM fulfillment are **not enabled yet**.

Planned: admin-managed catalog, durable order indexes, USD ledger with deposit review, manual fulfillment and optional provider API. Keep API keys in admin configuration, never user properties.

Watermark: `Powered by BOTBOX • @BotboxOfficial` appears only on My Account.
