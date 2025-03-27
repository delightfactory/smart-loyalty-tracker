
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export interface ThemeProviderContext {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

export const ThemeProviderContext = React.createContext<ThemeProviderContext>({
  theme: undefined,
  setTheme: () => null,
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string | undefined>(
    localStorage.getItem(props.storageKey || 'theme') || props.defaultTheme || 'light'
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme || 'light');
    }

    if (theme) {
      localStorage.setItem(props.storageKey || 'theme', theme);
    }
  }, [theme, props.storageKey]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: string) => setTheme(newTheme),
    }),
    [theme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderContext => {
  const context = React.useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
