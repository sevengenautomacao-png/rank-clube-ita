import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initialUnits } from '@/lib/data';
import { Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
      <header className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
          Rank Clube Ita
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Gerencie as unidades de desbravadores.
        </p>
      </header>
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {initialUnits.map((unit) => (
          <Link href={`/unit/${unit.id}`} key={unit.id} className="transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
            <Card className="h-full flex flex-col justify-between hover:border-primary border-2 border-transparent transition-colors duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-bold">{unit.name}</CardTitle>
                <Shield className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{unit.members.length} membro(s)</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
