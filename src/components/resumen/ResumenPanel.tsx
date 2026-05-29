import { useMemo } from 'react';
import { useAppStore } from '../../store';
import { calcHHEEPeriodo, calcHHEEAcumulado } from '../../utils/calculations';
import { getPeriodoDeFecha, hoy, labelPeriodo } from '../../utils/dateUtils';
import { StatsGrid } from './StatsGrid';
import { AcumuladoPanel } from './AcumuladoPanel';
import { PeriodoNav } from './PeriodoNav';

interface ResumenPanelProps {
  onPeriodo: (inicio: string, fin: string) => void;
  onVerTodo: () => void;
  periodoLabel: string;
}

export function ResumenPanel({ onPeriodo, onVerTodo, periodoLabel }: ResumenPanelProps) {
  const { registros, config, periodoActivo } = useAppStore();

  const { totalHHEE, totalMonto, acumulado } = useMemo(() => {
    let totalHHEE = 0, totalMonto = 0;

    if (periodoActivo) {
      const p = calcHHEEPeriodo(registros, periodoActivo.inicio, periodoActivo.fin, config);
      totalHHEE  = p.hheeMin;
      totalMonto = p.montoTotal;
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

    return { totalHHEE, totalMonto, acumulado };
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
      {mostrarAcumulado && acumulado && <AcumuladoPanel ac={acumulado} />}
    </>
  );
}

export { labelPeriodo };
export { getPeriodoDeFecha };
