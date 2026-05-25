import type { Config, Registro } from '../types';
import { RMV } from '../constants';
import { esDomingo, esFeriado } from './holidays';

export function remuneracionComputable(cfg: Config): number {
  return (cfg.sueldo || 0) + (cfg.aplicaAF ? (cfg.valorAF || RMV * 0.1) : 0);
}

export function valorHora(cfg: Config): number {
  return remuneracionComputable(cfg) / 30 / 8;
}

export function getSinComp(r: Registro): boolean {
  return r.sinCompensacion === true ||
    (r.sinCompensacion === undefined && (esDomingo(r.fecha) || esFeriado(r.fecha)));
}

export function getTipoLabel(r: Registro): string {
  const sinComp = getSinComp(r);
  if (sinComp && esFeriado(r.fecha)) return 'Feriado\xd72';
  if (sinComp && esDomingo(r.fecha)) return 'Dom\xd72';
  if (sinComp)                       return 'Desc\xd72';
  if (esFeriado(r.fecha))            return 'FeriadoComp';
  if (esDomingo(r.fecha))            return 'DomComp';
  return 'Regular';
}
