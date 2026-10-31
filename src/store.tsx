import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { completed, Item, rollForward } from './items';
import { loadItems, saveItems } from './storage';
import { rescheduleAll } from './notifications';

interface Store {
  items: Item[];
  loaded: boolean;
  /** The item just marked done, while its undo is still offered. */
  lastDone: Item | null;
  save: (item: Item) => void;
  remove: (id: string) => void;
  markDone: (item: Item) => void;
  undo: () => void;
  clearSamples: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastDone, setLastDone] = useState<Item | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadItems().then((stored) => {
      const fresh = rollForward(stored);
      setItems(fresh);
      setLoaded(true);
      saveItems(fresh);
      rescheduleAll(fresh);
    });
  }, []);

  const commit = useCallback((next: Item[]) => {
    setItems(next);
    saveItems(next);
    rescheduleAll(next);
  }, []);

  const save = (item: Item) => {
    const exists = items.some((i) => i.id === item.id);
    commit(exists ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item]);
  };

  const remove = (id: string) => commit(items.filter((i) => i.id !== id));

  const markDone = (item: Item) => {
    commit(items.map((i) => (i.id === item.id ? completed(i) : i)));
    setLastDone(item); // the item as it was, so undo can restore it exactly
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setLastDone(null), 5000);
  };

  const undo = () => {
    if (!lastDone) return;
    commit(items.map((i) => (i.id === lastDone.id ? lastDone : i)));
    setLastDone(null);
  };

  const clearSamples = () => commit(items.filter((i) => !i.sample));

  return (
    <Ctx.Provider value={{ items, loaded, lastDone, save, remove, markDone, undo, clearSamples }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
