import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { DocumentsScreen } from './src/screens/DocumentsScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { EditorRequest, EditorScreen } from './src/screens/EditorScreen';
import { colors, radius } from './src/theme';

type Tab = 'home' | 'docs' | 'summary';

const TABS: { key: Tab; label: string; glyph: string }[] = [
  { key: 'home', label: 'Αρχική', glyph: '☰' },
  { key: 'docs', label: 'Έγγραφα', glyph: '▤' },
  { key: 'summary', label: 'Σύνοψη', glyph: '▥' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const { loaded, lastDone, undo } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [editor, setEditor] = useState<EditorRequest | null>(null);

  // Android back button: close the editor first, then go back to Home.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (editor) {
        setEditor(null);
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [editor, tab]);

  if (!loaded) return <View style={styles.screen} />;

  if (editor) return <EditorScreen request={editor} onClose={() => setEditor(null)} />;

  const openItem = (item: EditorRequest['item']) => setEditor({ item });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <TimelineScreen onOpen={openItem} onAdd={() => setEditor({})} />}
        {tab === 'docs' && (
          <DocumentsScreen
            onOpen={openItem}
            onFill={(doc) =>
              setEditor({ kind: 'deadline', title: doc.title, docKey: doc.key, remindDays: doc.remindDays })
            }
          />
        )}
        {tab === 'summary' && <SummaryScreen onOpen={openItem} />}

        {lastDone && (
          <View style={styles.toast}>
            <Text style={styles.toastText} numberOfLines={1}>✓ {lastDone.title}</Text>
            <Pressable accessibilityRole="button" onPress={undo} hitSlop={12}>
              <Text style={styles.toastUndo}>Αναίρεση</Text>
            </Pressable>
          </View>
        )}

        {tab === 'home' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Προσθήκη"
            onPress={() => setEditor({})}
            style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.fabPlus}>+</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setTab(t.key)}
              style={styles.tab}
            >
              <Text style={[styles.tabGlyph, on && styles.tabOn]}>{t.glyph}</Text>
              <Text style={[styles.tabLabel, on && styles.tabOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
    bottom: 24,
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
  tabBar: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabGlyph: { fontSize: 18, color: colors.muted },
  tabLabel: { fontSize: 12, fontWeight: '500', color: colors.muted },
  tabOn: { color: colors.ink, fontWeight: '700' },
});
