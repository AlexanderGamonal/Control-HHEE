import type { Registro } from '../../types';
import { minAHoraStr } from '../../utils/timeUtils';

interface StatsGridProps {
  registros: Registro[];
  totalHHEE: number;
  totalMonto: number;
}

export function StatsGrid({ registros, totalHHEE, totalMonto }: StatsGridProps) {
  const noche = registros.filter(r => r.esTurnoNoche).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Días registrados</div>
        <div className="stat-value accent">{registros.length}</div>
      </div>
      <div className="stat-card green">
        <div className="stat-label">Total HHEE</div>
        <div className="stat-value green">{minAHoraStr(totalHHEE)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Monto HHEE (S/)</div>
        <div className="stat-value accent">S/ {totalMonto.toFixed(2)}</div>
      </div>
      <div className="stat-card blue">
        <div className="stat-label">Turnos noche</div>
        <div className="stat-value blue">{noche}</div>
      </div>
    </div>
  );
}
