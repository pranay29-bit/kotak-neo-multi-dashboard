# Neo Multi-Account Desk

A static dashboard (GitHub Pages) to place orders across several Kotak Neo accounts from one screen.
Everything runs in your browser. There is no server and nothing is sent anywhere except to Kotak (or your own proxy).

## Features
- Encrypted vault (AES-GCM, PBKDF2) in `localStorage` for each account's consumer key, mobile, UCC, MPIN and TOTP secret
- TOTP generated in the browser, so login is one click per account
- One order form, fanned out to every ticked account, with per-account results
- Order book and positions per account
- Dry-run mode, on by default

## First use
Click **Unlock vault** and type any passphrase you choose; that creates the vault. Use the same one next time. If you forget it, clear this site's browser storage and re-add your accounts.

## Deploy
1. Create a repo, push these files to `main`.
2. Settings → Pages → Source → **GitHub Actions** (uses `.github/workflows/pages.yml`). Alternatively choose "Deploy from branch" → `main` / root and delete the workflow.
3. Open `https://<user>.github.io/<repo>/`.

## Per account setup (Kotak Neo app/web)
1. More → Trade API → create application → copy the token (consumer key).
2. Register TOTP on the Trade API page and save the base32 **secret**, not just the 6-digit code.
3. Note your UCC (Profile) and MPIN.

## Read this before going live
**Static IP.** Since 1 April 2026 Kotak requires a whitelisted static IP for order APIs, and the IP is bound to the API session (max 2 IPs per Kotak's docs, others report 3; check the dashboard). A browser sends requests from *your* current IP, so direct mode only works if your connection has a static IP you have whitelisted for every account.
**CORS.** I could not verify whether Kotak's endpoints allow browser calls from `github.io`. If the browser blocks them, direct mode cannot work and you need the proxy.
**Proxy (optional).** The "Proxy URL" field sends each call as `GET/POST <proxy>/?target=<encoded Kotak URL>` and expects the proxy to forward headers/body and add CORS headers. Run it on a small VPS with a static IP and whitelist that IP. Cloudflare Workers will not satisfy the static-IP rule.
**Security.** The vault is only as strong as your passphrase. Do not use this on a shared computer. Publish the repo, never your credentials.
**Endpoints.** Paths follow Kotak's published SDK flow (`/login/1.0/tradeApiLogin`, `/tradeApiValidate`, `{baseUrl}/quick/order/rule/ms/place`). Order book and positions paths are best-effort; confirm against Kotak's REST docs (github.com/Kotak-Neo/Kotak-Neo/docs) and adjust `fetchData()` if needed. Test with one account and 1 quantity first.

Not affiliated with Kotak. Trading is risky; you are responsible for every order sent.

## Proxy
See `proxy/SETUP.md` to run your own free static-IP proxy (Docker + Caddy HTTPS).
