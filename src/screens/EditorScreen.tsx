import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DEFAULT_REMIND, DEFAULT_REPEAT, Item, ItemKind, KIND_HINT, KIND_LABEL, Repeat, newId,
} from '../items';
import { POPULAR_BILLS, POPULAR_SUBSCRIPTIONS } from '../catalog';
import { addDays, toIso } from '../format';
import { useStore } from '../store';
import { colors } from '../theme';
import { DatePicker } from '../components/DatePicker';
import { Chip, Field, IconButton, PrimaryButton } from '../components/ui';

/** What the editor opens with: an existing item, or hints for a new one. */
export interface EditorRequest {
  item?: Item;
  kind?: ItemKind;
  title?: string;
  docKey?: string;
  remindDays?: number;
}

const KINDS: ItemKind[] = ['subscription', 'bill', 'deadline', 'trial'];

const DATE_LABEL: Record<ItemKind, string> = {
  subscription: 'Επόμενη χρέωση',
  bill: 'Ημερομηνία λήξης',
  deadline: 'Λήγει στις',
  trial: 'Χρεώνει στις',
};

const REPEAT_OPTIONS: { value: Repeat; label: string }[] = [
  { value: 'none', label: 'Μία φορά' },
  { value: 'monthly', label: 'Κάθε μήνα' },
  { value: 'yearly', label: 'Κάθε χρόνο' },
];

const REMIND_OPTIONS = [
  { days: 1, label: '1 ημέρα' },
  { days: 2, label: '2 ημέρες' },
  { days: 7, label: '1 εβδομάδα' },
  { days: 30, label: '1 μήνα' },
  { days: 90, label: '3 μήνες' },
];

