import type { CalcHHEEResult, PeriodoResult, AcumuladoResult, Registro, Config } from '../types';
import { HORA_NOCHE, HORA_SIN_REFRIGERIO, JORNADA_MIN, REFRIGERIO_MIN, HHEE_LIMITE_MIN } from '../constants';
import { tiempoAMin, minAHoraStr, minToTimeStr } from './timeUtils';
import { getSinComp, valorHora, getTarifaParaPeriodo } from './workerUtils';

function calcMontoHHEE(hheeMin: number, vh: number): number {
  const primero   = Math.min(hheeMin, HHEE_LIMITE_MIN);
  const excedente = Math.max(0, hheeMin - HHEE_LIMITE_MIN);
  return primero / 60 * vh * 1.25 + excedente / 60 * vh * 1.35;
}

export function calcHHEE(entradaStr: string, salidaStr: string, sinRefrigerio = false): CalcHHEEResult {
  const entradaMin = tiempoAMin(entradaStr);
  let   salidaMin  = tiempoAMin(salidaStr);
  if (salidaMin <= entradaMin) salidaMin += 1440;

  const esTurnoNoche = entradaMin >= HORA_NOCHE;
  const refrigerio   = sinRefrigerio ? 0
    : (!esTurnoNoche && entradaMin <= HORA_SIN_REFRIGERIO) ? REFRIGERIO_MIN : 0;
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

  const saldoMin    = regularMin - countRegular * diaMin;
  const hheeMin     = Math.max(0, Math.round(saldoMin));
  const montoHHEE   = calcMontoHHEE(hheeMin, vh);
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
  const montoHHEEAlDia = calcMontoHHEE(hheeAlDia, vh);
  const montoFerAlDia  = feriadoMin / 60 * vh * 2;
  return {
    hheeAlDia, montoHHEEAlDia, montoFerAlDia,
    montoTotalAlDia: montoHHEEAlDia + montoFerAlDia,
    countRegular,
  };
}
