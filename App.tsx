import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ItemCard } from './src/components/ItemCard';
import { Item } from './src/items';
import { loadItems, saveItems } from './src/storage';
import { daysUntil, euro, longToday, toIso } from './src/format';
import { colors, radius, SUMMARY_DAYS, WEEK_DAYS } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Timeline />
    </SafeAreaProvider>
  );
}

function Timeline() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [lastDone, setLastDone] = useState<Item | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadItems().then(setItems);
  }, []);

  const update = useCallback((next: Item[]) => {
    setItems(next);
    saveItems(next);
  }, []);

  const open = useMemo(
    () => (items ?? []).filter((i) => !i.doneAt).sort((a, b) => a.due.localeCompare(b.due)),
    [items],
  );
  const thisWeek = open.filter((i) => daysUntil(i.due) <= WEEK_DAYS);
  const later = open.filter((i) => daysUntil(i.due) > WEEK_DAYS);
  const next30 = open.filter((i) => daysUntil(i.due) <= SUMMARY_DAYS);
  const total = next30.reduce((sum, i) => sum + (i.amount ?? 0), 0);

  const markDone = (item: Item) => {
    if (!items) return;
    update(items.map((i) => (i.id === item.id ? { ...i, doneAt: toIso(new Date()) } : i)));
    setLastDone(item);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setLastDone(null), 5000);
  };

  const undo = () => {
    if (!items || !lastDone) return;
    update(items.map((i) => (i.id === lastDone.id ? { ...i, doneAt: undefined } : i)));
    setLastDone(null);
  };

  if (!items) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.today}>{longToday()}</Text>
          <Text style={styles.h1}>Τι έρχεται</Text>
        </View>

        <View style={styles.summary}>
          <View style={{ gap: 4 }}>
            <Text style={styles.summaryLabel}>Επόμενες {SUMMARY_DAYS} ημέρες</Text>
            <Text style={styles.summaryTotal}>{euro(total)}</Text>
          </View>
          <Text style={styles.summaryLabel}>
            {next30.length} {next30.length === 1 ? 'υπενθύμιση' : 'υπενθυμίσεις'}
          </Text>
        </View>

        {thisWeek.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Αυτή την εβδομάδα</Text>
            {thisWeek.map((i) => (
              <ItemCard key={i.id} item={i} onDone={markDone} />
            ))}
          </View>
        )}

        {later.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Αργότερα</Text>
            {later.map((i) => (
              <ItemCard key={i.id} item={i} compact onDone={markDone} />
            ))}
          </View>
        )}

        {open.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Όλα εντάξει</Text>
            <Text style={styles.emptyText}>Δεν έχεις τίποτα να πληρώσεις ή να ανανεώσεις.</Text>
          </View>
        )}
      </ScrollView>

      {lastDone && (
        <View style={styles.toast}>
          <Text style={styles.toastText} numberOfLines={1}>✓ {lastDone.title}</Text>
          <Pressable accessibilityRole="button" onPress={undo} hitSlop={12}>
            <Text style={styles.toastUndo}>Αναίρεση</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Προσθήκη"
        onPress={() => Alert.alert('Σύντομα', 'Η προσθήκη έρχεται στο επόμενο βήμα.')}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 24 },
  header: { gap: 4 },
  today: { fontSize: 14, color: colors.muted },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryLabel: { fontSize: 13, color: '#5F5F64' },
  summaryTotal: { fontSize: 30, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  section: { gap: 10 },
  h2: { fontSize: 13, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: radius.fab,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabPlus: { color: '#FFFFFF', fontSize: 28, lineHeight: 30, fontWeight: '400' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 92,
    bottom: 36,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toastText: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  toastUndo: { color: '#5EEAD4', fontSize: 14, fontWeight: '600' },
});
