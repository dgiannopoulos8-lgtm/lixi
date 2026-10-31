import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DOC_GROUP_LABEL, DOCUMENTS, DocTemplate } from '../catalog';
import { SectionTitle } from '../components/ui';
import { Item } from '../items';
import { useStore } from '../store';
import { daysUntil, relativeDays } from '../format';
import { colors, URGENT_DAYS } from '../theme';

function ddmmyyyy(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function DocumentsScreen({ onFill, onOpen }: {
  onFill: (doc: DocTemplate) => void;
  onOpen: (item: Item) => void;
}) {
  const { items } = useStore();
  const byKey = new Map(items.filter((i) => i.docKey && !i.doneAt).map((i) => [i.docKey!, i]));
  const filled = DOCUMENTS.filter((d) => byKey.has(d.key)).length;
  const pct = Math.round((filled / DOCUMENTS.length) * 100);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={{ gap: 4 }}>
        <Text style={styles.h1}>Έγγραφα</Text>
        <Text style={styles.sub}>Συμπλήρωσε μία φορά, σου θυμίζουμε εμείς.</Text>
      </View>

      <View style={{ gap: 8 }}>
        <View style={styles.progressText}>
          <Text style={styles.progressLabel}>{filled} από {DOCUMENTS.length} συμπληρωμένα</Text>
          <Text style={styles.sub}>{pct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      {(['car', 'id'] as const).map((group) => (
        <View key={group}>
          <SectionTitle>{DOC_GROUP_LABEL[group]}</SectionTitle>
          <View style={{ marginTop: 6 }}>
            {DOCUMENTS.filter((d) => d.group === group).map((doc, idx, arr) => {
              const item = byKey.get(doc.key);
              const last = idx === arr.length - 1;
              return (
                <Pressable
                  key={doc.key}
                  accessibilityRole="button"
                  onPress={() => (item ? onOpen(item) : onFill(doc))}
                  style={({ pressed }) => [styles.row, !last && styles.rowLine, pressed && { opacity: 0.7 }]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.rowTitle}>{doc.title}</Text>
                    {item && <Text style={styles.sub}>{ddmmyyyy(item.due)}</Text>}
                  </View>
                  {item ? <DueBadge days={daysUntil(item.due)} remind={item.remindDays} /> : <Text style={styles.add}>+ Ημερομηνία</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function DueBadge({ days, remind }: { days: number; remind: number }) {
  if (days <= Math.max(remind, URGENT_DAYS)) {
    return (
      <View style={styles.badgeWarn}>
        <Text style={styles.badgeWarnText}>{days < 0 ? 'έληξε' : relativeDays(days)}</Text>
      </View>
    );
  }
  return <Text style={styles.ok}>✓</Text>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 24 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: colors.muted },
  progressText: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.lineSoft, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 12 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowTitle: { fontSize: 15, fontWeight: '500', color: colors.ink },
  add: { fontSize: 13, fontWeight: '600', color: colors.accent },
  ok: { fontSize: 18, color: colors.accent, fontWeight: '700' },
  badgeWarn: { backgroundColor: colors.warnSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeWarnText: { fontSize: 12, fontWeight: '600', color: colors.warn },
});
