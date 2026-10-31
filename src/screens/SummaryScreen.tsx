import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionTitle } from '../components/ui';
import { Item, monthlyCost } from '../items';
import { useStore } from '../store';
import { daysUntil, euro } from '../format';
import { colors } from '../theme';

const MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
];
// Bar shades for the subscription split, darkest first.
const SHADES = [colors.ink, colors.accent, '#A8A29E', '#D6D3D1'];

export function SummaryScreen({ onOpen }: { onOpen: (item: Item) => void }) {
  const { items } = useStore();
  const open = items.filter((i) => !i.doneAt);
  const today = new Date();

  const subs = open
    .filter((i) => i.kind === 'subscription' && i.amount != null)
    .sort((a, b) => monthlyCost(b) - monthlyCost(a));
  const subsMonthly = subs.reduce((s, i) => s + monthlyCost(i), 0);

  // Everything with a date in the current calendar month.
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = open.filter((i) => i.due.startsWith(monthKey) && daysUntil(i.due) >= 0);
  const monthTotal = thisMonth.reduce((s, i) => s + (i.amount ?? 0), 0);
  const overdue = open.filter((i) => daysUntil(i.due) < 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={{ gap: 4 }}>
        <Text style={styles.sub}>{MONTHS[today.getMonth()]} {today.getFullYear()}</Text>
        <Text style={styles.h1}>Σύνοψη</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Μένουν να πληρωθούν αυτόν τον μήνα</Text>
        <Text style={styles.heroValue}>{euro(monthTotal)}</Text>
        <Text style={styles.heroLabel}>
          {thisMonth.length} {thisMonth.length === 1 ? 'πληρωμή' : 'πληρωμές'}
          {overdue.length > 0 ? ` · ${overdue.length} εκπρόθεσμ${overdue.length === 1 ? 'η' : 'ες'}` : ''}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Συνδρομές</Text>
          <Text style={styles.cardValue}>
            {euro(subsMonthly)}
            <Text style={styles.per}> /μήνα</Text>
          </Text>
        </View>

        {subs.length === 0 ? (
          <Text style={styles.sub}>Δεν έχεις προσθέσει συνδρομές ακόμα.</Text>
        ) : (
          <>
            <View style={styles.bar}>
              {subs.map((s, i) => (
                <View key={s.id} style={{ flex: monthlyCost(s), backgroundColor: SHADES[Math.min(i, SHADES.length - 1)] }} />
              ))}
            </View>
            <View style={{ gap: 2 }}>
              {subs.map((s, i) => (
                <Pressable key={s.id} accessibilityRole="button" onPress={() => onOpen(s)} style={styles.subRow}>
                  <View style={[styles.swatch, { backgroundColor: SHADES[Math.min(i, SHADES.length - 1)] }]} />
                  <Text style={styles.subName} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.subAmount}>
                    {euro(s.amount!)}
                    {s.repeat === 'yearly' ? ' /χρόνο' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sub}>{euro(subsMonthly * 12)} τον χρόνο. Τις χρησιμοποιείς όλες;</Text>
          </>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <SectionTitle>ΣΥΝΤΟΜΑ</SectionTitle>
        <Text style={styles.sub}>Σάρωση λογαριασμών με φωτογραφία, ηλεκτρονικές αποδείξεις και Premium.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 20 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  hero: { backgroundColor: colors.accentSoft, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, gap: 4 },
  heroLabel: { fontSize: 13, color: '#115E59' },
  heroValue: { fontSize: 30, fontWeight: '700', color: colors.accent, letterSpacing: -0.5 },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 18, gap: 12 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  cardValue: { fontSize: 15, fontWeight: '700', color: colors.ink },
  per: { fontSize: 13, fontWeight: '500', color: colors.muted },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  subName: { flex: 1, fontSize: 14, color: colors.ink },
  subAmount: { fontSize: 14, color: colors.ink },
});
