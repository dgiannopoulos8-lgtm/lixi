import { addDays, toIso } from './format';

export type ItemKind = 'bill' | 'subscription' | 'trial' | 'deadline';

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  /** Short detail shown under the title, e.g. "ρεύμα". */
  note?: string;
  /** Euros; deadlines (ΚΤΕΟ, passport…) may have no amount. */
  amount?: number;
  /** Due / renewal / expiry date, "YYYY-MM-DD". */
  due: string;
  /** Set when the user marks it paid / cancelled / done. */
  doneAt?: string;
}

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

/**
 * Example items for the first launch, dated relative to today so the
 * timeline always shows something useful. Replaced as soon as the user
 * adds their own (adding comes in the next step).
 */
export function sampleItems(today: Date = new Date()): Item[] {
  const d = (n: number) => toIso(addDays(today, n));
  return [
    { id: 's1', kind: 'trial', title: 'Disney+', note: 'δωρεάν δοκιμή', amount: 10.99, due: d(2) },
    { id: 's2', kind: 'bill', title: 'Vodafone', note: 'κινητό', amount: 32, due: d(5) },
    { id: 's3', kind: 'subscription', title: 'Netflix', amount: 13.99, due: d(8) },
    { id: 's4', kind: 'bill', title: 'ΔΕΗ', note: 'ρεύμα', amount: 86.4, due: d(18) },
    { id: 's5', kind: 'deadline', title: 'ΚΤΕΟ', due: d(26) },
    { id: 's6', kind: 'bill', title: 'Ασφάλεια αυτοκινήτου', amount: 70.92, due: d(33) },
  ];
}
