"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Member } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  age: z.coerce.number({invalid_type_error: "Idade deve ser um número."}).int().positive({ message: "A idade deve ser um número positivo." }),
  role: z.string().min(2, { message: "A função deve ter pelo menos 2 caracteres." }),
  className: z.string().min(2, { message: "A classe deve ter pelo menos 2 caracteres." }),
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
});

type EditMemberFormProps = {
  member: Member;
  onMemberUpdate: (member: Member) => void;
  onMemberDelete: () => void;
};

export default function EditMemberForm({ member, onMemberUpdate, onMemberDelete }: EditMemberFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member.name,
      age: member.age,
      role: member.role,
      className: member.className,
      avatarUrl: member.avatarUrl || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onMemberUpdate({ ...member, ...values });
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
              <FormControl>
                <Input placeholder="Capitão, Conselheiro..." {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Amigo, Guia..." {...field} />
              </FormControl>
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
        <div className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">
                Salvar Alterações
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Membro
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
                  <AlertDialogAction onClick={onMemberDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
