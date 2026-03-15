
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Mountain, Gem, BookOpen, Star, Trophy, type LucideIcon, Palette, Calendar as CalendarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useSupabaseTable } from '@/hooks/use-supabase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Unit, Member, Rank } from '@/lib/types';
import { getRankForScore, getRanksForScore } from '@/lib/ranks';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';


const iconMap: { [key:string]: LucideIcon } = {
  Shield,
  Mountain,
  Gem,
  BookOpen,
};


export default function Home() {
  const { fontClassName } = useTheme();

  const { data: units, loading: isLoading } = useSupabaseTable<Unit>('units', {
    select: '*, members(*)'
  });

  const [displayLimit, setDisplayLimit] = useState(5);

  const topMembers = useMemo(() => {
    if (!units) return [];
    
    const allMembers: Member[] = units.flatMap(unit => {
        return (unit.members || []).map(member => ({ 
            ...member, 
            unitName: unit.name,
            unitId: unit.id,
            avatarFallback: member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            patent: getRankForScore(member.score || 0, unit.ranks),
            allPatents: getRanksForScore(member.score || 0, unit.ranks),
        }))
    });

    const sortedMembers = allMembers
        .filter(member => typeof member.score === 'number')
        .sort((a, b) => (b.score || 0) - (a.score || 0));

    return sortedMembers;

  }, [units]);

  return (
    <div className={`flex flex-col min-h-screen ${fontClassName}`}>
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-background pb-32 sm:pb-8">
        <header className="w-full max-w-4xl text-center py-6 sm:py-10">
           <h1 className="text-4xl sm:text-6xl font-bold text-primary font-headline tracking-tighter">
            RANKING
          </h1>
        </header>
        
        {topMembers.length > 0 && (
          <section className="w-full max-w-4xl">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <CardTitle>Top Membros</CardTitle>
                </div>
                <CardDescription>Os membros com as maiores pontuações em todas as unidades.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {topMembers.slice(0, displayLimit).map((member, index) => {
                    const PatentIcon = member.patent?.Icon;
                    const isRetro = fontClassName === 'font-retro';
                    return (
                        <li key={member.id} className={cn("p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors flex", 
                           isRetro ? 'flex-col items-center gap-4' : 'items-center justify-between'
                        )}>
                        <div className="flex items-center gap-4 w-full">
                            <span className="text-lg font-bold w-6 text-center">{index + 1}</span>
                            <Avatar>
                                {member.avatarUrl ? (
                                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                                ) : (
                                    <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                {member.patent && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        {member.patent.name}
                                    </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1">
                                    {member.allPatents?.slice(-3).map(p => {
                                        const PatentIcon = p.Icon;
                                        return p.iconUrl ? (
                                            <img key={p.name} src={p.iconUrl} alt={p.name} title={p.name} className="h-4 w-4 object-contain" />
                                        ) : PatentIcon ? (
                                            <PatentIcon key={p.name} className="h-4 w-4" />
                                        ) : null
                                    })}
                                </div>
                                <Link href={`/unit/${member.unitId}`} className="text-sm text-muted-foreground hover:underline mt-1 block">
                                    Unidade: {member.unitName}
                                 </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-yellow-400">
                            <Star className="h-5 w-5" />
                            <span>{member.score}</span>
                        </div>
                        </li>
                    )
                  })}
                </ul>
                {topMembers.length > displayLimit && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setDisplayLimit(prev => prev + 10)}
                      className="w-full sm:w-auto"
                    >
                      Carregar Mais
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

      </main>
      <footer className="w-full py-4 px-8 mt-auto border-t border-border text-center text-xs text-muted-foreground">
        <p>Ita diretoria todos os direitos reservados.</p>
        <Link href="/admin" className="hover:text-primary transition-colors text-xs mt-1 block">
          ADM
        </Link>
      </footer>
    </div>
  );
}
