import { useEffect, useState } from 'react';

/** Light/dark theme. The CSS reads `body[data-theme="dark"]`. */
export function useTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
