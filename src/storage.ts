import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_REMIND, DEFAULT_REPEAT, Item, sampleItems } from './items';

// Everything stays on the phone in Phase 1 — no account, no server.
const KEY = 'lixi.items.v1';

/** Fills in fields added after an item was saved by an older version. */
function upgrade(raw: Partial<Item> & Pick<Item, 'id' | 'kind' | 'title' | 'due'>): Item {
  return {
    ...raw,
    repeat: raw.repeat ?? DEFAULT_REPEAT[raw.kind],
    remindDays: raw.remindDays ?? DEFAULT_REMIND[raw.kind],
  };
}

export async function loadItems(): Promise<Item[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return (JSON.parse(raw) as Item[]).map(upgrade);
  } catch {
    // Corrupt or unreadable storage: fall through to the samples.
  }
  const seeded = sampleItems();
  await saveItems(seeded);
  return seeded;
}

export async function saveItems(items: Item[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable; the in-memory list still works this session.
  }
}
