'use client';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'retro' ? 'modern' : 'retro');
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === 'retro' ? (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Switch to Modern Theme</span>
        </>
      ) : (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all" />
          <span className="sr-only">Switch to Retro Theme</span>
        </>
      )}
    </Button>
  );
}
