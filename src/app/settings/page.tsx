"use client";

import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

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



          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sobre" className="border-none">
              <Card className="border-primary/20 bg-primary/5">
                <AccordionTrigger className="hover:no-underline px-6 py-0 [&[data-state=open]>div>svg:last-child]:rotate-180">
                  <CardHeader className="p-0 py-6 w-full flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary m-0 text-base font-semibold">
                      <ShieldCheck className="h-5 w-5" />
                      Sobre
                    </CardTitle>
                  </CardHeader>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <CardContent className="p-0 text-sm text-muted-foreground space-y-2 text-left mt-2">
                    <p><strong>Rank Clube Ita</strong> - V1.5.0</p>
                    <p>Desenvolvido para gestão de clubes de desbravadores.</p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}
