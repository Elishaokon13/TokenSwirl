// hooks/useThemeToggle.ts
import { useEffect, useState } from 'react';

export function useThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((prev) => !prev) };
}
