import type { AcumuladoResult } from '../../types';
import { minAHoraStr } from '../../utils/timeUtils';

interface AcumuladoPanelProps {
  ac: AcumuladoResult;
}

export function AcumuladoPanel({ ac }: AcumuladoPanelProps) {
  return (
    <div id="panel-acumulado">
      <div className="acum-label">
        ≈ Acumulado · <span>{ac.countRegular}</span> días regulares registrados
      </div>
      <div className="acum-row">
        <div>
          <div className="acum-stat-label">HHEE estimadas</div>
          <div className="acum-stat-value">{minAHoraStr(ac.hheeAlDia)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="acum-stat-label">Monto estimado</div>
          <div className="acum-stat-value">S/ {ac.montoTotalAlDia.toFixed(2)}</div>
        </div>
      </div>
      {ac.montoFerAlDia > 0 && (
        <div className="acum-fer-row">
          <span>Feriados/Descanso ×2:</span>
          <span className="acum-fer-val">S/ {ac.montoFerAlDia.toFixed(2)}</span>
        </div>
      )}
      <div className="acum-note">Estimado basado en días registrados — varía hasta cerrar el período</div>
    </div>
  );
}
