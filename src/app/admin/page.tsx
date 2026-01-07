
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit, LogOut, Eye, EyeOff, Star, Upload } from 'lucide-react';
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
import type { Unit, Rank, RankData } from '@/lib/types';
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
import { signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultScoringCriteria } from '@/lib/data';
import { ranks as defaultRanks, getRanks } from '@/lib/ranks';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  password: z.string().optional(),
});

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  rememberMe: z.boolean().default(false),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [customRanks, setCustomRanks] = useState<Rank[]>(getRanks());

  const unitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'units'));
  }, [firestore]);

  const { data: units, isLoading } = useCollection<Unit>(unitsQuery);

  useEffect(() => {
    // If units are loaded, derive the ranks from the first unit that has them
    if (units && units.length > 0) {
        const unitWithRanks = units.find(u => u.ranks && u.ranks.length > 0);
        if (unitWithRanks) {
            setCustomRanks(getRanks(unitWithRanks.ranks));
        }
    }
  }, [units]);

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
      rememberMe: false,
    },
  });

   const handleEmailPasswordSignIn = async (values: z.infer<typeof loginFormSchema>) => {
    if (!auth) return;
    setIsAuthLoading(true);
    try {
      const persistence = values.rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

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
      scoringCriteria: defaultScoringCriteria,
      ranks: defaultRanks.map(({Icon, ...data}) => data)
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

   function handleRankIconChange(rankName: string, iconUrl: string) {
    const updatedRanks = customRanks.map(r => r.name === rankName ? { ...r, iconUrl } : r);
    setCustomRanks(updatedRanks);
  };

  async function handleSaveRanks() {
    if (!firestore || !units) return;

    const ranksToSave: RankData[] = customRanks.map(({ Icon, ...data }) => data);

    const batch = units.map(unit => {
        const unitRef = doc(firestore, 'units', unit.id);
        return setDocumentNonBlocking(unitRef, { ranks: ranksToSave }, { merge: true });
    });
    
    await Promise.all(batch);

    toast({
      title: 'Patentes Atualizadas!',
      description: 'Os ícones das patentes foram salvos para todas as unidades.',
    });
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
                                  <div className="relative">
                                    <Input 
                                      type={showPassword ? 'text' : 'password'} 
                                      placeholder="********" 
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute inset-y-0 right-0 h-full px-3"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff /> : <Eye />}
                                      <span className="sr-only">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</span>
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Mantenha-me conectado
                                  </FormLabel>
                                </div>
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
              <CardTitle className="flex items-center gap-2">
                <Star />
                Gerenciar Patentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customRanks.map(rank => (
                <div key={rank.name} className="flex items-center gap-4">
                  <Label htmlFor={`rank-icon-${rank.name}`} className="w-24 flex-shrink-0">{rank.name}</Label>
                  <div className="relative flex-grow">
                     <Input
                        id={`rank-icon-${rank.name}`}
                        type="text"
                        placeholder="URL do ícone"
                        value={rank.iconUrl || ''}
                        onChange={(e) => handleRankIconChange(rank.name, e.target.value)}
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                        {rank.iconUrl ? (
                          <img src={rank.iconUrl} alt={rank.name} className="h-5 w-5 object-contain" />
                        ) : (
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                  </div>
                </div>
              ))}
              <Button onClick={handleSaveRanks} className="w-full mt-4">
                Salvar Ícones de Patente
              </Button>
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
