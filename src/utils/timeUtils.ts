import type { DeltaInfo } from '../types';

export function tiempoAMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minAHoraStr(m: number): string {
  if (m <= 0) return '0h 00m';
  const h   = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min.toString().padStart(2, '0')}m`;
}

export function minToTimeStr(m: number): string {
  const total = ((m % 1440) + 1440) % 1440;
  const h   = Math.floor(total / 60);
  const min = total % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

export function getDeltaInfo(trabajoMin: number | undefined): DeltaInfo {
  const delta    = (trabajoMin ?? 0) - 480;
  const absDelta = Math.abs(delta);
  return {
    deltaMin:    delta,
    deltaUI:     (delta >= 0 ? '+' : '−') + minAHoraStr(absDelta),
    deltaExport: (delta >= 0 ? '+' : '-') + minAHoraStr(absDelta),
    deltaColor:  delta > 0 ? 'var(--accent2)' : delta < 0 ? 'var(--accent3)' : 'var(--text-muted)',
  };
}
