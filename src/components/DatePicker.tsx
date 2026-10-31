import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { toIso } from '../format';
import { colors } from '../theme';

// A small month calendar. Built by hand so it looks the same on every phone
// (and in the browser preview), with Monday first as is usual in Greece.

const MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
];
const WEEKDAYS = ['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ'];

export function DatePicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [y0, m0] = value.split('-').map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1 });
  const todayIso = toIso(new Date());

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) => {
    const d = new Date(view.y, view.m + n, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Προηγούμενος μήνας" onPress={() => shift(-1)} style={styles.nav}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.month}>{MONTHS[view.m]} {view.y}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Επόμενος μήνας" onPress={() => shift(1)} style={styles.nav}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>{w}</Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((day, c) => {
            if (day == null) return <View key={c} style={styles.cell} />;
            const iso = toIso(new Date(view.y, view.m, day));
            const selected = iso === value;
            const today = iso === todayIso;
            return (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`${day} ${MONTHS[view.m]}`}
                accessibilityState={{ selected }}
                onPress={() => onChange(iso)}
                style={styles.cell}
              >
                <View style={[styles.dot, today && styles.today, selected && styles.selected]}>
                  <Text style={[styles.day, selected && styles.daySelected]}>{day}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  nav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 26, color: colors.ink, lineHeight: 28 },
  month: { fontSize: 15, fontWeight: '600', color: colors.ink },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.muted, paddingVertical: 4 },
  cell: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: colors.line },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  day: { fontSize: 15, color: colors.ink },
  daySelected: { color: '#FFFFFF', fontWeight: '600' },
});
