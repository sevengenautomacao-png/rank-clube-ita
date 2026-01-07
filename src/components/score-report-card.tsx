"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { ScoreInfo, Member, ScoringCriterion } from '@/lib/types';
import { cn } from '@/lib/utils';


interface ScoreReportCardProps {
    report: ScoreInfo;
    members: Member[];
    scoringCriteria: ScoringCriterion[];
}

export default function ScoreReportCard({ report, members, scoringCriteria }: ScoreReportCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getMemberName = (memberId: string) => {
        return members.find(m => m.id === memberId)?.name || 'Membro desconhecido';
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl">
                            Relatório de {format(report.date, "PPP", { locale: ptBR })}
                        </CardTitle>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {isOpen ? <ChevronUp /> : <ChevronDown />}
                            <span className="sr-only">Toggle details</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-0">
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
