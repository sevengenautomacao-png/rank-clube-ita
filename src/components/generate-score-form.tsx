
"use client"

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import type { Member, ScoreInfo, ScoringCriterion } from "@/lib/types";

const generateFormSchema = (scoringCriteria: ScoringCriterion[]) => {
  const membersSchema = z.record(z.object({
    ...scoringCriteria.reduce((acc, criterion) => {
      acc[criterion.id] = z.boolean().default(false);
      return acc;
    }, {} as Record<string, z.ZodBoolean>),
    observation: z.string().optional(),
  }));

  return z.object({
    date: z.date({
      required_error: "A data do evento é obrigatória.",
    }),
    members: membersSchema,
  });
};

type GenerateScoreFormProps = {
  members: Member[];
  scoringCriteria: ScoringCriterion[];
  onScoresCalculated: (scoreInfo: ScoreInfo) => void;
  existingReport?: ScoreInfo | null;
};

export default function GenerateScoreForm({ members, scoringCriteria, onScoresCalculated, existingReport }: GenerateScoreFormProps) {
  const formSchema = generateFormSchema(scoringCriteria);
  type FormSchemaType = z.infer<typeof formSchema>;

  const getDefaultValues = (report: ScoreInfo | null | undefined): FormSchemaType => {
    if (report) {
      return {
        date: report.date,
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
      date: new Date(),
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

  useEffect(() => {
    form.reset(getDefaultValues(existingReport));
  }, [existingReport, form]);

  function onSubmit(values: FormSchemaType) {
    const memberScores: ScoreInfo['memberScores'] = {};
    
    for (const memberId in values.members) {
        const memberData = values.members[memberId];
        let totalPoints = 0;
        const scoreDetails: Record<string, boolean | number | string> = {};

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
    onScoresCalculated({ id: reportId, date: values.date, memberScores });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 mt-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Evento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-4">
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

        <Button type="submit" className="w-full">
          Salvar Pontuação
        </Button>
      </form>
    </Form>
  );
}
