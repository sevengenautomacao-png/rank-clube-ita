
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shield, Mountain, Gem, BookOpen, Star, Trophy, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Unit, Member, Rank } from '@/lib/types';
import { getRankForScore, getRanks } from '@/lib/ranks';


const iconMap: { [key: string]: LucideIcon } = {
  Shield,
  Mountain,
  Gem,
  BookOpen,
};


export default function Home() {
  const firestore = useFirestore();

  const unitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'units'));
  }, [firestore]);

  const { data: units, isLoading } = useCollection<Unit>(unitsQuery);

  const top5Members = useMemo(() => {
    if (!units) return [];
    
    const allMembers: (Member & { avatarFallback?: string, patent?: Rank })[] = units.flatMap(unit => {
        const customRanks = getRanks(unit.ranks);
        return (unit.members || []).map(member => ({ 
            ...member, 
            unitName: unit.name,
            unitId: unit.id,
            avatarFallback: member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            patent: getRankForScore(member.score || 0, unit.ranks)
        }))
    });

    return allMembers
        .filter(member => typeof member.score === 'number')
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5);

  }, [units]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-background">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
            Rank Clube Ita
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Gerencie as unidades de desbravadores.
          </p>
        </header>
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading && (
            <>
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
            </>
          )}
          {units?.map((unit) => {
            const Icon = iconMap[unit.icon] || Shield;
            return (
              <Link href={`/unit/${unit.id}`} key={unit.id} className="transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
                <Card 
                    className="aspect-square flex flex-col justify-end p-4 hover:border-primary border-2 border-transparent transition-colors duration-300 relative overflow-hidden"
                    style={{ backgroundColor: unit.cardColor && !unit.cardImageUrl ? unit.cardColor : undefined }}
                >
                  {unit.cardImageUrl && (
                    <Image
                      src={unit.cardImageUrl}
                      alt={unit.name}
                      fill
                      className="object-cover z-0"
                      data-ai-hint="nature landscape"
                    />
                  )}
                  <div className="relative z-10 bg-black/50 p-4 rounded-lg mt-auto">
                    <CardHeader className="flex flex-row items-center justify-between text-left pb-2 p-0">
                      <div className='flex items-center gap-2'>
                        <Icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-bold text-white">{unit.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 text-lg text-gray-200">
                        <Users className="h-5 w-5" />
                        <span>{unit.members?.length || 0} membro(s)</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
        
        {top5Members.length > 0 && (
          <section className="w-full max-w-4xl mt-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <CardTitle>Top 5 Membros</CardTitle>
                </div>
                <CardDescription>Os membros com as maiores pontuações em todas as unidades.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {top5Members.map((member, index) => {
                    const PatentIcon = member.patent?.Icon;
                    return (
                        <li key={member.id} className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold w-6 text-center">{index + 1}</span>
                            <Avatar>
                                <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{member.name}</p>
                            {member.patent && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    {member.patent.iconUrl ? (
                                      <Image src={member.patent.iconUrl} alt={member.patent.name} width={16} height={16} className="object-contain" />
                                    ) : PatentIcon ? (
                                      <PatentIcon className="h-4 w-4" />
                                    ) : null}
                                    {member.patent.name}
                                </p>
                            )}
                            <Link href={`/unit/${member.unitId}`} className="text-sm text-muted-foreground hover:underline">
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
              </CardContent>
            </Card>
          </section>
        )}

      </main>
      <footer className="w-full py-4 px-8 mt-auto border-t border-border text-center text-muted-foreground">
        <Link href="/admin" className="hover:text-primary transition-colors">
          Área Administrativa
        </Link>
      </footer>
    </div>
  );
}
