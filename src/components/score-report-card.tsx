
"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Edit, Trash2 } from 'lucide-react';
import type { ScoreInfo, Member, ScoringCriterion } from '@/lib/types';
import { cn } from '@/lib/utils';
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


interface ScoreReportCardProps {
    report: ScoreInfo;
    members: Member[];
    scoringCriteria: ScoringCriterion[];
    onDeleteReport: (reportId: string) => void;
}

export default function ScoreReportCard({ report, members, scoringCriteria, onDeleteReport }: ScoreReportCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getMemberName = (memberId: string) => {
        return members.find(m => m.id === memberId)?.name || 'Membro desconhecido';
    };

    const getReportDate = () => {
        if (report.date instanceof Date) {
            return report.date;
        }
        if (report.date && typeof (report.date as any).toDate === 'function') {
            return (report.date as any).toDate();
        }
        return new Date(report.date); 
    }

    const displayDate = getReportDate();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl">
                            Relatório de {format(displayDate, "PPP", { locale: ptBR })}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); alert('Editar relatório em breve!'); }}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar Relatório</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Excluir Relatório</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso irá excluir permanentemente o relatório de {format(displayDate, "dd/MM/yyyy")} e reverterá as pontuações aplicadas aos membros.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteReport(report.id)}>
                                        Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isOpen ? <ChevronUp /> : <ChevronDown />}
                                <span className="sr-only">Toggle details</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-4 pt-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Membro</TableHead>
                                    {scoringCriteria.map(c => (
                                        <TableHead key={c.id} className="text-center">{c.label}</TableHead>
                                    ))}
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(report.memberScores).map(([memberId, scores]) => (
                                    <>
                                        <TableRow key={memberId}>
                                            <TableCell className="font-medium">{getMemberName(memberId)}</TableCell>
                                            {scoringCriteria.map(c => {
                                                const wasScored = scores[c.id];
                                                const points = wasScored ? c.points : 0;
                                                return (
                                                    <TableCell key={c.id} className={cn(
                                                        "text-center",
                                                        points > 0 && "text-green-500",
                                                        points < 0 && "text-red-500",
                                                    )}>
                                                        {points !== 0 ? points : '-'}
                                                    </TableCell>
                                                )
                                            })}
                                            <TableCell className="text-right font-bold">{scores.points}</TableCell>
                                        </TableRow>
                                        {scores.observation && (
                                            <TableRow>
                                                <TableCell colSpan={scoringCriteria.length + 2} className="py-2 px-4 text-sm text-muted-foreground bg-muted/20">
                                                    <strong>Obs:</strong> {scores.observation}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
