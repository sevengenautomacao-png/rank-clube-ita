"use client";

import React, { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, ShieldCheck, LogIn, LogOut, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { fontClassName } = useTheme();
  const { user, isLoading, profile } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Senhas diferentes', description: 'As senhas não coincidem.' });
        setIsSigningIn(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      setIsSigningIn(false);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao cadastrar', description: error.message });
      } else {
        toast({ title: 'Conta criada!', description: 'Seu perfil foi criado com o cargo de Membro. Um administrador pode alterar sua função.' });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setIsSigningIn(false);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao entrar', description: error.message });
      } else {
        toast({ title: 'Login realizado!', description: 'Bem-vindo de volta.' });
        setEmail('');
        setPassword('');
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Sessão encerrada.' });
  };

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    secretary: 'Secretária',
    counselor: 'Conselheiro',
    member: 'Membro',
  };

  return (
    <div className={cn("flex flex-col min-h-screen pb-24 sm:pb-0", fontClassName)}>
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-background">
        <header className="w-full max-w-2xl text-center py-6 sm:py-10 uppercase">
          <h1 className="text-4xl sm:text-6xl font-bold text-primary font-headline tracking-tighter">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-2 normal-case">Personalize sua experiência no app.</p>
        </header>

        <div className="w-full max-w-2xl space-y-6">

          {/* === LOGIN / CONTA === */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user ? <User className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                {user ? 'Minha Conta' : 'Entrar'}
              </CardTitle>
              <CardDescription>
                {user
                  ? 'Você está conectado. Acesse o painel ADM se tiver permissão.'
                  : 'Faça login para acessar funções administrativas.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 flex items-center text-muted-foreground text-sm">Carregando...</div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.email}</p>
                      {profile && (
                        <p className="text-sm text-muted-foreground">
                          {roleLabel[profile.role] ?? profile.role}
                        </p>
                      )}
                    </div>
                    {(profile?.role === 'admin' || profile?.role === 'secretary') && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin">Painel ADM</Link>
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="settings-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="settings-confirm-password">Confirmar Senha</Label>
                      <Input
                        id="settings-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full gap-2" disabled={isSigningIn}>
                    <LogIn className="h-4 w-4" />
                    {isSigningIn
                      ? (isSignUp ? 'Cadastrando...' : 'Entrando...')
                      : (isSignUp ? 'Criar Conta' : 'Entrar')}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? 'Já tem uma conta?' : 'Não tem cadastro?'}{' '}
                    <button
                      type="button"
                      className="text-primary underline underline-offset-4 hover:no-underline font-medium"
                      onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); }}
                    >
                      {isSignUp ? 'Entrar' : 'Criar conta'}
                    </button>
                  </p>
                </form>
              )}

            </CardContent>
          </Card>

          {/* === APARÊNCIA === */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Escolha o tema e estilo visual que mais lhe agrada.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="font-medium">Modo de Cor</span>
              <ThemeSwitcher />
            </CardContent>
          </Card>

          {/* === SOBRE === */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sobre" className="border-none">
              <Card className="border-primary/20 bg-primary/5">
                <AccordionTrigger className="hover:no-underline px-6 py-0 [&[data-state=open]>div>svg:last-child]:rotate-180">
                  <CardHeader className="p-0 py-6 w-full flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary m-0 text-base font-semibold">
                      <ShieldCheck className="h-5 w-5" />
                      Sobre
                    </CardTitle>
                  </CardHeader>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <CardContent className="p-0 text-sm text-muted-foreground space-y-2 text-left mt-2">
                    <p><strong>Rank Clube Ita</strong> - V1.5.0</p>
                    <p>Desenvolvido para gestão de clubes de desbravadores.</p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}
