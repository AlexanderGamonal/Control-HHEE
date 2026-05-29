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

  const { totalHHEE, totalMonto, notaFeriados, acumulado } = useMemo(() => {
    let totalHHEE = 0, totalMonto = 0, notaFeriados = '';

    if (periodoActivo) {
      const p  = calcHHEEPeriodo(registros, periodoActivo.inicio, periodoActivo.fin, config);
      totalHHEE  = p.hheeMin;
      totalMonto = p.montoTotal;

      const totalDiasDeducidos = p.feriadosNoTrabajados + p.diasDescansoMedico + p.diasVacaciones;
      if (totalDiasDeducidos > 0) {
        const umbralBaseH = (p.umbralBaseMin / 60).toFixed(2);
        const umbralAjH   = (p.obligatorioMin / 60).toFixed(1);
        const partes: string[] = [];
        if (p.feriadosNoTrabajados > 0) {
          const n = p.feriadosNoTrabajados;
          partes.push(`${n} feriado${n > 1 ? 's' : ''}`);
        }
        if (p.diasDescansoMedico > 0) {
          const n = p.diasDescansoMedico;
          partes.push(`${n} descanso${n > 1 ? 's' : ''} médico`);
        }
        if (p.diasVacaciones > 0) {
          const n = p.diasVacaciones;
          partes.push(`${n} día${n > 1 ? 's' : ''} de vacaciones`);
        }
        notaFeriados = `📅 Umbral comercial base: ${umbralBaseH}h. Se descontaron ${totalDiasDeducidos * 8}h por ${partes.join(', ')}, resultando en un umbral ajustado de ${umbralAjH}h (D.Leg. 713).`;
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

    const acumulado = periodoActivo ? calcHHEEAcumulado(registros, periodoActivo.inicio, periodoActivo.fin, config) : null;

    return { totalHHEE, totalMonto, notaFeriados, acumulado };
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
      {notaFeriados && (
        <div style={{
          display: 'block', marginTop: 10, padding: '9px 13px', borderRadius: 2,
          fontSize: 11, background: 'rgba(210,70,90,0.07)',
          border: '1px solid rgba(210,70,90,0.25)', color: '#d2465a',
        }}>
          {notaFeriados}
        </div>
      )}
      {mostrarAcumulado && acumulado && <AcumuladoPanel ac={acumulado} />}
    </>
  );
}

export { labelPeriodo };
export { getPeriodoDeFecha };
