
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit, LogOut, Eye, EyeOff, Star, Upload, Image as ImageIcon, Users, BookOpen, Download, Palette, ShieldAlert } from 'lucide-react';
import * as XLSX from 'xlsx';
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
import type { Unit, RankData, AppSettings } from '@/lib/types';
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
import { useSupabaseTable, useSupabaseDoc, toSnakeCase } from '@/hooks/use-supabase';
import { supabase } from '@/lib/supabase';
import { useAuth, UserProfile } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultScoringCriteria, defaultRanks, defaultRoles, defaultClasses } from '@/lib/data';
import { getRanks } from '@/lib/ranks';
import { getClassByAge } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select as UISelect, SelectContent as UISelectContent, SelectItem as UISelectItem, SelectTrigger as UISelectTrigger, SelectValue as UISelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  password: z.string().optional(),
});

const loginFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  rememberMe: z.boolean().default(false),
});

const rankFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  score: z.coerce.number().min(0, { message: "A pontuação deve ser 0 ou maior." }),
  iconUrl: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
});

const appSettingsFormSchema = z.object({
    appIconUrl: z.string().url({ message: "Por favor, insira uma URL de ícone válida." }).optional().or(z.literal('')),
    clubName: z.string().min(1, { message: "O nome do clube é obrigatório." }).default("ITA"),
});


