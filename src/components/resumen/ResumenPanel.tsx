import { useMemo } from 'react';
import { useAppStore } from '../../store';
import { calcHHEEPeriodo, calcHHEEAcumulado } from '../../utils/calculations';
import { getPeriodoDeFecha, hoy, labelPeriodo } from '../../utils/dateUtils';
import { minAHoraStr } from '../../utils/timeUtils';
import { StatsGrid } from './StatsGrid';
import { AcumuladoPanel } from './AcumuladoPanel';
import { PeriodoNav } from './PeriodoNav';
import { HHEE_LIMITE_MIN } from '../../constants';

interface ResumenPanelProps {
  onPeriodo: (inicio: string, fin: string) => void;
  onVerTodo: () => void;
  periodoLabel: string;
}

export function ResumenPanel({ onPeriodo, onVerTodo, periodoLabel }: ResumenPanelProps) {
  const { registros, config, periodoActivo } = useAppStore();

  const { totalHHEE, totalMonto, desglose, acumulado } = useMemo(() => {
    let totalHHEE = 0, totalMonto = 0;
    let desglose: { tramo1Min: number; tramo2Min: number; monto1: number; monto2: number; montoFeriado: number } | null = null;

    if (periodoActivo) {
      const p = calcHHEEPeriodo(registros, periodoActivo.inicio, periodoActivo.fin, config);
      totalHHEE  = p.hheeMin;
      totalMonto = p.montoTotal;
      if (p.hheeMin > 0 || p.feriadoMin > 0) {
        desglose = {
          tramo1Min:    Math.min(p.hheeMin, HHEE_LIMITE_MIN),
          tramo2Min:    p.hheeTramo2Min,
          monto1:       p.montoTramo1,
          monto2:       p.montoTramo2,
          montoFeriado: p.montoFeriado,
        };
      }
    } else {
      const periodos = new Map<string, { inicio: string; fin: string }>();
      registros.forEach(r => {
        const { inicio, fin } = getPeriodoDeFecha(r.fecha);
        if (!periodos.has(inicio)) periodos.set(inicio, { inicio, fin });
      });
      periodos.forEach(({ inicio, fin }) => {
        const p = calcHHEEPeriodo(registros, inicio, fin, config);
        totalHHEE  += p.hheeMin;
        totalMonto += p.montoTotal;
      });
    }

    const acumulado = periodoActivo
      ? calcHHEEAcumulado(registros, periodoActivo.inicio, periodoActivo.fin, config)
      : null;

    return { totalHHEE, totalMonto, desglose, acumulado };
  }, [registros, config, periodoActivo]);

  const registrosFiltrados = periodoActivo
    ? registros.filter(r => r.fecha >= periodoActivo.inicio && r.fecha <= periodoActivo.fin)
    : registros;

  const periodoAbierto = periodoActivo ? hoy() <= periodoActivo.fin : false;
  const mostrarAcumulado = periodoAbierto && acumulado !== null &&
    (acumulado.hheeAlDia > 0 || acumulado.montoFerAlDia > 0);

  return (
    <>
      <PeriodoNav periodoLabel={periodoLabel} onPeriodo={onPeriodo} onVerTodo={onVerTodo} />
      <StatsGrid registros={registrosFiltrados} totalHHEE={totalHHEE} totalMonto={totalMonto} />

      {desglose && (
        <div style={{
          marginTop: 10, padding: '10px 13px', borderRadius: 2,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          fontSize: 12,
        }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>
            DESGLOSE DEL PERÍODO
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text)' }}>
            <span>HHEE {minAHoraStr(desglose.tramo1Min)} × 1.25</span>
            <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>S/ {desglose.monto1.toFixed(2)}</span>
          </div>
          {desglose.tramo2Min > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text)' }}>
              <span>Excedente {minAHoraStr(desglose.tramo2Min)} × 1.35</span>
              <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>S/ {desglose.monto2.toFixed(2)}</span>
            </div>
          )}
          {desglose.montoFeriado > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text)' }}>
              <span>Feriados / Descanso × 2</span>
              <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>S/ {desglose.montoFeriado.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total</span>
            <span style={{ color: 'var(--accent)' }}>S/ {(desglose.monto1 + desglose.monto2 + desglose.montoFeriado).toFixed(2)}</span>
          </div>
        </div>
      )}

      {mostrarAcumulado && acumulado && <AcumuladoPanel ac={acumulado} />}
    </>
  );
}

export { labelPeriodo };
export { getPeriodoDeFecha };
