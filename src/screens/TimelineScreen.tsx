import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '../components/ItemCard';
import { SectionTitle } from '../components/ui';
import { Item } from '../items';
import { useStore } from '../store';
import { daysUntil, euro, longToday } from '../format';
import { colors, SUMMARY_DAYS, WEEK_DAYS } from '../theme';

export function TimelineScreen({ onOpen, onAdd }: { onOpen: (item: Item) => void; onAdd: () => void }) {
  const { items, markDone, clearSamples } = useStore();

  const open = items.filter((i) => !i.doneAt).sort((a, b) => a.due.localeCompare(b.due));
  const thisWeek = open.filter((i) => daysUntil(i.due) <= WEEK_DAYS);
  const later = open.filter((i) => daysUntil(i.due) > WEEK_DAYS);
  const next30 = open.filter((i) => daysUntil(i.due) <= SUMMARY_DAYS);
  const total = next30.reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const hasSamples = items.some((i) => i.sample);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.today}>{longToday()}</Text>
        <Text style={styles.h1}>Τι έρχεται</Text>
      </View>

      {hasSamples && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Αυτά είναι παραδείγματα. Πρόσθεσε τα δικά σου με το +.</Text>
          <Pressable accessibilityRole="button" onPress={clearSamples} hitSlop={8}>
            <Text style={styles.bannerAction}>Διαγραφή παραδειγμάτων</Text>
          </Pressable>
        </View>
      )}

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
          <SectionTitle>ΑΥΤΗ ΤΗΝ ΕΒΔΟΜΑΔΑ</SectionTitle>
          {thisWeek.map((i) => (
            <ItemCard key={i.id} item={i} onDone={markDone} onOpen={onOpen} />
          ))}
        </View>
      )}

      {later.length > 0 && (
        <View style={styles.section}>
          <SectionTitle>ΑΡΓΟΤΕΡΑ</SectionTitle>
          {later.map((i) => (
            <ItemCard key={i.id} item={i} compact onDone={markDone} onOpen={onOpen} />
          ))}
        </View>
      )}

      {open.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Τίποτα δεν έρχεται</Text>
          <Text style={styles.emptyText}>Πρόσθεσε έναν λογαριασμό, μια συνδρομή ή μια προθεσμία και θα σου θυμίσουμε εμείς.</Text>
          <Pressable accessibilityRole="button" onPress={onAdd} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>+ Προσθήκη</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 24 },
  header: { gap: 4 },
  today: { fontSize: 14, color: colors.muted },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  banner: { backgroundColor: colors.accentSoft, borderRadius: 14, padding: 14, gap: 8 },
  bannerText: { fontSize: 14, color: '#115E59' },
  bannerAction: { fontSize: 14, fontWeight: '600', color: colors.accent },
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
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 12, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  emptyButton: { marginTop: 8, minHeight: 44, paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.ink, justifyContent: 'center' },
  emptyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
