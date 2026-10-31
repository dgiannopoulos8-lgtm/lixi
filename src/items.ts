import { addDays, daysUntil, toIso } from './format';

export type ItemKind = 'bill' | 'subscription' | 'trial' | 'deadline';
export type Repeat = 'none' | 'monthly' | 'yearly';

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  /** Short detail shown after the title, e.g. "ρεύμα". */
  note?: string;
  /** Euros; deadlines (ΚΤΕΟ, passport…) may have no amount. */
  amount?: number;
  /** Due / renewal / expiry date, "YYYY-MM-DD". */
  due: string;
  repeat: Repeat;
  /** Days before `due` to send the reminder notification. */
  remindDays: number;
  /** Set when a one-off item is marked paid / cancelled / done. */
  doneAt?: string;
  /** True for the example items shown on first launch. */
  sample?: boolean;
  /** Links a deadline to a Documents checklist entry (e.g. "kteo"). */
  docKey?: string;
}

export const KIND_LABEL: Record<ItemKind, string> = {
  subscription: 'Συνδρομή',
  bill: 'Λογαριασμός',
  deadline: 'Προθεσμία',
  trial: 'Δωρεάν δοκιμή',
};

export const KIND_HINT: Record<ItemKind, string> = {
  subscription: 'Netflix, γυμναστήριο…',
  bill: 'ΔΕΗ, νερό, κινητό…',
  deadline: 'ΚΤΕΟ, ασφάλεια…',
  trial: 'Σε ειδοποιούμε πριν χρεώσει',
};

export const DEFAULT_REMIND: Record<ItemKind, number> = {
  subscription: 2,
  bill: 2,
  deadline: 30,
  trial: 2,
};

export const DEFAULT_REPEAT: Record<ItemKind, Repeat> = {
  subscription: 'monthly',
  bill: 'monthly',
  deadline: 'none',
  trial: 'none',
};

/** Label for the main action on an item, or undefined when there is none. */
export function actionLabel(kind: ItemKind): string | undefined {
  switch (kind) {
    case 'bill':
      return 'Πληρώθηκε';
    case 'trial':
      return 'Ακύρωσα';
    case 'deadline':
      return 'Έγινε';
    case 'subscription':
      return undefined; // renews on its own; nothing to tick off
  }
}

/** What the date line says for each kind. */
export function datePrefix(kind: ItemKind): string {
  switch (kind) {
    case 'subscription':
      return 'Ανανέωση';
    case 'trial':
      return 'Χρεώνει';
    case 'deadline':
      return 'Λήγει';
    case 'bill':
      return 'Λήξη';
  }
}

/** The same calendar day one period later, clamped to the month's length (31 Jan → 28 Feb). */
export function nextDate(iso: string, repeat: Repeat): string {
  if (repeat === 'none') return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const months = repeat === 'monthly' ? 1 : 12;
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return toIso(new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay)));
}

/** Cost per month: yearly items count as 1/12. */
export function monthlyCost(item: Item): number {
  if (item.amount == null) return 0;
  return item.repeat === 'yearly' ? item.amount / 12 : item.amount;
}

/**
 * Subscriptions renew by themselves, so once their date has passed we move
 * them to the next period. Bills stay where they are (shown as overdue) until
 * the user marks them paid.
 */
export function rollForward(items: Item[], today: Date = new Date()): Item[] {
  return items.map((item) => {
    if (item.kind !== 'subscription' || item.repeat === 'none' || item.doneAt) return item;
    let due = item.due;
    let guard = 0;
    while (daysUntil(due, today) < 0 && guard++ < 240) due = nextDate(due, item.repeat);
    return due === item.due ? item : { ...item, due };
  });
}

/** Marking done: repeating items move to their next date, one-off items are closed. */
export function completed(item: Item): Item {
  if (item.repeat !== 'none' && item.kind !== 'trial') {
    return { ...item, due: nextDate(item.due, item.repeat) };
  }
  return { ...item, doneAt: toIso(new Date()) };
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Example items for the first launch, dated relative to today. */
export function sampleItems(today: Date = new Date()): Item[] {
  const d = (n: number) => toIso(addDays(today, n));
  const base = { sample: true as const };
  return [
    { ...base, id: 's1', kind: 'trial', title: 'Disney+', note: 'δωρεάν δοκιμή', amount: 10.99, due: d(2), repeat: 'none', remindDays: 2 },
    { ...base, id: 's2', kind: 'bill', title: 'Vodafone', note: 'κινητό', amount: 32, due: d(5), repeat: 'monthly', remindDays: 2 },
    { ...base, id: 's3', kind: 'subscription', title: 'Netflix', amount: 13.99, due: d(8), repeat: 'monthly', remindDays: 2 },
    { ...base, id: 's4', kind: 'bill', title: 'ΔΕΗ', note: 'ρεύμα', amount: 86.4, due: d(18), repeat: 'monthly', remindDays: 3 },
    { ...base, id: 's5', kind: 'deadline', title: 'ΚΤΕΟ', due: d(26), repeat: 'none', remindDays: 30, docKey: 'kteo' },
    { ...base, id: 's6', kind: 'bill', title: 'Ασφάλεια αυτοκινήτου', amount: 70.92, due: d(33), repeat: 'none', remindDays: 30, docKey: 'car-insurance' },
  ];
}
