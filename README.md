# TPL-004 — Professional Marketing & Promotion Bot

Bots.Business BJS source. Repository includes `bot.json` and importable `/*CMD ... CMD*/` files in `commands/`.

## Import / update

This repository is configured for `git@github.com:mkmalakzai/Marketing004Bot.git`. In Bots.Business open the bot → Sync → **Import from Git rep**. For first setup, add the public deploy key from Bots.Business to this repo's GitHub Settings → Deploy keys (read access). Export/back up the bot before importing changes; Git import replaces the installed command set. Reimport after each GitHub update; a push by itself is not a deployment.

Test `/start` and **Admin Panel** using owner Telegram ID **6589090462**. This default ID is for the BOTBOX demo. A buyer must change the fallback ID in `commands/app.js` and `commands/input.js`, or set the bot property `t4_owner` to their own numeric Telegram ID before using this as their own template. The owner must send /start to the bot before receiving notifications.

## Current working flows

- User: menu, catalog navigation, package and order preview, wallet, manual deposit request with photo, order history, transaction history, offers display, stats, support tickets and account.
- Admin: category/service/package add/edit/disable/delete (soft delete), order management and refunds, payment method management, manual deposit review, offer and one-use coupon management, ticket replies, user ban/unban, additional admin IDs and basic broadcast (up to 100 registered users).
- USD balances are stored in integer cents. Deposits credit only when an admin approves; orders debit once upon confirmation; refunds credit once. Repeated button presses on completed actions are ignored.
- The BOTBOX credit appears only in My Account.

Admin creation inputs use a pipe `|` between fields; the bot shows the required format. Example package:
`SRV-1 | Starter | 5.00 | 2 days | channel link | Manual delivery | manual`

## Important limits before real money

**Manual fulfillment is implemented. Automatic SMM API fulfillment is not enabled.** The provider URL, authentication method, service mapping, quantity rules, and status response need to be specified for the chosen provider. Bots.Business's current BJS HTTP transport does not validate HTTPS server certificates, so a sensitive provider key must not be sent directly through it. A secure integration needs a separately reviewed transport with certificate validation. Do not enter an API key into the bot yet.

BJS bot properties and counters are not transactional. Concurrent order/payment callbacks and provider interactions need an atomic external ledger before high-volume, real-money operation. The local tests cover common single-user flows and repeated clicks, but the bot has not been exercised in your live Bots.Business workspace. Test with non-real funds before enabling a public deposit address.

Offers support announcements or an optional 1–90% coupon code. Each user can redeem a given coupon once. Broadcast sends to at most 100 registered users in this version.
