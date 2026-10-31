# Lixi

Λήξεις & Υπενθυμίσεις — one app that reminds people in Greece of bills, subscriptions, free trials and admin deadlines (ΚΤΕΟ, insurance, ID, tax).

Status: early development (Phase 1 MVP, Android first).

## What works (MVP)

- **Αρχική (timeline):** everything coming up, soonest first, with the 30-day total. Due in 3 days or less → amber; past due → "Εκπρόθεσμο".
- **Add / edit / delete:** subscriptions, bills, deadlines and free trials. Quick picks for popular Greek services, a calendar, repeat (once / monthly / yearly) and how early to be reminded.
- **Mark done** with undo. Monthly and yearly items move to their next date; subscriptions roll forward on their own.
- **Reminders:** real phone notifications at 09:00, the chosen number of days before each item (not for the example items).
- **Έγγραφα:** the Greek admin checklist (ΚΤΕΟ, insurance, road tax, licence, ID, passport, tax return) with progress.
- **Σύνοψη:** what's left to pay this month and the monthly cost of all subscriptions.
- Data stays on the phone. First launch shows example items, which can be removed in one tap.

Not in the MVP yet: bill scanning with the camera, e-receipts tracker, Premium payments, accounts/sync.

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

Quick look in a web browser instead: `npx expo start --web` (notifications don't work there).

## Tech

React Native with Expo (TypeScript). Storage: AsyncStorage on the device. No server yet.
