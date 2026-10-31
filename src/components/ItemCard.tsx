import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Item, actionLabel, datePrefix } from '../items';
import { daysUntil, euro, relativeDays, shortDate } from '../format';
import { colors, radius, URGENT_DAYS } from '../theme';

interface Props {
  item: Item;
  /** Compact = plain row for items further away; otherwise a card. */
  compact?: boolean;
  onDone: (item: Item) => void;
  onOpen: (item: Item) => void;
}

export function ItemCard({ item, compact, onDone, onOpen }: Props) {
  const days = daysUntil(item.due);
  const urgent = days <= URGENT_DAYS;
  const action = actionLabel(item.kind);

  const title = item.note ? `${item.title} · ${item.note}` : item.title;
  const when = urgent ? relativeDays(days) : shortDate(item.due);
  const overdue = days < 0;
  const money = item.amount != null ? ` · ${euro(item.amount)}` : '';
  const subtitle = overdue ? `Εκπρόθεσμο · ${when}${money}` : `${datePrefix(item.kind)} ${when}${money}`;

  if (compact) {
    return (
      <Pressable accessibilityRole="button" onPress={() => onOpen(item)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.text}>
          <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.sub}>{datePrefix(item.kind)} {shortDate(item.due)}</Text>
        </View>
        {item.amount != null ? (
          <Text style={styles.amount}>{euro(item.amount)}</Text>
        ) : (
          <Text style={styles.days}>{relativeDays(days)}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(item)}
      style={({ pressed }) => [styles.card, urgent && styles.cardUrgent, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={[styles.sub, urgent && styles.subUrgent]}>{subtitle}</Text>
      </View>
      {action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action}: ${item.title}`}
          onPress={() => onDone(item)}
          style={({ pressed }) => [
            styles.button,
            urgent ? styles.buttonUrgent : styles.buttonPrimary,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.buttonText, urgent ? styles.buttonTextUrgent : styles.buttonTextPrimary]}>
            {action}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  cardUrgent: { backgroundColor: colors.warnSoft, borderColor: colors.warnSoft },
  text: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted },
  subUrgent: { color: colors.warn },
  button: { minHeight: 44, paddingHorizontal: 14, borderRadius: radius.button, justifyContent: 'center' },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonUrgent: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.warnLine },
  buttonText: { fontSize: 13, fontWeight: '600' },
  buttonTextPrimary: { color: '#FFFFFF' },
  buttonTextUrgent: { color: colors.warn },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  rowTitle: { fontSize: 15, fontWeight: '500', color: colors.ink },
  amount: { fontSize: 15, fontWeight: '600', color: colors.ink },
  days: { fontSize: 13, fontWeight: '600', color: colors.accent },
});
