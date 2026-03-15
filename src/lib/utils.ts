import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getClassByAge(age: number): string {
  if (age <= 10) return "Amigo";
  if (age === 11) return "Companheiro";
  if (age === 12) return "Pesquisador";
  if (age === 13) return "Pioneiro";
  if (age === 14) return "Excursionista";
  if (age === 15) return "Guia";
  return "Agrupadas";
}
