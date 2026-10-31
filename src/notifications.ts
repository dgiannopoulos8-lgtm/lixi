import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Item, datePrefix } from './items';
import { euro, relativeDays, shortDate } from './format';

// Reminders are local notifications scheduled on the phone — no server needed.
// Each time the list changes we cancel everything and schedule again; with a
// few dozen items this is instant and avoids keeping ids in sync.

const CHANNEL = 'reminders';
const REMIND_HOUR = 9; // 09:00 local time

let ready: Promise<boolean> | null = null;

export function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(false);
  if (!ready) {
    ready = (async () => {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(CHANNEL, {
            name: 'Υπενθυμίσεις',
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
        const current = await Notifications.getPermissionsAsync();
        if (current.granted) return true;
        const asked = await Notifications.requestPermissionsAsync();
        return asked.granted;
      } catch {
        return false;
      }
    })();
  }
  return ready;
}

export async function rescheduleAll(items: Item[]): Promise<void> {
  const allowed = await setupNotifications();
  if (!allowed) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    for (const item of items) {
      if (item.doneAt || item.sample) continue;
      const [y, m, d] = item.due.split('-').map(Number);
      const at = new Date(y, m - 1, d - item.remindDays, REMIND_HOUR, 0, 0);
      if (at.getTime() <= now) continue;
      // Text is computed for the day it fires, not for today.
      const days = item.remindDays;
      const money = item.amount != null ? ` · ${euro(item.amount)}` : '';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: `${datePrefix(item.kind)} ${relativeDays(days)} (${shortDate(item.due)})${money}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  } catch {
    // Scheduling can fail on some devices; the in-app timeline still works.
  }
}

