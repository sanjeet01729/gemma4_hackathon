import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'hindi' | 'english';

interface AppStore {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  language: 'hindi', // default

  // Call this to change language — saves to storage + updates all screens instantly
  setLanguage: async (lang: Language) => {
    set({ language: lang });
    await AsyncStorage.setItem('appLanguage', lang);
  },

  // Call this once on app start (in SplashScreen)
  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem('appLanguage');
      if (saved === 'hindi' || saved === 'english') {
        set({ language: saved });
      }
    } catch (_) {}
  },
}));