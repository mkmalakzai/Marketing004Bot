# TPL-004 — Professional Marketing & Promotion Bot

Bots.Business Git sync repository. It contains `bot.json` and BJS command files with `/*CMD ... CMD*/` metadata in `commands/`.

## Import to Bots.Business

1. Open the **TPL-004 bot** in Bots.Business → **Sync**. Set Git repository to `git@github.com:mkmalakzai/Marketing004Bot.git`.
2. Copy the **public deploy key** displayed by Bots.Business and add it in GitHub → this repository → **Settings → Deploy keys** with **read access**. Keep the private key in Bots.Business; do not paste it here.
3. Back up/export any existing bot content before import. Then use **Sync → Import from Git rep**.
4. Confirm these nine commands appear: `/start`, `main_menu`, `my_account`, `services`, `my_orders`, `balance`, `offers`, `my_stats`, `support`. Send `/start` in Telegram and check each menu button.

GitHub push by itself does not trigger the bot import unless automatic Git syncing has separately been configured in Bots.Business. This repository is prepared for the **manual import action**.

## Current milestone

Only the account initialization, main menu and account page are implemented. The remaining menu destinations are clearly marked as under development. No orders, deposits, balance charges or SMM API fulfillment are active.

The BOTBOX credit appears **only in My Account**: `Powered by BOTBOX • @BotboxOfficial`.

Planned next: admin-managed catalog, durable order records, USD ledger with deposit review, manual fulfillment and optional provider API.
