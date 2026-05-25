import type { Periodo } from '../types';

export function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatFecha(str: string): string {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

export function labelPeriodo(inicio: string, fin: string): string {
  return `${formatFecha(inicio)} — ${formatFecha(fin)}`;
}

export function getPeriodoDeFecha(fechaStr: string): Periodo {
  const [y, m, d] = fechaStr.split('-').map(Number);
  let iY: number, iM: number, fY: number, fM: number;
  if (d >= 16) {
    iY = y; iM = m;
    fM = m === 12 ? 1 : m + 1;
    fY = m === 12 ? y + 1 : y;
  } else {
    iM = m === 1 ? 12 : m - 1;
    iY = m === 1 ? y - 1 : y;
    fY = y; fM = m;
  }
  return {
    inicio: `${iY}-${String(iM).padStart(2, '0')}-16`,
    fin:    `${fY}-${String(fM).padStart(2, '0')}-15`,
  };
}

export function getMondayOfWeek(fechaStr: string): string {
  const d   = new Date(fechaStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function diasEnPeriodo(inicio: string, fin: string): number {
  const d1 = new Date(inicio + 'T00:00:00');
  const d2 = new Date(fin    + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
}
