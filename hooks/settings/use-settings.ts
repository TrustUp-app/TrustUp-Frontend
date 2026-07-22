import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type AppLanguage = 'en' | 'es';

/**
 * User-configurable app settings, persisted locally with AsyncStorage.
 */
export interface AppSettings {
  /** Loan reminder push notifications on/off. */
  loanReminders: boolean;
  /** Automatically pay loans on their due date. */
  autoPay: boolean;
  /** Preferred UI language. */
  language: AppLanguage;
  /** Dark theme enabled. */
  darkMode: boolean;
}

export interface UseSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
  update: (partial: Partial<AppSettings>) => Promise<void>;
}

const STORAGE_KEY = 'trustup.settings';

const DEFAULT_SETTINGS: AppSettings = {
  loanReminders: true,
  autoPay: true,
  language: 'en',
  darkMode: false,
};

/**
 * Reads and writes app settings from AsyncStorage. Settings do not require an
 * API call; they are persisted locally per the issue spec.
 */
export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) });
        }
      } catch {
        // Keep defaults on read/parse failure.
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // Ignore write failures; state already reflects the change optimistically.
      });
      return next;
    });
  }, []);

  return { settings, isLoading, update };
};
