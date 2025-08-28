import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact' | 'spacious';

interface ThemeState {
  theme: Theme;
  density: Density;
  reduceMotion: boolean;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setReduceMotion: (reduce: boolean) => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      density: 'comfortable',
      reduceMotion: false,
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      setDensity: (density) => {
        set({ density });
        applyDensity(density);
      },
      
      setReduceMotion: (reduce) => {
        set({ reduceMotion: reduce });
        applyMotionPreference(reduce);
      },
      
      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'voltai-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyDensity(state.density);
          applyMotionPreference(state.reduceMotion);
        }
      },
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

function applyDensity(density: Density) {
  const root = document.documentElement;
  root.classList.remove('density-comfortable', 'density-compact', 'density-spacious');
  root.classList.add(`density-${density}`);
}

function applyMotionPreference(reduce: boolean) {
  const root = document.documentElement;
  root.classList.toggle('reduce-motion', reduce);
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyTheme('system');
    }
  });
}