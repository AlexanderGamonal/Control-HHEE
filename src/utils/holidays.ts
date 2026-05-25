import { FERIADOS_FIJOS } from '../constants';

function pascua(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, mes - 1, dia);
}

function offsetDesdePascua(y: number, dias: number): string {
  const e0 = pascua(y);
  const d = new Date(e0);
  d.setDate(e0.getDate() + dias);
  return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function nombreFeriado(fechaStr: string): string | null {
  const d    = new Date(fechaStr + 'T00:00:00');
  const y    = d.getFullYear();
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  if (FERIADOS_FIJOS[mmdd]) return FERIADOS_FIJOS[mmdd];
  if (mmdd === offsetDesdePascua(y, -48)) return 'Lunes de Carnaval';
  if (mmdd === offsetDesdePascua(y, -47)) return 'Martes de Carnaval';
  if (mmdd === offsetDesdePascua(y, -3))  return 'Jueves Santo';
  if (mmdd === offsetDesdePascua(y, -2))  return 'Viernes Santo';
  return null;
}

export function esFeriado(fechaStr: string): boolean {
  return nombreFeriado(fechaStr) !== null;
}

export function esDomingo(fechaStr: string): boolean {
  return new Date(fechaStr + 'T00:00:00').getDay() === 0;
}
