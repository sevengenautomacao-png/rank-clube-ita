"use client"

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

import { cn } from "@/lib/utils";
import type { Member, ScoreInfo } from "@/lib/types";

const formSchema = z.object({
  date: z.date({
    required_error: "A data do evento é obrigatória.",
  }),
  members: z.record(z.object({
    present: z.boolean().default(false),
    uniform: z.boolean().default(false),
    bible: z.boolean().default(false),
    lesson: z.boolean().default(false),
    lenco: z.boolean().default(false),
  })),
});

type GenerateScoreFormProps = {
  members: Member[];
  onScoresCalculated: (scoreInfo: ScoreInfo) => void;
};

const pointValues = {
  present: 5,
  uniform: 3,
  bible: 1,
  lesson: 1,
  lenco: 1,
};

export default function GenerateScoreForm({ members, onScoresCalculated }: GenerateScoreFormProps) {
  const defaultValues = {
    date: new Date(),
    members: members.reduce((acc, member) => {
      acc[member.id] = { present: true, uniform: false, bible: false, lesson: false, lenco: false };
      return acc;
    }, {} as z.infer<typeof formSchema>['members']),
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const memberScores: ScoreInfo['memberScores'] = {};
    
    for (const memberId in values.members) {
        const memberData = values.members[memberId];
        let points = 0;
        if (memberData.present) points += pointValues.present;
        if (memberData.uniform) points += pointValues.uniform;
        if (memberData.bible) points += pointValues.bible;
        if (memberData.lesson) points += pointValues.lesson;
        if (memberData.lenco) points += pointValues.lenco;

        memberScores[memberId] = { ...memberData, points };
    }

    onScoresCalculated({ date: values.date, memberScores });
    form.reset(defaultValues);
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
                        format(field.value, "PPP", { locale: ptBR })
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
                    <CardContent className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-5 gap-4">
                       <FormField
                          control={form.control}
                          name={`members.${member.id}.present`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Presente</FormLabel>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`members.${member.id}.uniform`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Uniforme</FormLabel>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`members.${member.id}.bible`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Bíblia</FormLabel>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`members.${member.id}.lesson`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Lição</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`members.${member.id}.lenco`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Lenço</FormLabel>
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
