import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      bg: { primary: '#0a0a0b', secondary: '#111113', tertiary: '#1a1a1d', hover: '#222225' },
      border: { primary: '#1f1f23', secondary: '#2a2a2d' },
      text: { primary: '#ffffff', secondary: '#a1a1aa', muted: '#71717a' }
    } : {
      bg: { primary: '#f8fafc', secondary: '#ffffff', tertiary: '#f1f5f9', hover: '#e2e8f0' },
      border: { primary: '#e2e8f0', secondary: '#cbd5e1' },
      text: { primary: '#0f172a', secondary: '#475569', muted: '#94a3b8' }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
