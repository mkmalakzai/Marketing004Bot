# TPL-004 — Professional Marketing & Promotion Bot

Bots.Business BJS source. Repository includes `bot.json` and importable `/*CMD ... CMD*/` files in `commands/`.

## Import / update

This repository is configured for `git@github.com:mkmalakzai/Marketing004Bot.git`. In Bots.Business open the bot → Sync → **Import from Git rep**. For first setup, add the public deploy key from Bots.Business to this repo's GitHub Settings → Deploy keys (read access). Export/back up the bot before importing changes; Git import replaces the installed command set. Reimport after each GitHub update; a push by itself is not a deployment.

After importing this update, send **`/setup`**, tap **Complete Setup**, then send **`/admin`**. Both typed commands and the Admin Panel button work. The `admin` and `setup` aliases also work without a leading slash. Setup is required for the app and reply handlers; an old menu button cannot bypass it.

The authorized initial owner of this BOTBOX installation is **6589090462**, defined only in `commands/setup.js`. For a buyer's copy, set the bot property `t4_setup_owner` to the buyer's Telegram ID from the trusted Bots.Business workspace before first use, or replace `INITIAL_OWNER_ID` in `setup.js`. An existing `t4_owner` takes precedence. A visitor cannot claim ownership simply by running /setup first. After setup, both app and input handlers use the persisted owner and additional admin IDs; they have no fallback administrator.

Setup preserves existing balances, categories, orders, deposits, and additional admin IDs. Repeating `/setup` displays the completed state without reinitializing those records. The owner must open the bot to receive notifications.

## Admin update

- `/admin` and the inline button open the same panel after setup.
- The main Admin Panel uses six rows of two buttons. Other menus pack available actions into rows of up to two; admin subpages include Back and Main Menu.
- Admin item details use readable labels; deleted items are hidden from management lists and cannot be re-enabled through old buttons. Delete has a confirmation screen.
- Deposit review includes View Proof, showing the saved Telegram photo.
- Settings lets the owner change the store name and manage additional admins. Send `-` to remove all additional admins.
- Main Menu and /admin clear pending form state. The reply handler rechecks setup and banned-user access.

## Current working flows

- User: professional menu, catalog navigation, package and order preview, wallet, manual deposit request with photo, order history, transaction history, manual-order cancellation with automatic refund, API-order progress visibility, manual delivery/update visibility, offers, stats, support tickets and account.
- Admin: category/service/package add/edit/disable/delete, Manual/API package mode, SMM provider management, provider balance/test actions, saved provider service IDs, API order status refresh, order search and manual fulfillment notes/results, order status/refunds, payment methods, deposit review, record lookup, user pages, wallet tools, coupons/offers, tickets, ban/unban, additional admins and broadcast (up to 100 registered users).
- USD balances are stored in integer cents. Deposits credit only when an admin approves; orders debit once upon confirmation; refunds credit once. Repeated button presses on completed actions are ignored.
- The BOTBOX credit appears only in My Account.

Admin creation flows are step-by-step. Relationships such as Category → Service and Service → Package are selected with buttons instead of manual IDs where practical. API packages can select an enabled provider and a saved provider service ID.

## Important limits before real money

Manual fulfillment and SMM API fulfillment are both implemented. Admins can add an SMM provider, store its API URL/key in bot properties, save provider service IDs, and map API packages to a provider service with a fixed quantity. API orders are submitted automatically; successful provider order IDs are saved, status can be refreshed from the admin order page, and failed submissions are refunded automatically.

BJS bot properties and counters are not transactional. Concurrent order/payment callbacks and provider interactions need an atomic external ledger before high-volume, real-money operation. The local tests cover common single-user flows and repeated clicks, but the bot has not been exercised in your live Bots.Business workspace. Test with non-real funds before enabling a public deposit address.

Offers support announcements or an optional 1–90% coupon code. Each user can redeem a given coupon once. Broadcast sends to at most 100 registered users in this version. New order/deposit/ticket alerts are sent to the owner and configured additional admins; the deposit proof photo is sent to the owner and remains viewable from the admin deposit page.

## Local regression checks

Run `node tests/flows.cjs`. This harness simulates BJS storage and routing: setup authorization, pre-setup mutation guards, repeated setup preserving data, direct and inline admin entry, two-column dashboard, additional admin permissions, delete confirmation, screenshot review, cancellation, catalog/order/deposit/coupon flows, repeated approvals and refunds. It does not simulate Telegram formatting, the live Bots.Business importer, concurrency, or delivery failures.


## Final status

TPL-004 is feature-complete for the current BOTBOX scope. The Followiz error/refund path has been tested live. A successful paid provider order still requires provider balance for final end-to-end confirmation.
