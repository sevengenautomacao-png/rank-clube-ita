
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit, LogOut } from 'lucide-react';
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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, useAuth } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultScoringCriteria } from '@/lib/data';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  password: z.string().optional(),
});

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const unitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'units'));
  }, [firestore]);

  const { data: units, isLoading } = useCollection<Unit>(unitsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  });

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

   const handleEmailPasswordSignIn = async (values: z.infer<typeof loginFormSchema>) => {
    if (!auth) return;
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      setIsAuthenticated(true);
      toast({ title: "Acesso concedido!" });
    } catch (error) {
      console.error("Authentication error:", error);
      toast({ variant: 'destructive', title: "Erro de autenticação!", description: "Email ou senha incorretos." });
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setIsAuthenticated(false);
    loginForm.reset();
    toast({ title: "Você saiu." });
  }

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
      password: values.password || "",
      members: [],
      icon: 'Shield', // Default icon
      scoringCriteria: defaultScoringCriteria
    };

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

  function handleUpdateUnit(values: Partial<Unit>) {
    if (!firestore || !editingUnit) return;
    const unitRef = doc(firestore, 'units', editingUnit.id);
    setDocumentNonBlocking(unitRef, values, { merge: true });
    toast({
      title: "Unidade Atualizada",
      description: `A unidade "${editingUnit.name}" foi atualizada.`,
    });
    setEditingUnit(null);
  }

  if (!isAuthenticated) {
    return (
        <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
            <header className="w-full max-w-xl flex items-start mb-8 sm:mb-12">
                <Button variant="outline" size="icon" asChild>
                <Link href="/" aria-label="Voltar para o início">
                    <ArrowLeft />
                </Link>
                </Button>
            </header>
            <div className="w-full max-w-md">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
                    Acesso Restrito
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                    Faça login com uma conta de administrador para gerenciar.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Área Administrativa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(handleEmailPasswordSignIn)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="admin@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={isAuthLoading || !auth}>
                            {isAuthLoading ? "Verificando..." : "Entrar"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background">
      <header className="w-full max-w-xl flex items-center justify-between mb-8 sm:mb-12">
        <Button variant="outline" size="icon" asChild>
          <Link href="/" aria-label="Voltar para o início">
            <ArrowLeft />
          </Link>
        </Button>
        <Button variant="outline" size="icon" onClick={handleSignOut}>
            <LogOut />
            <span className="sr-only">Sair</span>
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha de Acesso (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Senha para a unidade" {...field} value={field.value ?? ''}/>
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
                                <Link href={`/unit/${unit.id}`} className="font-medium hover:underline">{unit.name}</Link>
                                <div className="flex items-center gap-2">
                                    <Sheet open={editingUnit?.id === unit.id} onOpenChange={(isOpen) => !isOpen && setEditingUnit(null)}>
                                        <SheetTrigger asChild>
                                          <Button variant="outline" size="icon" onClick={() => setEditingUnit(unit)}>
                                              <Edit />
                                              <span className="sr-only">Editar {unit.name}</span>
                                          </Button>
                                        </SheetTrigger>
                                        <SheetContent>
                                          <SheetHeader>
                                            <SheetTitle>Editar Unidade: {editingUnit?.name}</SheetTitle>
                                          </SheetHeader>
                                          {editingUnit && <EditUnitForm unit={editingUnit} onUpdate={handleUpdateUnit} />}
                                        </SheetContent>
                                    </Sheet>
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


const editFormSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  password: z.string().optional(),
});


function EditUnitForm({ unit, onUpdate }: { unit: Unit, onUpdate: (values: Partial<Unit>) => void }) {
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: unit.name,
      password: unit.password || '',
    },
  });

  const handleSubmit = (values: z.infer<typeof editFormSchema>) => {
    onUpdate({
        name: values.name,
        password: values.password
    });
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 text-left mt-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome da Unidade</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Senha de Acesso</FormLabel>
                <FormControl>
                    <Input type="text" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" className="w-full">
            Salvar Alterações
            </Button>
        </form>
    </Form>
  )
}
