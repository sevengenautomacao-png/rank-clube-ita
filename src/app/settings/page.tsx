"use client";

import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Globe, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { fontClassName } = useTheme();

  return (
    <div className={cn("flex flex-col min-h-screen pb-24 sm:pb-0", fontClassName)}>
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-background">
        <header className="w-full max-w-2xl text-center py-6 sm:py-10 uppercase">
           <h1 className="text-4xl sm:text-6xl font-bold text-primary font-headline tracking-tighter">
            Ajustes
          </h1>
          <p className="text-muted-foreground mt-2 normal-case">Personalize sua experiência no app.</p>
        </header>

        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Escolha o tema e estilo visual que mais lhe agrada.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="font-medium">Modo de Cor</span>
              <ThemeSwitcher />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Idioma e Região
              </CardTitle>
              <CardDescription>Configurações de localidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium">Formato de Data</span>
                <span className="text-muted-foreground">DD/MM/YYYY (BR)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Rank Clube Ita</strong> - V1.5.0</p>
              <p>Desenvolvido para gestão de clubes de desbravadores.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