function parseAmount(text: string): number | undefined {
  const clean = text.replace(/[€\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  if (!clean) return undefined;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

function amountText(n?: number): string {
  return n == null ? '' : n.toFixed(2).replace('.', ',');
}

export function EditorScreen({ request, onClose }: { request: EditorRequest; onClose: () => void }) {
  const { save, remove } = useStore();
  const editing = request.item;
  const [kind, setKind] = useState<ItemKind | undefined>(editing?.kind ?? request.kind);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <IconButton label="Κλείσιμο" glyph="✕" onPress={onClose} />
        <Text style={styles.topTitle}>{editing ? 'Επεξεργασία' : kind ? KIND_LABEL[kind] : ''}</Text>
        <View style={{ width: 44 }} />
      </View>
      {kind ? (
        <Form
          key={kind}
          kind={kind}
          request={request}
          onBack={editing || request.kind ? undefined : () => setKind(undefined)}
          onSave={(item) => {
            save(item);
            onClose();
          }}
          onDelete={editing ? () => { remove(editing.id); onClose(); } : undefined}
        />
      ) : (
        <KindPicker onPick={setKind} />
      )}
    </SafeAreaView>
  );
}

function KindPicker({ onPick }: { onPick: (k: ItemKind) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.h1}>Τι θέλεις να θυμάσαι;</Text>
      <View style={styles.grid}>
        {KINDS.map((k) => (
          <Pressable
            key={k}
            accessibilityRole="button"
            onPress={() => onPick(k)}
            style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.surface }]}
          >
            <Text style={styles.tileTitle}>{KIND_LABEL[k]}</Text>
            <Text style={styles.tileHint}>{KIND_HINT[k]}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Form({ kind, request, onBack, onSave, onDelete }: {
  kind: ItemKind;
  request: EditorRequest;
  onBack?: () => void;
  onSave: (item: Item) => void;
  onDelete?: () => void;
}) {
  const base = request.item;
  const [title, setTitle] = useState(base?.title ?? request.title ?? '');
  const [note, setNote] = useState(base?.note ?? '');
  const [amount, setAmount] = useState(amountText(base?.amount));
  const [due, setDue] = useState(base?.due ?? toIso(addDays(new Date(), kind === 'deadline' ? 30 : 7)));
  const [repeat, setRepeat] = useState<Repeat>(base?.repeat ?? DEFAULT_REPEAT[kind]);
  const [remindDays, setRemindDays] = useState(base?.remindDays ?? request.remindDays ?? DEFAULT_REMIND[kind]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tried, setTried] = useState(false);

  const parsed = parseAmount(amount);
  const amountBad = Number.isNaN(parsed);
  const titleBad = !title.trim();
  const quick = kind === 'subscription' ? POPULAR_SUBSCRIPTIONS : kind === 'bill' ? POPULAR_BILLS : [];
  const remindChoices = REMIND_OPTIONS.filter((o) => kind === 'deadline' || o.days <= 30);

  const submit = () => {
    setTried(true);
    if (titleBad || amountBad) return;
    onSave({
      id: base?.id ?? newId(),
      kind,
      title: title.trim(),
      note: note.trim() || undefined,
      amount: parsed,
      due,
      repeat: kind === 'trial' ? 'none' : repeat,
      remindDays,
      docKey: base?.docKey ?? request.docKey,
      // Editing an example turns it into a real item.
      sample: undefined,
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {onBack && (
          <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8}>
            <Text style={styles.back}>‹ Αλλαγή τύπου</Text>
          </Pressable>
        )}

        <Field label="Όνομα">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={kind === 'deadline' ? 'π.χ. ΚΤΕΟ' : kind === 'bill' ? 'π.χ. ΔΕΗ' : 'π.χ. Netflix'}
            placeholderTextColor="#A1A1AA"
            style={[styles.input, tried && titleBad && styles.inputBad]}
            accessibilityLabel="Όνομα"
          />
          {quick.length > 0 && (
            <View style={styles.chips}>
              {quick.map((q) => (
                <Chip key={q} label={q} selected={title === q} onPress={() => setTitle(q)} />
              ))}
            </View>
          )}
          {tried && titleBad && <Text style={styles.error}>Γράψε ένα όνομα.</Text>}
        </Field>

        <Field label="Σημείωση (προαιρετικό)">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={kind === 'bill' ? 'π.χ. ρεύμα σπιτιού' : 'π.χ. οικογενειακό πακέτο'}
            placeholderTextColor="#A1A1AA"
            style={styles.input}
            accessibilityLabel="Σημείωση"
          />
        </Field>

        <Field label={kind === 'deadline' ? 'Κόστος (προαιρετικό)' : 'Ποσό (€)'}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor="#A1A1AA"
            keyboardType="decimal-pad"
            style={[styles.input, amountBad && styles.inputBad]}
            accessibilityLabel="Ποσό σε ευρώ"
          />
          {amountBad && <Text style={styles.error}>Γράψε το ποσό με αριθμούς, π.χ. 12,50.</Text>}
        </Field>

        <Field label={DATE_LABEL[kind]}>
          <DatePicker value={due} onChange={setDue} />
        </Field>

        {kind !== 'trial' && (
          <Field label="Επανάληψη">
            <View style={styles.chips}>
              {REPEAT_OPTIONS.map((o) => (
                <Chip key={o.value} label={o.label} selected={repeat === o.value} onPress={() => setRepeat(o.value)} />
              ))}
            </View>
          </Field>
        )}

        <Field label="Υπενθύμιση πριν από">
          <View style={styles.chips}>
            {remindChoices.map((o) => (
              <Chip key={o.days} label={o.label} selected={remindDays === o.days} onPress={() => setRemindDays(o.days)} />
            ))}
          </View>
        </Field>

        <PrimaryButton label="Αποθήκευση" onPress={submit} />

        {onDelete && (
          <Pressable
            accessibilityRole="button"
            onPress={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            style={styles.delete}
          >
            <Text style={styles.deleteText}>{confirmDelete ? 'Πάτα ξανά για οριστική διαγραφή' : 'Διαγραφή'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8 },
  topTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  body: { padding: 20, gap: 22, paddingBottom: 48 },
  h1: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexGrow: 1,
    minHeight: 104,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    justifyContent: 'flex-end',
  },
  tileTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  tileHint: { fontSize: 13, color: colors.muted },
  back: { fontSize: 14, fontWeight: '600', color: colors.accent },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
  },
  inputBad: { borderColor: '#B45309' },
  error: { fontSize: 13, color: '#92400E' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  delete: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 15, fontWeight: '600', color: '#B91C1C' },
});
