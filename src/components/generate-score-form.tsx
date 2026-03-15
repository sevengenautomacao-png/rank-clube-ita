"use client"

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, User, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import type { Member, ScoreInfo, ScoringCriterion, ClubEvent } from "@/lib/types";

const generateFormSchema = (scoringCriteria: ScoringCriterion[]) => {
  const membersSchema = z.record(z.object({
    ...scoringCriteria.reduce((acc, criterion) => {
      acc[criterion.id] = z.boolean().default(false);
      return acc;
    }, {} as Record<string, z.ZodDefault<z.ZodBoolean>>),
    observation: z.string().optional(),
  }).catchall(z.any()));

  return z.object({
    event_id: z.string({
      required_error: "A seleção de um evento válido é obrigatória.",
    }),
    members: membersSchema,
  });
};

type GenerateScoreFormProps = {
  members: Member[];
  scoringCriteria: ScoringCriterion[];
  events: ClubEvent[];
  onScoresCalculated: (scoreInfo: ScoreInfo) => void;
  existingReport?: ScoreInfo | null;
};

export default function GenerateScoreForm({ members, scoringCriteria, events, onScoresCalculated, existingReport }: GenerateScoreFormProps) {
  const formSchema = generateFormSchema(scoringCriteria);
  type FormSchemaType = z.infer<typeof formSchema>;

  const getDefaultValues = (report: ScoreInfo | null | undefined): FormSchemaType => {
    if (report) {
      return {
        event_id: report.event_id || "",
        members: members.reduce((acc, member) => {
          const memberScore = report.memberScores[member.id];
          acc[member.id] = {
            ...scoringCriteria.reduce((critAcc, criterion) => {
              critAcc[criterion.id] = memberScore ? !!memberScore[criterion.id] : false;
              return critAcc;
            }, {} as Record<string, boolean>),
            observation: memberScore?.observation || "",
          };
          return acc;
        }, {} as FormSchemaType['members']),
      };
    }

    return {
      event_id: "",
      members: members.reduce((acc, member) => {
        acc[member.id] = {
          ...scoringCriteria.reduce((critAcc, criterion) => {
            critAcc[criterion.id] = criterion.id === 'present'; // Default 'presente' to true
            return critAcc;
          }, {} as Record<string, boolean>),
          observation: "",
        };
        return acc;
      }, {} as FormSchemaType['members']),
    };
  };
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(existingReport),
  });

  const selectedEventId = form.watch("event_id");

  // Verifica prazo de 5 dias
  const isPastDeadline = useMemo(() => {
     let targetDate: Date | null = null;
     
     if (selectedEventId) {
       const ev = events.find(e => e.id === selectedEventId);
       if (ev) targetDate = new Date(ev.date + "T" + (ev.time || "00:00"));
     } else if (existingReport && !existingReport.event_id) {
       // Relatório legado sem evento
       targetDate = new Date(existingReport.date);
     }
     
     if (targetDate) {
         // Data atual no backend vs Data do evento
         const diff = differenceInDays(new Date(), targetDate);
         return diff > 5;
     }

     return false;
  }, [selectedEventId, events, existingReport]);

  useEffect(() => {
    form.reset(getDefaultValues(existingReport));
  }, [existingReport, form, events]);

  function onSubmit(values: FormSchemaType) {
    if (isPastDeadline) return; // Segurança dupla

    const memberScores: ScoreInfo['memberScores'] = {};
    
    for (const memberId in values.members) {
        const memberData = values.members[memberId];
        let totalPoints = 0;
        const scoreDetails: Record<string, boolean | number | string | undefined> = {};

        scoringCriteria.forEach(criterion => {
            const isChecked = memberData[criterion.id];
            scoreDetails[criterion.id] = isChecked;
            if (isChecked) {
                totalPoints += criterion.points;
            }
        });
        
        memberScores[memberId] = { 
            ...scoreDetails, 
            points: totalPoints,
            observation: memberData.observation
        };
    }
    
    const reportId = existingReport ? existingReport.id : new Date().getTime().toString();
    const eventDetails = events.find(e => e.id === values.event_id);
    const dateUsed = eventDetails ? new Date(eventDetails.date + "T" + (eventDetails.time || "00:00")) : (existingReport?.date || new Date());
    
    onScoresCalculated({ 
        id: reportId, 
        event_id: values.event_id || undefined,
        date: dateUsed, 
        memberScores 
    });
  }

  // Filtrar eventos disponíveis para o select: apenas eventos Globais (não unitários) 
  // Na criação, só mostra os que estão no prazo (<= 5 dias).
  // Na edição, mostra o evento atual mesmo que esteja vencido, para podermos exibir o erro de bloqueio.
  const availableEvents = useMemo(() => {
     return events
       .filter(e => e.type !== 'unit')
       .filter(e => {
          if (existingReport && existingReport.event_id === e.id) return true; // Sempre inclui o evento atual em caso de edição
          
          const evDate = new Date(e.date + "T" + (e.time || "00:00"));
          return differenceInDays(new Date(), evDate) <= 5;
       })
       .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, existingReport]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 mt-4">
        
        {isPastDeadline && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
               <AlertCircle className="h-4 w-4" />
               <p>O prazo de 5 dias para modificar pontuações deste evento expirou. Nenhuma alteração pode ser feita.</p>
            </div>
        )}

        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Evento do Clube</FormLabel>
                <Select disabled={isPastDeadline} onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Selecione o Evento Global" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableEvents.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground w-full text-center">Nenhum evento recente encontrado.</div>
                    )}
                    {availableEvents.map(event => {
                       const evDate = new Date(event.date + "T" + (event.time || "00:00"));
                       return (
                        <SelectItem key={event.id} value={event.id}>
                            <div className="flex flex-col text-left">
                                <span className="font-medium">{event.title}</span>
                                <span className="text-xs text-muted-foreground">
                                   {format(evDate, "PPP", { locale: ptBR })}
                                </span>
                            </div>
                        </SelectItem>
                       )
                    })}
                  </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <div className={cn("space-y-4 max-h-[40vh] overflow-y-auto pr-4", isPastDeadline && "opacity-60 pointer-events-none")}>
        {members.map(member => (
          <FormField
            key={member.id}
            control={form.control}
            name={`members.${member.id}`}
            render={({ field }) => (
              <FormItem>
                 <Card>
                    <CardHeader className="p-4">
                        <div className="flex items-center gap-4">
                             <div className="bg-primary/20 p-3 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                             </div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {scoringCriteria.map(criterion => (
                                <FormField
                                    key={criterion.id}
                                    control={form.control}
                                    name={`members.${member.id}.${criterion.id}`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{criterion.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <FormField
                            control={form.control}
                            name={`members.${member.id}.observation`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Observação</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={`Adicione uma observação para ${member.name}...`}
                                        className="resize-none"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
              </FormItem>
            )}
          />
        ))}
        </div>

        <Button type="submit" disabled={isPastDeadline} className="w-full">
          {existingReport ? 'Atualizar Pontuação' : 'Salvar Pontuação'}
        </Button>
      </form>
    </Form>
  );
}
