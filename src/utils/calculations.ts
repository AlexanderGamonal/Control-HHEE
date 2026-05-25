import type { CalcHHEEResult, PeriodoResult, AcumuladoResult, Registro, Config } from '../types';
import { HORA_NOCHE, JORNADA_MIN, REFRIGERIO_MIN } from '../constants';
import { tiempoAMin, minAHoraStr, minToTimeStr } from './timeUtils';
import { esFeriado } from './holidays';
import { diasEnPeriodo } from './dateUtils';
import { getSinComp, valorHora } from './workerUtils';

export function calcHHEE(entradaStr: string, salidaStr: string): CalcHHEEResult {
  const entradaMin = tiempoAMin(entradaStr);
  let   salidaMin  = tiempoAMin(salidaStr);
  if (salidaMin <= entradaMin) salidaMin += 1440;

  const esTurnoNoche = entradaMin >= HORA_NOCHE;
  const refrigerio   = esTurnoNoche ? 0 : REFRIGERIO_MIN;
  const totalLocalMin   = salidaMin - entradaMin;
  const trabajoEfectivo = totalLocalMin - refrigerio;
  const finJornadaMin   = entradaMin + JORNADA_MIN + refrigerio;
  const hheeMin         = Math.max(0, salidaMin - finJornadaMin);

  return {
    esTurnoNoche,
    turnoLabel:         esTurnoNoche ? '🌙 Noche' : '☀️ Día',
    refrigerioMin:      refrigerio,
    totalLocalMin,
    trabajoEfectivoMin: Math.max(0, trabajoEfectivo),
    finJornadaStr:      minToTimeStr(finJornadaMin),
    hheeMin,
    hheeStr:     minAHoraStr(hheeMin),
    hheeDecimal: hheeMin / 60,
  };
}

export function calcHHEEPeriodo(registros: Registro[], inicio: string, fin: string, cfg: Config): PeriodoResult {
  const vh   = cfg.sueldo ? valorHora(cfg) : 0;
  const jorn = (cfg.jornadaSemanal || 48) * 60;
  const N    = diasEnPeriodo(inicio, fin);
  const diaMin = Math.round(jorn / 6);

  const fechasRegistradas = new Set(
    registros.filter(r => r.fecha >= inicio && r.fecha <= fin).map(r => r.fecha)
  );
  let feriadosNoTrabajados = 0;
  const d    = new Date(inicio + 'T00:00:00');
  const dFin = new Date(fin    + 'T00:00:00');
  while (d <= dFin) {
    const f = d.toISOString().slice(0, 10);
    if (esFeriado(f) && !fechasRegistradas.has(f)) feriadosNoTrabajados++;
    d.setDate(d.getDate() + 1);
  }

  const semanasCompletas = Math.floor(N / 7);
  const diasRestantes    = N % 7;
  const diasLaborables   = semanasCompletas * 6 + diasRestantes;
  const obligatorioMin   = Math.max(0, (diasLaborables - feriadosNoTrabajados) * diaMin);

  let regularMin = 0, feriadoMin = 0;
  registros.filter(r => r.fecha >= inicio && r.fecha <= fin).forEach(r => {
    const trabajo = r.trabajoEfectivoMin ?? 0;
    if (getSinComp(r)) feriadoMin += trabajo;
    else               regularMin += trabajo;
  });

  const saldoMin   = regularMin - obligatorioMin;
  const hheeMin    = Math.max(0, saldoMin);
  const montoHHEE  = hheeMin    / 60 * vh * 1.25;
  const montoFeriado = feriadoMin / 60 * vh * 2;

  return {
    obligatorioMin, regularMin, feriadoMin, saldoMin, feriadosNoTrabajados,
    hheeMin, hheeStr: minAHoraStr(hheeMin),
    montoHHEE, montoFeriado, montoTotal: montoHHEE + montoFeriado,
  };
}

export function calcHHEEAcumulado(registros: Registro[], inicio: string, fin: string, cfg: Config): AcumuladoResult {
  const vh     = cfg.sueldo ? valorHora(cfg) : 0;
  const diaMin = Math.round((cfg.jornadaSemanal || 48) * 60 / 6);

  let regularMin = 0, feriadoMin = 0, countRegular = 0;
  registros.filter(r => r.fecha >= inicio && r.fecha <= fin).forEach(r => {
    const trabajo = r.trabajoEfectivoMin ?? 0;
    if (getSinComp(r)) { feriadoMin += trabajo; }
    else               { regularMin += trabajo; countRegular++; }
  });

  const hheeAlDia      = Math.max(0, regularMin - countRegular * diaMin);
  const montoHHEEAlDia = hheeAlDia  / 60 * vh * 1.25;
  const montoFerAlDia  = feriadoMin / 60 * vh * 2;
  return {
    hheeAlDia, montoHHEEAlDia, montoFerAlDia,
    montoTotalAlDia: montoHHEEAlDia + montoFerAlDia,
    countRegular,
  };
}
