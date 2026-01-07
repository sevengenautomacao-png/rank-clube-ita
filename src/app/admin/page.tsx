
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
import { initialUnits } from '@/lib/data';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newUnit: Unit = {
      id: values.name.toLowerCase().replace(/\s+/g, '-'),
      name: values.name,
      members: [],
      icon: 'Shield', // Default icon
    };

    if (units.some(unit => unit.id === newUnit.id)) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: `Uma unidade com o nome "${values.name}" já existe.`,
      });
      return;
    }

    const newUnits = [...units, newUnit];
    // This is not ideal, should be replaced with a proper state management
    initialUnits.push(newUnit);
    setUnits(newUnits);

    toast({
      title: 'Unidade criada!',
      description: `A unidade "${values.name}" foi criada com sucesso.`,
    });
    form.reset();
  }

  function handleDeleteUnit(unitId: string) {
    const unitToDelete = units.find(u => u.id === unitId);
    if (!unitToDelete) return;
    
    // This is not ideal, should be replaced with a proper state management
    const unitIndex = initialUnits.findIndex(u => u.id === unitId);
    if (unitIndex > -1) {
        initialUnits.splice(unitIndex, 1);
    }
    
    setUnits(units.filter(u => u.id !== unitId));
    
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
                  <Button type="submit" className="w-full">
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
                {units.length > 0 ? (
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
                                                </D_escription>
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
                    <p className="text-muted-foreground text-center">Nenhuma unidade criada ainda.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
