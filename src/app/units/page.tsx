"use client";

import { useSupabaseTable } from '@/hooks/use-supabase';
import { Unit } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Mountain, Gem, BookOpen, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/theme-provider';

const iconMap: { [key:string]: LucideIcon } = {
  Shield,
  Mountain,
  Gem,
  BookOpen,
};

export default function UnitsPage() {
  const { fontClassName } = useTheme();
  const { data: units, loading: isLoading } = useSupabaseTable<Unit>('units', {
    select: '*, members(*)'
  });

  return (
    <div className={cn("flex flex-col min-h-screen pb-24 sm:pb-0", fontClassName)}>
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-background">
        <header className="w-full max-w-4xl text-center py-6 sm:py-10">
           <h1 className="text-4xl sm:text-6xl font-bold text-primary font-headline tracking-tighter">
            Unidades
          </h1>
        </header>

        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading && (
            <>
              <Skeleton className="h-64 sm:h-auto sm:aspect-square rounded-lg" />
              <Skeleton className="h-64 sm:h-auto sm:aspect-square rounded-lg" />
            </>
          )}
          {units?.map((unit) => {
            const Icon = iconMap[unit.icon] || Shield;
            return (
              <Link href={`/unit/${unit.id}`} key={unit.id} className="transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
                <Card 
                    className="h-64 sm:h-auto sm:aspect-square flex flex-col justify-end p-4 hover:border-primary border-2 border-transparent transition-colors duration-300 relative overflow-hidden rounded-lg"
                    style={{ backgroundColor: unit.cardColor && !unit.cardImageUrl ? unit.cardColor : undefined }}
                >
                  {unit.cardImageUrl ? (
                    <Image
                      src={unit.cardImageUrl}
                      alt={unit.name}
                      fill
                      className="object-cover z-0"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 z-0" style={{backgroundColor: unit.cardColor || 'transparent'}}></div>
                  )}
                  <div className="relative z-10 bg-black/50 p-4 mt-auto">
                    <CardHeader className="flex flex-row items-center justify-between text-left pb-2 p-0">
                      <div className='flex items-center gap-2'>
                        {unit.iconUrl ? (
                          <img src={unit.iconUrl} alt={unit.name} className="h-8 w-8 object-contain" />
                        ) : (
                          <Icon className="h-8 w-8 text-primary" />
                        )}
                        <CardTitle className="text-xl font-bold text-white">{unit.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 text-base text-gray-200">
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
      </main>
    </div>
  );
}

import { cn } from '@/lib/utils';
