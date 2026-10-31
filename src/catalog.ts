// Ready-made entries so adding something takes a couple of taps.

/** Popular subscriptions shown as quick picks. Prices vary by plan, so the user types the amount. */
export const POPULAR_SUBSCRIPTIONS = [
  'Netflix',
  'Spotify',
  'Disney+',
  'YouTube Premium',
  'iCloud',
  'Google One',
  'Cosmote TV',
  'Vodafone TV',
  'Nova',
  'Γυμναστήριο',
];

/** Common bill providers in Greece. */
export const POPULAR_BILLS = ['ΔΕΗ', 'ΕΥΔΑΠ', 'Cosmote', 'Vodafone', 'Nova', 'Ήρων', 'Protergia', 'Ενοίκιο'];

export interface DocTemplate {
  key: string;
  title: string;
  group: 'car' | 'id';
  /** Default reminder lead time in days. */
  remindDays: number;
}

/** The Greek admin checklist on the Documents screen. */
export const DOCUMENTS: DocTemplate[] = [
  { key: 'kteo', title: 'ΚΤΕΟ', group: 'car', remindDays: 30 },
  { key: 'car-insurance', title: 'Ασφάλεια αυτοκινήτου', group: 'car', remindDays: 30 },
  { key: 'road-tax', title: 'Τέλη κυκλοφορίας', group: 'car', remindDays: 30 },
  { key: 'driving-licence', title: 'Δίπλωμα οδήγησης', group: 'id', remindDays: 60 },
  { key: 'id-card', title: 'Ταυτότητα', group: 'id', remindDays: 90 },
  { key: 'passport', title: 'Διαβατήριο', group: 'id', remindDays: 90 },
  { key: 'tax-return', title: 'Φορολογική δήλωση', group: 'id', remindDays: 30 },
];

export const DOC_GROUP_LABEL = { car: 'ΑΥΤΟΚΙΝΗΤΟ', id: 'ΤΑΥΤΟΤΗΤΑ & ΦΟΡΟΙ' } as const;
