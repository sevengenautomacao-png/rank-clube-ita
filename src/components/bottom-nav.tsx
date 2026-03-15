"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Shield, Settings, Lock, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  {
    label: 'Ranking',
    icon: Trophy,
    href: '/',
  },
  {
    label: 'Unidades',
    icon: Shield,
    href: '/units',
  },
  {
    label: 'Eventos',
    icon: CalendarIcon,
    href: '/events',
  },
  {
    label: 'Config',
    icon: Settings,
    href: '/settings',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe-area-inset-bottom h-[calc(4.5rem+env(safe-area-inset-bottom))] flex items-center justify-around px-4 sm:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "scale-110 transition-transform")} />
            <span className="text-[10px] font-medium font-inter tracking-tight">{item.label}</span>
          </Link>
        );
      })}
      
      {user && (
        <Link
          href="/admin"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === '/admin' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Lock className={cn("h-6 w-6", pathname === '/admin' && "scale-110 transition-transform")} />
          <span className="text-[10px] font-medium font-inter tracking-tight uppercase">ADM</span>
        </Link>
      )}
    </nav>
  );
}

// Global styles for safe area (should be in globals.css if not already)
// env(safe-area-inset-bottom) is handled by modern browsers for notched phones
