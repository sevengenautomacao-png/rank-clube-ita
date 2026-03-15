"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Shield, Settings, Lock, Calendar as CalendarIcon, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';

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
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
];

interface SidebarNavProps {
  clubName?: string;
}

export function SidebarNav({ clubName = "ITA" }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { fontClassName } = useTheme();

  return (
    <aside className="hidden sm:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-sm h-screen sticky top-0 left-0 p-6 z-40">
      <div className="mb-10 px-2">
        <h1 className={cn("text-2xl font-black text-primary tracking-tighter uppercase", fontClassName)}>
            RANK {clubName}
        </h1>
        <p className="text-[10px] text-muted-foreground font-inter uppercase tracking-widest mt-1">
            Sistema de Gestão
        </p>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 group-hover:scale-110 transition-transform")} />
              <span className="font-medium font-inter text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="pt-6 border-t border-border mt-auto">
            <Link
            href="/admin"
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                pathname === '/admin' 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            >
            <Lock className={cn("h-5 w-5 group-hover:scale-110 transition-transform")} />
            <span className="font-medium font-inter text-sm uppercase">Painel ADM</span>
            </Link>
        </div>
      )}
    </aside>
  );
}
