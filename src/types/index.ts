export interface Registro {
  fecha: string;
  entrada: string;
  salida: string;
  turnoLabel: string;
  esTurnoNoche: boolean;
  refrigerioMin: number;
  finJornadaStr: string;
  trabajoEfectivoMin: number;
  vh: number;
  sinCompensacion?: boolean;
  motivo?: string;
  tipoRegistro?: 'trabajo' | 'descansoMedico' | 'vacaciones';
  ecoRomeo?: boolean;
}

export interface TarifaSueldo {
  montoSueldo: number;
  montoAsignacionFamiliar: number; // 0 = no aplica AF
  fechaVigenciaDesde: string;      // YYYY-MM-DD
}

export interface Config {
  historialTarifas: TarifaSueldo[];
  url: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  jornadaSemanal: number;
  autoSync: boolean;
}

export interface Periodo {
  inicio: string;
  fin: string;
}

export interface CalcHHEEResult {
  esTurnoNoche: boolean;
  turnoLabel: string;
  refrigerioMin: number;
  totalLocalMin: number;
  trabajoEfectivoMin: number;
  finJornadaStr: string;
  hheeMin: number;
  hheeStr: string;
  hheeDecimal: number;
}

export interface PeriodoResult {
  regularMin: number;
  feriadoMin: number;
  saldoMin: number;
  hheeMin: number;
  hheeStr: string;
  montoHHEE: number;
  montoFeriado: number;
  montoTotal: number;
}

export interface AcumuladoResult {
  hheeAlDia: number;
  montoHHEEAlDia: number;
  montoFerAlDia: number;
  montoTotalAlDia: number;
  countRegular: number;
}

export interface DeltaInfo {
  deltaMin: number;
  deltaUI: string;
  deltaExport: string;
  deltaColor: string;
}
