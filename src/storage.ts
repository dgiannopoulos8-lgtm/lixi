import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, sampleItems } from './items';

// Everything stays on the phone in Phase 1 — no account, no server.
const KEY = 'lixi.items.v1';

export async function loadItems(): Promise<Item[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Item[];
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
