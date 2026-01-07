
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Unit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultScoringCriteria } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const unitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'units'));
  }, [firestore]);

  const { data: units, isLoading } = useCollection<Unit>(unitsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    const unitId = values.name.toLowerCase().replace(/\s+/g, '-');
    
    if (units?.some(unit => unit.id === unitId)) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: `Uma unidade com o nome "${values.name}" já existe.`,
      });
      return;
    }

    const newUnit: Omit<Unit, 'id'> = {
      name: values.name,
      members: [],
      icon: 'Shield', // Default icon
      scoringCriteria: defaultScoringCriteria
    };

    const unitRef = doc(firestore, 'units', unitId);
    addDocumentNonBlocking(collection(firestore, 'units'), { ...newUnit, id: unitId });
    
    toast({
      title: 'Unidade criada!',
      description: `A unidade "${values.name}" foi criada com sucesso.`,
    });
    form.reset();
  }

  function handleDeleteUnit(unitId: string) {
    if (!firestore) return;
    const unitToDelete = units?.find(u => u.id === unitId);
    if (!unitToDelete) return;
    
    const unitRef = doc(firestore, 'units', unitId);
    deleteDocumentNonBlocking(unitRef);
    
    toast({
        title: "Unidade Excluída",
        description: `A unidade "${unitToDelete.name}" foi excluída.`,
        variant: "destructive"
    });
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
      <header className="w-full max-w-xl flex items-start mb-8 sm:mb-12">
        <Button variant="outline" size="icon" asChild>
          <Link href="/" aria-label="Voltar para o início">
            <ArrowLeft />
          </Link>
        </Button>
      </header>
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
            Área Administrativa
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
            Gerencie as configurações do aplicativo aqui.
            </p>
        </div>

        <div className="space-y-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus />
                Criar Nova Unidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Unidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Monte Sinai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={!firestore}>
                    Criar Unidade
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unidades Existentes</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div> }
                {units && units.length > 0 ? (
                    <ul className="space-y-4">
                        {units.map(unit => (
                            <li key={unit.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                                <span className="font-medium">{unit.name}</span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/unit/${unit.id}`}>
                                            <Edit />
                                            <span className="sr-only">Editar {unit.name}</span>
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 />
                                                <span className="sr-only">Excluir {unit.name}</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Essa ação não pode ser desfeita. Isso irá excluir permanentemente a unidade "{unit.name}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)}>
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                  !isLoading && <p className="text-muted-foreground text-center">Nenhuma unidade criada ainda.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
