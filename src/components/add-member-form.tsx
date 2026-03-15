"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Member } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClassByAge } from "@/lib/utils";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  age: z.coerce.number({invalid_type_error: "Idade deve ser um número."}).int().positive({ message: "A idade deve ser um número positivo." }),
  role: z.string().min(2, { message: "A função deve ter pelo menos 2 caracteres." }),
  className: z.string().min(2, { message: "A classe deve ter pelo menos 2 caracteres." }),
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
});

type AddMemberFormProps = {
  onMemberAdd: (member: Omit<Member, 'id' | 'score' | 'ranking'>) => void;
  roles?: string[];
  classes?: string[];
};

export default function AddMemberForm({ onMemberAdd, roles = [], classes = [] }: AddMemberFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: '' as any,
      role: "",
      className: "",
      avatarUrl: "",
    },
  });
  
  const age = form.watch("age");

  useEffect(() => {
    if (age) {
      const suggestedClass = getClassByAge(Number(age));
      if (suggestedClass && classes.includes(suggestedClass)) {
        form.setValue("className", suggestedClass);
      }
    }
  }, [age, classes, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onMemberAdd(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1 mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idade</FormLabel>
              <FormControl>
                <Input type="number" placeholder="12" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função/Cargo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                  {roles.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                      Nenhuma função configurada
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma classe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                  {classes.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                      Nenhuma classe configurada
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Foto de Perfil (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/foto.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Salvar Membro
        </Button>
      </form>
    </Form>
  );
}
