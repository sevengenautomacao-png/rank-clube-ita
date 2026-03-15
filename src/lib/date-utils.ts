import { format, parse, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a date string (ISO or BR) or Date object to Brazilian format DD/MM/YYYY
 */
export function formatToBR(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    // Try parsing as BR format if ISO failed
    if (typeof date === 'string') {
      const parsedBR = parse(date, 'dd/MM/yyyy', new Date());
      if (isValid(parsedBR)) return date;
    }
    return '';
  }
  
  return format(dateObj, 'dd/MM/yyyy');
}

/**
 * Parses a Brazilian date string DD/MM/YYYY to ISO YYYY-MM-DD
 */
export function parseBRToISO(brDate: string): string {
  if (!brDate) return '';
  
  // If it's already ISO, return it
  if (/^\d{4}-\d{2}-\d{2}/.test(brDate)) {
    return brDate.split('T')[0];
  }
  
  try {
    const parsedDate = parse(brDate, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, 'yyyy-MM-dd');
    }
  } catch (e) {
    console.error('Error parsing BR date:', e);
  }
  
  return brDate;
}
