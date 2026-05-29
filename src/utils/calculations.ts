import type { CalcHHEEResult, PeriodoResult, AcumuladoResult, Registro, Config } from '../types';
import { HORA_NOCHE, HORA_SIN_REFRIGERIO, JORNADA_MIN, REFRIGERIO_MIN } from '../constants';
import { tiempoAMin, minAHoraStr, minToTimeStr } from './timeUtils';
import { getSinComp, valorHora, getTarifaParaPeriodo } from './workerUtils';

export function calcHHEE(entradaStr: string, salidaStr: string): CalcHHEEResult {
  const entradaMin = tiempoAMin(entradaStr);
  let   salidaMin  = tiempoAMin(salidaStr);
  if (salidaMin <= entradaMin) salidaMin += 1440;

  const esTurnoNoche = entradaMin >= HORA_NOCHE;
  const refrigerio   = (!esTurnoNoche && entradaMin <= HORA_SIN_REFRIGERIO) ? REFRIGERIO_MIN : 0;
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
  const tarifa = getTarifaParaPeriodo(cfg.historialTarifas, fin);
  const vh     = tarifa ? valorHora(tarifa) : 0;
  const diaMin = Math.round((cfg.jornadaSemanal || 48) * 60 / 6);

  let regularMin = 0, feriadoMin = 0, countRegular = 0;
  registros.filter(r => r.fecha >= inicio && r.fecha <= fin).forEach(r => {
    const tipo = r.tipoRegistro ?? 'trabajo';
    if (tipo === 'descansoMedico' || tipo === 'vacaciones') return;
    const trabajo = r.trabajoEfectivoMin ?? 0;
    if (getSinComp(r)) feriadoMin += trabajo;
    else               { regularMin += trabajo; countRegular++; }
  });

  // Net delta: sum of (trabajoEfectivo - 8h) per registered work day
  const saldoMin    = regularMin - countRegular * diaMin;
  const hheeMin     = Math.max(0, Math.round(saldoMin));
  const montoHHEE   = hheeMin / 60 * vh * 1.25;
  const montoFeriado = feriadoMin / 60 * vh * 2;

  return {
    regularMin, feriadoMin, saldoMin,
    hheeMin, hheeStr: minAHoraStr(hheeMin),
    montoHHEE, montoFeriado, montoTotal: montoHHEE + montoFeriado,
  };
}

export function calcHHEEAcumulado(registros: Registro[], inicio: string, fin: string, cfg: Config): AcumuladoResult {
  const tarifa = getTarifaParaPeriodo(cfg.historialTarifas, fin);
  const vh     = tarifa ? valorHora(tarifa) : 0;
  const diaMin = Math.round((cfg.jornadaSemanal || 48) * 60 / 6);

  let regularMin = 0, feriadoMin = 0, countRegular = 0;
  registros.filter(r => r.fecha >= inicio && r.fecha <= fin).forEach(r => {
    const tipo = r.tipoRegistro ?? 'trabajo';
    if (tipo === 'descansoMedico' || tipo === 'vacaciones') return;
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
