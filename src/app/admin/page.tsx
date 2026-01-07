import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
      <header className="w-full max-w-4xl flex items-start mb-8 sm:mb-12">
        <Button variant="outline" size="icon" asChild>
          <Link href="/" aria-label="Voltar para o início">
            <ArrowLeft />
          </Link>
        </Button>
      </header>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
          Área Administrativa
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Gerencie as configurações do aplicativo aqui.
        </p>
      </div>
       {/* Conteúdo da área de administração virá aqui */}
    </main>
  );
}
