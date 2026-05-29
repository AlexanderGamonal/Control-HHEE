import type { Registro, TarifaSueldo } from '../types';
import { esDomingo, esFeriado } from './holidays';

export function getTarifaParaPeriodo(historial: TarifaSueldo[], fechaFin: string): TarifaSueldo | null {
  const aplicables = historial
    .filter(t => t.fechaVigenciaDesde <= fechaFin)
    .sort((a, b) => b.fechaVigenciaDesde.localeCompare(a.fechaVigenciaDesde));
  return aplicables[0] ?? null;
}

export function valorHora(tarifa: TarifaSueldo): number {
  return (tarifa.montoSueldo + tarifa.montoAsignacionFamiliar) / 30 / 8;
}

export function getSinComp(r: Registro): boolean {
  if (r.tipoRegistro === 'descansoMedico' || r.tipoRegistro === 'vacaciones') return false;
  return r.sinCompensacion === true ||
    (r.sinCompensacion === undefined && (esDomingo(r.fecha) || esFeriado(r.fecha)));
}

export function getTipoLabel(r: Registro): string {
  if (r.tipoRegistro === 'descansoMedico') return 'Méd.';
  if (r.tipoRegistro === 'vacaciones') return 'Vac.';
  const sinComp = getSinComp(r);
  if (sinComp && esFeriado(r.fecha)) return 'Feriado\xd72';
  if (sinComp && esDomingo(r.fecha)) return 'Dom\xd72';
  if (sinComp)                       return 'Desc\xd72';
  if (esFeriado(r.fecha))            return 'FeriadoComp';
  if (esDomingo(r.fecha))            return 'DomComp';
  return 'Regular';
}
