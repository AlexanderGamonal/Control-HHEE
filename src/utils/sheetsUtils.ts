import type { Registro, Config } from '../types';
import { JORNADA_MIN } from '../constants';
import { getSinComp, getTipoLabel } from './workerUtils';
import { getDeltaInfo, minAHoraStr } from './timeUtils';
import { getPeriodoDeFecha, labelPeriodo } from './dateUtils';

function buildRow(r: Registro) {
  const hheeMin = Math.max(0, r.trabajoEfectivoMin - JORNADA_MIN);
  const monto   = getSinComp(r)
    ? (r.trabajoEfectivoMin / 60) * r.vh * 2
    : (hheeMin / 60) * r.vh * 1.25;
  const di  = getDeltaInfo(r.trabajoEfectivoMin);
  const per = getPeriodoDeFecha(r.fecha);
  return {
    periodo:    labelPeriodo(per.inicio, per.fin),
    fecha:      r.fecha,
    entrada:    r.entrada,
    salida:     r.salida,
    turno:      r.esTurnoNoche ? 'Noche' : 'Día',
    finJornada: r.finJornadaStr,
    horasEf:    minAHoraStr(r.trabajoEfectivoMin ?? 0),
    delta:      di.deltaExport,
    hheeDia:    minAHoraStr(hheeMin),
    monto:      monto.toFixed(2),
    tipo:       getTipoLabel(r),
    motivo:     r.motivo || '',
  };
}

export async function syncToSheets(registros: Registro[], config: Config): Promise<void> {
  if (!config.url?.includes('script.google.com') || !registros.length) return;
  await fetch(config.url, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ rows: registros.map(buildRow) }),
  });
}
