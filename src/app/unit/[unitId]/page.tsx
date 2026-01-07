
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, User, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { initialUnits } from '@/lib/data';
import type { Unit, Member } from '@/lib/types';
import AddMemberForm from '@/components/add-member-form';
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function UnitPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAddMemberSheetOpen, setAddMemberSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [background, setBackground] = useState({ type: 'color', value: '#111827' }); // dark gray default

  const initialUnit = useMemo(() => initialUnits.find((u) => u.id === unitId), [unitId]);

  useEffect(() => {
    if (initialUnit) {
      setUnit(initialUnit);
      setMembers(initialUnit.members);
      if (initialUnit.cardImageUrl) {
        setBackground({ type: 'image', value: initialUnit.cardImageUrl });
      } else if (initialUnit.cardColor) {
        // This is tricky because tailwind classes are not hex values.
        // For now, we will just use a default.
        // A better approach would be to store hex values in the data.
      }
      setIsLoading(false);
    } else {
      router.push('/');
    }
  }, [initialUnit, router]);

  const handleAddMember = (newMemberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: new Date().getTime().toString(), // simple unique id
    };
    setMembers(prevMembers => [...prevMembers, newMember]);
    setAddMemberSheetOpen(false);
    toast({
      title: "Membro adicionado!",
      description: `${newMember.name} foi adicionado à unidade.`,
    })
  };

  const handleDeleteMember = (memberId: string) => {
    const memberName = members.find(m => m.id === memberId)?.name;
    setMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
    toast({
      title: "Membro removido.",
      description: `O membro ${memberName} foi removido da unidade.`,
      variant: "destructive"
    })
  };

  const pageStyle: React.CSSProperties =
    background.type === 'image'
      ? { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: background.value };


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-10 w-36" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={pageStyle}>
      <div className="container mx-auto p-4 sm:p-8 bg-background/80 backdrop-blur-sm min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/" aria-label="Voltar para o início">
                <ArrowLeft />
              </Link>
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">
              Unidade {unit?.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={isSettingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Configurações da Unidade</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="bg-color">Cor de Fundo</Label>
                        <Input 
                            id="bg-color"
                            type="color" 
                            value={background.type === 'color' ? background.value : '#000000'}
                            onChange={(e) => setBackground({type: 'color', value: e.target.value})}
                            className="p-1 h-10"
                        />
                    </div>
                    <div>
                        <Label htmlFor="bg-image">URL da Imagem de Fundo</Label>
                        <Input 
                            id="bg-image"
                            type="text" 
                            placeholder="https://exemplo.com/imagem.png"
                            value={background.type === 'image' ? background.value : ''}
                            onChange={(e) => setBackground({type: 'image', value: e.target.value})}
                        />
                    </div>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet open={isAddMemberSheetOpen} onOpenChange={setAddMemberSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Adicionar Novo Membro</SheetTitle>
                </SheetHeader>
                <AddMemberForm onMemberAdd={handleAddMember} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <Card key={member.id} className="relative group flex flex-col bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground flex-grow">
                  <p><strong className="text-foreground">Idade:</strong> {member.age}</p>
                  <p><strong className="text-foreground">Função:</strong> {member.role}</p>
                  <p><strong className="text-foreground">Classe:</strong> {member.className}</p>
                </CardContent>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" aria-label={`Remover ${member.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso irá remover permanentemente o membro {member.name} da unidade.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-card/50">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Nenhum membro encontrado</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">Comece adicionando um novo membro a esta unidade clicando no botão "Adicionar Membro".</p>
          </div>
        )}
      </div>
    </main>
  );
}
