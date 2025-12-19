import { format as formatTz } from 'date-fns-tz';
import { pt } from 'date-fns/locale/pt';

export function formatMT(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0,00 MT';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0,00 MT';
  
  return new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue) + ' MT';
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-MZ').format(numValue);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  
  return formatTz(dateObj, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt });
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Data inválida';
  
  return formatTz(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: pt });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Hora inválida';
  
  return formatTz(dateObj, "HH:mm", { locale: pt });
}
