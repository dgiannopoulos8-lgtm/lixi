# Lixi

Λήξεις & Υπενθυμίσεις — one app that reminds people in Greece of bills, subscriptions, free trials and admin deadlines (ΚΤΕΟ, insurance, ID, tax).

Status: early development (Phase 1 MVP, Android first).

## What works so far

- **Timeline (Τι έρχεται):** everything due in the next weeks, soonest first, with the 30-day total.
- Urgent items (3 days or less) are highlighted in amber.
- "Πληρώθηκε" / "Ακύρωσα" / "Έγινε" marks an item done, with a 5-second "Αναίρεση" (undo).
- Data is saved on the phone. On first launch the app shows example items.

Next: adding items, reminders (notifications), the documents checklist, bill scanning, Premium.

## Try it on your Android phone (Windows PC)

One-time setup:

1. Install **Node.js LTS** from https://nodejs.org and **Git** from https://git-scm.com.
2. On your phone, install **Expo Go** from Google Play.

Then, in a terminal (PowerShell):

```bash
git clone https://github.com/dgiannopoulos8-lgtm/lixi.git
cd lixi
npm install
npx expo start
```

A QR code appears. Open **Expo Go** on the phone and scan it. The phone and the PC must be on the same Wi-Fi.
If it can't connect, stop it (Ctrl+C) and run `npx expo start --tunnel` instead.

To get later updates: `git pull`, then `npm install`, then `npx expo start` again.

## Tech

React Native with Expo (TypeScript). Storage: AsyncStorage on the device. No server yet.
