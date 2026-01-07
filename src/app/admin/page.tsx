"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();

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

    // Check for duplicate ID
    if (initialUnits.some(unit => unit.id === newUnit.id)) {
        toast({
            variant: "destructive",
            title: "Erro!",
            description: `Uma unidade com o nome "${values.name}" já existe.`,
        });
        return;
    }

    initialUnits.push(newUnit);

    toast({
      title: 'Unidade criada!',
      description: `A unidade "${values.name}" foi criada com sucesso.`,
    });
    
    form.reset();
    router.push('/');
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
      <header className="w-full max-w-4xl flex items-start mb-8 sm:mb-12">
        <Button variant="outline" size="icon" asChild>
          <Link href="/" aria-label="Voltar para o início">
            <ArrowLeft />
          </Link>
        </Button>
      </header>
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
          Área Administrativa
        </h1>
        <p className="text-lg text-muted-foreground mt-2 mb-8">
          Gerencie as configurações do aplicativo aqui.
        </p>

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
      </div>
    </main>
  );
}
