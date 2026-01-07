
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, User, Users, Settings, Shield, Mountain, Gem, BookOpen, Star, type LucideIcon, FilePlus2, GripVertical, Edit, Download, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Unit, Member, ScoreInfo, ScoringCriterion } from '@/lib/types';
import AddMemberForm from '@/components/add-member-form';
import EditMemberForm from '@/components/edit-member-form';
import GenerateScoreForm from '@/components/generate-score-form';
import ScoreReportCard from '@/components/score-report-card';
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getRankForScore, Rank } from '@/lib/ranks';


const iconMap: { [key: string]: LucideIcon } = {
  Shield,
  Mountain,
  Gem,
  BookOpen,
};
const iconOptions = Object.keys(iconMap);

export default function UnitPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const unitId = params.unitId as string;
  const firestore = useFirestore();

  const unitRef = useMemoFirebase(() => {
    if (!firestore || !unitId) return null;
    return doc(firestore, 'units', unitId);
  }, [firestore, unitId]);

  const { data: unit, isLoading: isUnitLoading } = useDoc<Unit>(unitRef);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [members, setMembers] = useState<(Member & { patent: Rank })[]>([]);
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriterion[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreInfo[]>([]);
  const [isAddMemberSheetOpen, setAddMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<(Member & { patent: Rank }) | null>(null);
  const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [isGenerateScoreDialogOpen, setGenerateScoreDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScoreInfo | null>(null);
  const [background, setBackground] = useState({ type: 'color', value: '' });
  const [localUnitName, setLocalUnitName] = useState("");
  const [localUnitIcon, setLocalUnitIcon] = useState("Shield");
  const [localUnitPassword, setLocalUnitPassword] = useState("");

  useEffect(() => {
    if (unit) {
      if (!unit.password) {
        setIsAuthenticated(true);
      }
      setMembers(unit.members?.map(m => ({ 
        ...m, 
        score: m.score ?? 0,
        patent: getRankForScore(m.score ?? 0),
      })) || []);
      setScoringCriteria(unit.scoringCriteria || []);
      const history = (unit.scoreHistory || []).map(sh => {
        const date = sh.date && (sh.date as any).toDate ? (sh.date as any).toDate() : new Date(sh.date);
        return { ...sh, date };
      });
      setScoreHistory(history);
      setLocalUnitName(unit.name);
      setLocalUnitIcon(unit.icon || "Shield");
      setLocalUnitPassword(unit.password || '');
      if (unit.cardImageUrl) {
        setBackground({ type: 'image', value: unit.cardImageUrl });
      } else if (unit.cardColor) {
        setBackground({ type: 'color', value: unit.cardColor });
      } else {
        setBackground({ type: 'color', value: '' });
      }
    }
  }, [unit]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unit && passwordInput === unit.password) {
      setIsAuthenticated(true);
      toast({ title: "Acesso concedido!" });
    } else {
      toast({ variant: 'destructive', title: "Senha incorreta!" });
    }
  };

  const handleSaveChanges = () => {
    if (!unitRef || !unit) return;

    const updatedUnitData: Partial<Unit> = {
      name: localUnitName,
      icon: localUnitIcon,
      password: localUnitPassword,
      cardImageUrl: background.type === 'image' ? background.value : "",
      cardColor: background.type === 'color' ? background.value : "",
      scoringCriteria,
    };
    
    setDocumentNonBlocking(unitRef, updatedUnitData, { merge: true });

    toast({
      title: "Configurações salvas!",
      description: "As configurações da unidade foram atualizadas.",
    });
    setSettingsSheetOpen(false);
  };

  const updateMembersWithRank = (membersToUpdate: Member[]): (Member & { patent: Rank })[] => {
    return membersToUpdate.map(m => ({
      ...m,
      patent: getRankForScore(m.score ?? 0)
    }));
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'score' | 'ranking'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: new Date().getTime().toString(), // simple unique id
      score: 0,
      ranking: 0,
    };
    const updatedMembers = updateMembersWithRank([...members, newMember]);
    setMembers(updatedMembers);
    if (unitRef) {
      setDocumentNonBlocking(unitRef, { members: updatedMembers.map(({patent, ...m}) => m) }, { merge: true });
    }
    setAddMemberSheetOpen(false);
    toast({
      title: "Membro adicionado!",
      description: `${newMember.name} foi adicionado à unidade.`,
    })
  };
  
  const handleUpdateMember = (updatedMemberData: Member) => {
    const updatedMembers = updateMembersWithRank(members.map(member => member.id === updatedMemberData.id ? {...member, ...updatedMemberData} : member));
    setMembers(updatedMembers);
    if (unitRef) {
      setDocumentNonBlocking(unitRef, { members: updatedMembers.map(({patent, ...m}) => m) }, { merge: true });
    }
    setEditingMember(null);
    toast({
      title: "Membro atualizado!",
      description: `As informações de ${updatedMemberData.name} foram atualizadas.`,
    });
  };

  const handleDeleteMember = (memberId: string) => {
    const memberName = members.find(m => m.id === memberId)?.name;
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updateMembersWithRank(updatedMembers));
    if (unitRef) {
      setDocumentNonBlocking(unitRef, { members: updatedMembers.map(({patent, ...m}) => m) }, { merge: true });
    }
    setEditingMember(null);
    toast({
      title: "Membro removido.",
      description: `O membro ${memberName} foi removido da unidade.`,
      variant: "destructive"
    })
  };

  const handleOpenScoreDialog = (report: ScoreInfo | null) => {
    setEditingReport(report);
    setGenerateScoreDialogOpen(true);
  };

  const handleScoresCalculated = (scoreInfo: ScoreInfo) => {
    let updatedMembers = [...members];
    let updatedScoreHistory = [...scoreHistory];

    if (editingReport) {
      const originalReport = scoreHistory.find(r => r.id === editingReport.id);

      if (originalReport) {
        updatedMembers = members.map(member => {
          const originalMemberScore = originalReport.memberScores[member.id];
          if (originalMemberScore) {
            return { ...member, score: (member.score || 0) - originalMemberScore.points };
          }
          return member;
        });
      }

      updatedMembers = updatedMembers.map(member => {
        const newMemberScore = scoreInfo.memberScores[member.id];
        if (newMemberScore) {
          return { ...member, score: (member.score || 0) + newMemberScore.points };
        }
        return member;
      });

      updatedScoreHistory = scoreHistory.map(r => r.id === scoreInfo.id ? scoreInfo : r);
      
      toast({
        title: "Relatório atualizado!",
        description: `O relatório de ${scoreInfo.date.toLocaleDateString()} foi atualizado.`,
      });

    } else {
      updatedMembers = members.map(member => {
        const memberScoreUpdate = scoreInfo.memberScores[member.id];
        if (memberScoreUpdate) {
          const newScore = (member.score || 0) + memberScoreUpdate.points;
          return { ...member, score: newScore };
        }
        return member;
      });

      updatedScoreHistory = [scoreInfo, ...scoreHistory];

      toast({
        title: "Pontuações atualizadas!",
        description: `As pontuações para ${scoreInfo.date.toLocaleDateString()} foram adicionadas.`,
      });
    }
    
    const finalMembers = updateMembersWithRank(updatedMembers);
    setMembers(finalMembers);
    setScoreHistory(updatedScoreHistory);

    if (unitRef) {
      setDocumentNonBlocking(unitRef, { members: finalMembers.map(({patent, ...m}) => m), scoreHistory: updatedScoreHistory }, { merge: true });
    }

    setGenerateScoreDialogOpen(false);
    setEditingReport(null);
  }

  const handleUpdateCriterion = (index: number, field: 'label' | 'points', value: string | number) => {
    const newCriteria = [...scoringCriteria];
    if (field === 'points' && typeof value === 'string') {
        newCriteria[index][field] = parseInt(value, 10) || 0;
    } else {
        newCriteria[index][field] = value as any;
    }
    setScoringCriteria(newCriteria);
  };

  const handleAddCriterion = () => {
    const newId = `custom-${new Date().getTime()}`;
    setScoringCriteria([...scoringCriteria, { id: newId, label: 'Novo item', points: 1 }]);
  };

  const handleDeleteCriterion = (index: number) => {
    const newCriteria = scoringCriteria.filter((_, i) => i !== index);
    setScoringCriteria(newCriteria);
  };

   const handleDeleteReport = (reportId: string) => {
    const reportToDelete = scoreHistory.find(r => r.id === reportId);
    if (!reportToDelete) return;

    let updatedMembers = members.map(member => {
      const memberScoreUpdate = reportToDelete.memberScores[member.id];
      if (memberScoreUpdate) {
        const newScore = (member.score || 0) - memberScoreUpdate.points;
        return { ...member, score: newScore };
      }
      return member;
    });

    const updatedScoreHistory = scoreHistory.filter(r => r.id !== reportId);
    
    const finalMembers = updateMembersWithRank(updatedMembers);
    setMembers(finalMembers);
    setScoreHistory(updatedScoreHistory);

    if (unitRef) {
      setDocumentNonBlocking(unitRef, { members: finalMembers.map(({patent, ...m}) => m), scoreHistory: updatedScoreHistory }, { merge: true });
    }
    const reportDate = reportToDelete.date instanceof Date ? reportToDelete.date : (reportToDelete.date as any).toDate();

    toast({
      title: "Relatório Excluído!",
      description: `O relatório de ${reportDate.toLocaleDateString()} foi excluído.`,
      variant: "destructive"
    });
  };

  const handleExportToExcel = () => {
    const rankingData = members
        .sort((a, b) => b.score - a.score)
        .map((member, index) => ({
            'Ranking': index + 1,
            'Nome': member.name,
            'Pontuação Total': member.score,
            'Patente': member.patent.name,
            'Classe': member.className,
            'Função': member.role,
            'Idade': member.age,
        }));
    const rankingWorksheet = XLSX.utils.json_to_sheet(rankingData);
    
    const historyData: any[] = [];
    scoreHistory.forEach(report => {
        const date = report.date instanceof Date ? report.date.toLocaleDateString('pt-BR') : new Date(report.date).toLocaleDateString('pt-BR');
        Object.entries(report.memberScores).forEach(([memberId, scoreDetails]) => {
            const member = members.find(m => m.id === memberId);
            if (member) {
                const row: any = {
                    'Data': date,
                    'Membro': member.name,
                };
                scoringCriteria.forEach(criterion => {
                    row[criterion.label] = scoreDetails[criterion.id] ? criterion.points : 0;
                });
                row['Observação'] = scoreDetails.observation || '';
                row['Total do Dia'] = scoreDetails.points;
                historyData.push(row);
            }
        });
    });
    const historyWorksheet = XLSX.utils.json_to_sheet(historyData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, rankingWorksheet, 'Ranking Geral');
    XLSX.utils.book_append_sheet(workbook, historyWorksheet, 'Histórico de Pontuação');

    XLSX.writeFile(workbook, `Relatorio_${unit?.name.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);

    toast({
        title: "Exportação Concluída",
        description: "O arquivo Excel foi baixado.",
    });
  };

  const pageStyle: React.CSSProperties =
    background.type === 'image' && background.value
      ? { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
      : { backgroundColor: 'transparent' };


  if (isUnitLoading) {
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

  if (!unit) {
    return (
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive">Unidade não encontrada</h1>
            <p className="text-lg text-muted-foreground mt-2">A unidade que você está procurando não existe.</p>
            <Button asChild className="mt-6">
              <Link href="/">Voltar para o início</Link>
            </Button>
          </div>
        </main>
      );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background/80 backdrop-blur-sm" style={pageStyle}>
        <div className="fixed inset-0 bg-cover bg-center" style={background.type === 'image' && background.value ? {backgroundImage: `url(${background.value})`} : {backgroundColor: background.value || 'transparent'}}></div>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm"></div>
        <div className="container relative mx-auto p-4 sm:p-8 bg-card/90 backdrop-blur-sm rounded-lg max-w-md border">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/" aria-label="Voltar para o início">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Acesso à Unidade</h1>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Unidade "{unit?.name}" é protegida por senha</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite a senha"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">Entrar</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={pageStyle}>
        <div className="fixed inset-0 bg-cover bg-center" style={background.type === 'image' && background.value ? {backgroundImage: `url(${background.value})`} : {backgroundColor: background.value || 'transparent'}}></div>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="container relative mx-auto p-4 sm:p-8 min-h-screen">
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
              <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle>Configurações da Unidade</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4 overflow-y-auto pr-6 flex-grow">
                    <div>
                        <Label htmlFor="unit-name">Nome da Unidade</Label>
                        <Input
                            id="unit-name"
                            type="text"
                            placeholder="Nome da unidade"
                            value={localUnitName}
                            onChange={(e) => setLocalUnitName(e.target.value)}
                        />
                    </div>
                     <div>
                        <Label htmlFor="unit-icon">Ícone da Unidade</Label>
                        <Select value={localUnitIcon} onValueChange={setLocalUnitIcon}>
                            <SelectTrigger id="unit-icon">
                                <SelectValue placeholder="Selecione um ícone" />
                            </SelectTrigger>
                            <SelectContent>
                                {iconOptions.map(iconName => {
                                    const Icon = iconMap[iconName];
                                    return (
                                        <SelectItem key={iconName} value={iconName}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5" />
                                                <span>{iconName}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="unit-password">Senha da Unidade</Label>
                        <Input
                            id="unit-password"
                            type="text"
                            placeholder="Deixe em branco para remover a senha"
                            value={localUnitPassword}
                            onChange={(e) => setLocalUnitPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="bg-color">Cor de Fundo do Card</Label>
                        <Input 
                            id="bg-color"
                            type="color" 
                            value={background.type === 'color' ? background.value : '#000000'}
                            onChange={(e) => setBackground({type: 'color', value: e.target.value})}
                            className="p-1 h-10"
                        />
                    </div>
                    <div>
                        <Label htmlFor="bg-image">URL da Imagem de Fundo do Card</Label>
                        <Input 
                            id="bg-image"
                            type="text" 
                            placeholder="https://exemplo.com/imagem.png"
                            value={background.type === 'image' ? background.value : ''}
                            onChange={(e) => setBackground({type: 'image', value: e.target.value})}
                        />
                         <p className="text-xs text-muted-foreground mt-1">Deixe em branco para usar a cor de fundo.</p>
                    </div>
                    <div className="space-y-4">
                      <Label>Itens de Pontuação</Label>
                      <div className="space-y-3">
                        {scoringCriteria.map((criterion, index) => (
                          <div key={criterion.id} className="flex items-center gap-2 p-2 border rounded-lg bg-card/50">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <Input
                              type="text"
                              value={criterion.label}
                              onChange={(e) => handleUpdateCriterion(index, 'label', e.target.value)}
                              className="flex-grow"
                            />
                            <Input
                              type="number"
                              value={criterion.points}
                              onChange={(e) => handleUpdateCriterion(index, 'points', e.target.value)}
                              className="w-16"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCriterion(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={handleAddCriterion} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                      </Button>
                    </div>
                </div>
                 <div className="mt-auto pt-4">
                    <Button onClick={handleSaveChanges} className="w-full">Salvar Alterações</Button>
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
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => {
                  const PatentIcon = member.patent?.Icon || Award;
                  return (
                    <Card key={member.id} className="relative group flex flex-col bg-card/80 backdrop-blur-sm border">
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
                        {member.patent && (
                        <div className="flex items-center pt-2 gap-2">
                            <PatentIcon className="h-5 w-5 text-primary" />
                            <p><strong className="text-foreground">Patente:</strong> {member.patent.name}</p>
                        </div>
                        )}
                        {member.score !== undefined && (
                        <div className="flex items-center pt-2 gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <p><strong className="text-foreground">Pontuação Total:</strong> {member.score}</p>
                        </div>
                        )}
                    </CardContent>
                    <div className="absolute top-4 right-4 opacity-100 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        <Button variant="outline" size="icon" onClick={() => setEditingMember(member)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar {member.name}</span>
                        </Button>
                    </div>
                    </Card>
                )
              })}
            </div>
            <div className="mt-8 flex justify-center">
                <Dialog open={isGenerateScoreDialogOpen} onOpenChange={(isOpen) => {
                  setGenerateScoreDialogOpen(isOpen);
                  if (!isOpen) setEditingReport(null);
                }}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="lg" disabled={!unit} onClick={() => handleOpenScoreDialog(null)}>
                            <FilePlus2 className="mr-2 h-5 w-5" />
                            Lançar Pontuação
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingReport ? 'Editar Lançamento' : 'Lançar nova pontuação'}</DialogTitle>
                        </DialogHeader>
                        {unit && <GenerateScoreForm members={members} scoringCriteria={unit.scoringCriteria} onScoresCalculated={handleScoresCalculated} existingReport={editingReport} />}
                    </DialogContent>
                </Dialog>
            </div>
             {scoreHistory.length > 0 && (
              <div className="mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-center">Histórico de Pontuações</h2>
                  <Button variant="outline" onClick={handleExportToExcel} disabled={!unit}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar para Excel
                  </Button>
                </div>
                <div className="space-y-6">
                  {scoreHistory.map((report) => (
                      <ScoreReportCard 
                        key={report.id} 
                        report={report} 
                        members={members} 
                        scoringCriteria={scoringCriteria}
                        onDeleteReport={handleDeleteReport}
                        onEditReport={() => handleOpenScoreDialog(report)}
                      />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-card/50">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Nenhum membro encontrado</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">Comece adicionando um novo membro a esta unidade clicando no botão "Adicionar Membro".</p>
          </div>
        )}
      </div>
      
      <Sheet open={!!editingMember} onOpenChange={(isOpen) => !isOpen && setEditingMember(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Editar Membro</SheetTitle>
          </SheetHeader>
          {editingMember && (
            <EditMemberForm
              member={editingMember}
              onMemberUpdate={handleUpdateMember}
              onMemberDelete={() => handleDeleteMember(editingMember.id)}
            />
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
