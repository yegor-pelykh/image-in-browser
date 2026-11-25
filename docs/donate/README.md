<!-- @format -->

# Donation page

This is the static GitHub Pages version of [`/DONATE.md`](../../DONATE.md). The page itself has no build step, no analytics, and no external requests. It is just HTML, CSS, a little JavaScript, and locally generated QR codes.

## Before publishing

1. Open `index.html` and replace every `address` value in the `COINS` array. Leave the `placeholder` fields alone; they are the sync tokens. The `uri` fields are templates with `{address}` - the script fills them automatically.
2. Run `npm run donate:qr`. It regenerates `qr/*.svg` and replaces the matching placeholders in `/DONATE.md` and `/README.md`.
3. Preview with `npx --yes serve docs/donate` and scan a few QR codes with your phone.
4. Check that the orange “Template mode” banner is gone.

The `donate:qr` script uses the `qrcode` dev dependency and works on Windows, Linux, and macOS. Run `npm install` once after cloning if you haven’t already. It exits with code 1 while any address still starts with `YOUR_`, so a green run means the page is ready.

## Wallet notes

- **TRON:** keep a little TRX in the wallet so you can move USDT later.
- **Base:** keep a little ETH for gas if you accept USDC.
- **Solana:** keep a little SOL for the token account and future transfers.
- **XRP / XLM:** fund the account’s minimum reserve before publishing.
- **TON:** keep a little TON to move funds out.
- **Do not use exchange deposit addresses.** They can rotate, require tags or memos, and get frozen. Use self-custody addresses only.

## Publishing

In the repository settings, open **Pages**, choose **Deploy from a branch**, then `main` and `/docs`.

The page will be available at:

`https://yegor-pelykh.github.io/image-in-browser/donate/`

Put that URL in the repository’s **Website** field if you want a direct link from the About section. The README and npm `funding` link point to `DONATE.md` instead, so they keep working even if Pages is disabled.

## Changing an address later

Update it in `index.html`, `DONATE.md`, and `README.md`, then run `npm run donate:qr` again. The QR code and the wallet URI (thanks to the `{address}` template) follow the new address; the old QR is overwritten.