export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile: currentUserProfile, isLoading: isGlobalAuthLoading } = useAuth();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [managedRanks, setManagedRanks] = useState<RankData[] | null>(null);
  const [managedRoles, setManagedRoles] = useState<string[] | null>(null);
  const [managedClasses, setManagedClasses] = useState<string[] | null>(null);

  const { data: units, loading: isLoading } = useSupabaseTable<Unit>('units', {
    select: '*, members(*), score_logs(*)'
  });

  const { data: profiles, loading: isProfilesLoading, refetch: refetchProfiles } = useSupabaseTable<UserProfile>('profiles');

  const { data: appSettings } = useSupabaseDoc<AppSettings>('settings', 'app');

  const appSettingsForm = useForm<z.infer<typeof appSettingsFormSchema>>({
      resolver: zodResolver(appSettingsFormSchema),
      defaultValues: { 
        appIconUrl: '',
        clubName: 'ITA'
      }
  });

  useEffect(() => {
    if (appSettings) {
        appSettingsForm.reset({ 
          appIconUrl: appSettings.appIconUrl || '',
          clubName: appSettings.clubName || 'ITA'
        });
    }
  }, [appSettings, appSettingsForm]);

  useEffect(() => {
    if (units && units.length > 0) {
        const unitWithRanks = units.find(u => u.ranks && u.ranks.length > 0);
        if (unitWithRanks && unitWithRanks.ranks) {
          setManagedRanks([...unitWithRanks.ranks].sort((a, b) => a.score - b.score));
        } else {
          setManagedRanks(defaultRanks.sort((a, b) => a.score - b.score));
        }

        const unitWithRoles = units.find(u => u.roles && u.roles.length > 0);
        if (unitWithRoles && unitWithRoles.roles) {
          setManagedRoles(unitWithRoles.roles);
        } else {
          setManagedRoles(defaultRoles);
        }

        const unitWithClasses = units.find(u => u.classes && u.classes.length > 0);
        if (unitWithClasses && unitWithClasses.classes) {
          setManagedClasses(unitWithClasses.classes);
        } else {
          setManagedClasses(defaultClasses);
        }
    } else if (units && units.length === 0) {
      setManagedRanks(defaultRanks.sort((a, b) => a.score - b.score));
      setManagedRoles(defaultRoles);
      setManagedClasses(defaultClasses);
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
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      toast({ title: "Acesso concedido!" });
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({ 
        variant: 'destructive', 
        title: "Erro de autenticação!", 
        description: error.message || "Email ou senha incorretos." 
      });
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    loginForm.reset();
    toast({ title: "Você saiu." });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const unitId = values.name.toLowerCase().replace(/\s+/g, '-');
    
    if (units?.some(unit => unit.id === unitId)) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: `Uma unidade com o nome "${values.name}" já existe.`,
      });
      return;
    }

    const newUnitData = {
      id: unitId,
      name: values.name,
      password: values.password || "",
      icon: 'Shield', // Default icon
      scoring_criteria: defaultScoringCriteria,
      ranks: managedRanks || defaultRanks,
      roles: managedRoles || defaultRoles,
      classes: managedClasses || defaultClasses,
    };

    const { error } = await supabase.from('units').insert(toSnakeCase(newUnitData));
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao criar!", description: error.message });
      return;
    }

    toast({
      title: 'Unidade criada!',
      description: `A unidade "${values.name}" foi criada com sucesso.`,
    });
    form.reset();
  }

  async function handleDeleteUnit(unitId: string) {
    const unitToDelete = units?.find(u => u.id === unitId);
    if (!unitToDelete) return;
    
    const { error } = await supabase.from('units').delete().eq('id', unitId);
    
    if (error) {
        toast({ variant: 'destructive', title: "Erro ao excluir!", description: error.message });
        return;
    }

    toast({
        title: "Unidade Excluída",
        description: `A unidade "${unitToDelete.name}" foi excluída.`,
        variant: "destructive"
    });
  }

  async function handleUpdateUnit(values: Partial<Unit>) {
    if (!editingUnit) return;
    
    // Omit fields that are separate tables or computed
    const { members, scoreHistory, ...updateData } = values as any;
    
    const { error } = await supabase.from('units').update(toSnakeCase(updateData)).eq('id', editingUnit.id);
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao atualizar!", description: error.message });
      return;
    }

    toast({
      title: "Unidade Atualizada",
      description: `A unidade "${editingUnit.name}" foi atualizada.`,
    });
    setEditingUnit(null);
  }

  async function handleSaveRanks() {
    if (!units || !managedRanks) return;
    
    const ranksToSave = managedRanks.sort((a,b) => a.score - b.score);

    // Update all units with the new ranks
    const { error } = await supabase.from('units').update({ ranks: ranksToSave }).in('id', units.map(u => u.id));
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao salvar patentes!", description: error.message });
      return;
    }

    toast({
      title: 'Patentes Atualizadas!',
      description: 'As patentes foram salvas para todas as unidades.',
    });
  }

  async function handleSaveRoles() {
    if (!units || !managedRoles) return;
    
    // Update all units with the new roles
    const { error } = await supabase.from('units').update({ roles: managedRoles }).in('id', units.map(u => u.id));
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao salvar funções!", description: error.message });
      return;
    }

    toast({
      title: 'Funções Atualizadas!',
      description: 'As funções foram salvas para todas as unidades.',
    });
  }

  async function handleSaveClasses() {
    if (!units || !managedClasses) return;
    
    // Update all units with the new classes
    const { error } = await supabase.from('units').update({ classes: managedClasses }).in('id', units.map(u => u.id));
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao salvar classes!", description: error.message });
      return;
    }

    toast({
      title: 'Classes Atualizadas!',
      description: 'As classes foram salvas para todas as unidades.',
    });
  }

  const handleSaveAppSettings = async (values: z.infer<typeof appSettingsFormSchema>) => {
    const { error } = await supabase.from('settings').upsert({ id: 'app', ...toSnakeCase(values) });
    
    if (error) {
        toast({ variant: 'destructive', title: "Erro ao salvar configurações!", description: error.message });
        return;
    }

    toast({
        title: "Configurações do App Salvas!",
        description: "As configurações gerais do aplicativo foram atualizadas.",
    });
  };

  const handleSyncClassesByAge = async () => {
    if (!units) return;
    
    setIsAuthLoading(true);
    let updatedCount = 0;
    
    try {
      // 1. Gather all members
      const allMembers: any[] = units.flatMap(u => u.members || []);
      
      const updatePromises = allMembers.map(async (member) => {
        const suggestedClass = getClassByAge(member.age);
        if (suggestedClass && member.className !== suggestedClass) {
          const { error } = await supabase
            .from('members')
            .update({ class_name: suggestedClass })
            .eq('id', member.id);
            
          if (!error) updatedCount++;
          return error;
        }
        return null;
      });
      
      await Promise.all(updatePromises);
      
      // 2. Ensure "Agrupadas" is in the managed classes if needed
      if (managedClasses && !managedClasses.includes("Agrupadas")) {
         const newClasses = [...managedClasses, "Agrupadas"];
         setManagedClasses(newClasses);
         await supabase.from('units').update({ classes: newClasses }).in('id', units.map(u => u.id));
      }

      toast({
        title: "Sincronização Concluída",
        description: `${updatedCount} membros tiveram suas classes atualizadas.`,
      });
      
      // Refresh data
      router.refresh();
      
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: "Erro na sincronização",
        description: err.message,
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGlobalExport = () => {
    if (!units) return;

    // 1. Ranking Global Sheet
    const allMembers: any[] = [];
    units.forEach(unit => {
      const unitMembers = (unit.members || []).map(member => ({
        'Unidade': unit.name,
        'Nome': member.name,
        'Pontuação': member.score || 0,
        'Classe': member.className || '',
        'Função': member.role || '',
        'Idade': member.age || '',
      }));
      allMembers.push(...unitMembers);
    });

    const sortedMembers = allMembers.sort((a, b) => b.Pontuação - a.Pontuação);
    const rankingSheet = XLSX.utils.json_to_sheet(sortedMembers);

    // 2. Histórico Global Sheet
    const allHistory: any[] = [];
    units.forEach(unit => {
      const unitLogs = (unit.scoreLogs || []).flatMap((log: any) => {
        const date = new Date(log.date).toLocaleDateString('pt-BR');
        return Object.entries(log.memberScores || {}).map(([memberId, scoreDetails]: [string, any]) => {
          const member = unit.members?.find(m => m.id === memberId);
          if (!member) return null;

          const row: any = {
            'Unidade': unit.name,
            'Data': date,
            'Membro': member.name,
          };

          // Add scoring criteria columns
          unit.scoringCriteria?.forEach((criterion: any) => {
            row[criterion.label] = scoreDetails[criterion.id] ? criterion.points : 0;
          });

          row['Observação'] = scoreDetails.observation || '';
          row['Total do Dia'] = scoreDetails.points || 0;
          return row;
        }).filter(row => row !== null);
      });
      allHistory.push(...unitLogs);
    });

    const historySheet = XLSX.utils.json_to_sheet(allHistory);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Ranking Global');
    XLSX.utils.book_append_sheet(workbook, historySheet, 'Histórico Global');

    const fileName = `Relatorio_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Relatório Global Gerado",
      description: "O arquivo Excel foi baixado com sucesso.",
    });
  };

  const handleUpdateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase.from('profiles').update(toSnakeCase(updates)).eq('id', userId);
    
    if (error) {
      toast({ variant: 'destructive', title: "Erro ao atualizar perfil!", description: error.message });
      return;
    }

    toast({
      title: "Perfil Atualizado",
      description: "Os acessos do usuário foram atualizados com sucesso.",
    });

    refetchProfiles();
  };

  if (isGlobalAuthLoading || isProfilesLoading) {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background pb-24">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-64 w-full max-w-md rounded-lg" />
        </main>
    )
  }

  if (!user) {
    return (
        <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background pb-24">
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
                        <CardTitle>ADM</CardTitle>
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
                          <Button type="submit" className="w-full" disabled={isAuthLoading}>
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

  if (currentUserProfile && !['admin', 'secretary'].includes(currentUserProfile.role)) {
     return (
        <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background pb-24">
            <header className="w-full max-w-xl flex items-start mb-8 sm:mb-12">
                <Button variant="outline" size="icon" asChild>
                <Link href="/" aria-label="Voltar para o início">
                    <ArrowLeft />
                </Link>
                </Button>
            </header>
            <div className="w-full max-w-md text-center mt-12">
                <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-3xl font-bold font-headline text-destructive mb-2">Acesso Negado</h1>
                <p className="text-muted-foreground">Sua conta ({currentUserProfile.email}) não tem permissão para acessar o painel administrativo do clube.</p>
                <Button variant="outline" onClick={handleSignOut} className="mt-8">Sair da Conta</Button>
            </div>
        </main>
     )
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
      <div className="w-full max-w-xl pb-32 sm:pb-8">
        <div className="text-center py-6 sm:py-10 uppercase">
            <h1 className="text-4xl sm:text-6xl font-bold font-headline text-primary tracking-tighter">
            ADM
            </h1>
            <p className="text-lg text-muted-foreground mt-2 normal-case">
            Gerencie o aplicativo.
            </p>
        </div>

        <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="unidades">Unidades</TabsTrigger>
                <TabsTrigger value="acessos">Acessos</TabsTrigger>
                <TabsTrigger value="config">Definições</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={handleGlobalExport} variant="secondary" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Gerar Relatório Geral (Global)
                    </Button>
                    <Button onClick={handleSyncClassesByAge} variant="outline" className="flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10">
                        <Star className="h-4 w-4" />
                        Sincronizar Classes por Idade
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette />
                        Configurações Visuais
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...appSettingsForm}>
                        <form onSubmit={appSettingsForm.handleSubmit(handleSaveAppSettings)} className="space-y-6 text-left">
                            <FormField
                            control={appSettingsForm.control}
                            name="clubName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nome do Clube</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: ITA" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">Este nome aparecerá na tela de carregamento (Splash Screen).</p>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={appSettingsForm.control}
                            name="appIconUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL do Ícone do App</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://exemplo.com/icone.png" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full">
                                Salvar Configurações
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="unidades" className="space-y-8">
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
            </TabsContent>

            <TabsContent value="acessos" className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <ShieldAlert />
                           Gerenciar Acessos (Membros)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isProfilesLoading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : profiles && profiles.length > 0 ? (
                            <div className="space-y-4">
                                {profiles.map(p => (
                                    <div key={p.id} className="p-4 border rounded-lg bg-card/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div className="text-left flex-1">
                                            <p className="font-medium">{p.email}</p>
                                            <p className="text-sm text-muted-foreground">ID: {p.id.split('-')[0]}...</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-stretch w-full sm:w-auto">
                                            <UISelect value={p.role} onValueChange={(val) => handleUpdateUserProfile(p.id, { role: val as any })}>
                                                <UISelectTrigger className="w-[140px]">
                                                    <UISelectValue placeholder="Papel" />
                                                </UISelectTrigger>
                                                <UISelectContent>
                                                    <UISelectItem value="admin">Admin</UISelectItem>
                                                    <UISelectItem value="secretary">Secretária</UISelectItem>
                                                    <UISelectItem value="counselor">Conselheiro</UISelectItem>
                                                    <UISelectItem value="member">Membro</UISelectItem>
                                                </UISelectContent>
                                            </UISelect>
                                            
                                            {p.role === 'counselor' && (
                                                <UISelect value={(p as any).unitId || "none"} onValueChange={(val) => handleUpdateUserProfile(p.id, { unit_id: val === "none" ? null : val })}>
                                                    <UISelectTrigger className="w-[160px]">
                                                        <UISelectValue placeholder="Sem Unidade" />
                                                    </UISelectTrigger>
                                                    <UISelectContent>
                                                        <UISelectItem value="none">Sem Unidade</UISelectItem>
                                                        {units?.map(u => (
                                                            <UISelectItem key={u.id} value={u.id}>{u.name}</UISelectItem>
                                                        ))}
                                                    </UISelectContent>
                                                </UISelect>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center">Nenhum perfil encontrado.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-8">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <Star />
                        Gerenciar Patentes
                        </div>
                        <RankFormDialog 
                        triggerButton={<Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>}
                        onSave={(newRank) => {
                            const updatedRanks = [...(managedRanks || []), newRank].sort((a,b)=> a.score - b.score);
                            setManagedRanks(updatedRanks);
                        }}
                        />
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {managedRanks === null && <Skeleton className="h-20 w-full" />}
                    {managedRanks && managedRanks.map(rank => (
                        <div key={rank.name} className="flex items-center gap-4 p-2 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {rank.iconUrl ? (
                            <img src={rank.iconUrl} alt={rank.name} className="h-6 w-6 object-contain" />
                            ) : (
                            <Star className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{rank.name}</p>
                            <p className="text-sm text-muted-foreground">Pontos: {rank.score}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <RankFormDialog 
                            triggerButton={<Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>}
                            onSave={(updatedRank) => {
                                const updatedRanks = managedRanks.map(r => r.name === rank.name ? {...r, ...updatedRank} : r).sort((a,b) => a.score - b.score);
                                setManagedRanks(updatedRanks);
                            }}
                            existingRank={rank}
                            />
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Patente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir a patente "{rank.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    const updatedRanks = managedRanks.filter(r => r.name !== rank.name);
                                    setManagedRanks(updatedRanks);
                                }}>
                                    Excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </div>
                    ))}
                    <Button onClick={handleSaveRanks} className="w-full mt-4" disabled={managedRanks === null}>
                        Salvar Alterações nas Patentes
                    </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <Users />
                        Gerenciar Funções
                        </div>
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                        id="new-role" 
                        placeholder="Nova função" 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && managedRoles && !managedRoles.includes(value)) {
                                setManagedRoles([...managedRoles, value]);
                                input.value = '';
                            }
                            }
                        }}
                        />
                        <Button onClick={() => {
                        const input = document.getElementById('new-role') as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && managedRoles && !managedRoles.includes(value)) {
                            setManagedRoles([...managedRoles, value]);
                            input.value = '';
                        }
                        }}>
                        <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {managedRoles === null && <Skeleton className="h-10 w-full" />}
                        {managedRoles && managedRoles.map(role => (
                        <div key={role} className="flex items-center justify-between p-2 border rounded-lg bg-card/50 text-left">
                            <span>{role}</span>
                            <div className="flex items-center gap-1">
                            <RenameItemDialog 
                                currentName={role}
                                onRename={(newName) => {
                                if (managedRoles.includes(newName)) {
                                    toast({ variant: 'destructive', title: "Erro!", description: "Esta função já existe." });
                                    return;
                                }
                                setManagedRoles(managedRoles.map(r => r === role ? newName : r));
                                }}
                                triggerButton={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>}
                                title="Editar Função"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                setManagedRoles(managedRoles.filter(r => r !== role));
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        </div>
                        ))}
                    </div>

                    <Button onClick={handleSaveRoles} className="w-full mt-4" disabled={managedRoles === null}>
                        Salvar Alterações nas Funções
                    </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <BookOpen />
                        Gerenciar Classes
                        </div>
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                        id="new-class" 
                        placeholder="Nova classe" 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && managedClasses && !managedClasses.includes(value)) {
                                setManagedClasses([...managedClasses, value]);
                                input.value = '';
                            }
                            }
                        }}
                        />
                        <Button onClick={() => {
                        const input = document.getElementById('new-class') as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && managedClasses && !managedClasses.includes(value)) {
                            setManagedClasses([...managedClasses, value]);
                            input.value = '';
                        }
                        }}>
                        <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {managedClasses === null && <Skeleton className="h-10 w-full" />}
                        {managedClasses && managedClasses.map(cls => (
                        <div key={cls} className="flex items-center justify-between p-2 border rounded-lg bg-card/50 text-left">
                            <span>{cls}</span>
                            <div className="flex items-center gap-1">
                            <RenameItemDialog 
                                currentName={cls}
                                onRename={(newName) => {
                                if (managedClasses.includes(newName)) {
                                    toast({ variant: 'destructive', title: "Erro!", description: "Esta classe já existe." });
                                    return;
                                }
                                setManagedClasses(managedClasses.map(c => c === cls ? newName : c));
                                }}
                                triggerButton={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>}
                                title="Editar Classe"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                setManagedClasses(managedClasses.filter(c => c !== cls));
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        </div>
                        ))}
                    </div>
                    <Button onClick={handleSaveClasses} className="w-full mt-4" disabled={managedClasses === null}>
                        Salvar Alterações nas Classes
                    </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
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

function RankFormDialog({ triggerButton, onSave, existingRank }: { triggerButton: React.ReactElement, onSave: (rank: RankData) => void, existingRank?: RankData }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof rankFormSchema>>({
    resolver: zodResolver(rankFormSchema),
    defaultValues: existingRank || {
      name: "",
      score: 0,
      iconUrl: "",
    },
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset(existingRank || { name: "", score: 0, iconUrl: "" });
    }
  }, [isOpen, existingRank, form]);


  const handleSubmit = (values: z.infer<typeof rankFormSchema>) => {
    onSave(values);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingRank ? 'Editar Patente' : 'Adicionar Nova Patente'}</DialogTitle>
          <DialogDescription>
            Defina os detalhes da patente. A pontuação é o mínimo necessário para alcançar esta patente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Patente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Soldado" {...field} disabled={!!existingRank} />
                  </FormControl>
                   {!!existingRank && <p className="text-xs text-muted-foreground">O nome de patentes existentes não pode ser alterado.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação Mínima</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Ícone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://imgur.com/upload" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RenameItemDialog({ 
  currentName, 
  onRename, 
  triggerButton, 
  title 
}: { 
  currentName: string, 
  onRename: (newName: string) => void, 
  triggerButton: React.ReactElement,
  title: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== currentName) {
      onRename(trimmedName);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Altere o nome do item abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="rename-input" className="sr-only">Nome</Label>
          <Input 
            id="rename-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    

    

    

