import type { CalcHHEEResult } from '../../types';
import { minAHoraStr } from '../../utils/timeUtils';

interface PreviewBoxProps {
  result: CalcHHEEResult;
}

export function PreviewBox({ result: r }: PreviewBoxProps) {
  const badgeBg    = r.esTurnoNoche ? 'rgba(126,184,247,0.12)' : 'rgba(77,157,232,0.12)';
  const badgeColor = r.esTurnoNoche ? 'var(--accent4)' : 'var(--accent)';

  return (
    <div className="preview-box">
      <div className="preview-header">
        <span>Resumen del día</span>
        <span className="turno-badge" style={{ background: badgeBg, color: badgeColor }}>
          {r.turnoLabel}
        </span>
      </div>
      <div className="preview-rows">
        <div className="preview-row">
          <span className="lbl">Turno</span>
          <span className="val">{r.esTurnoNoche ? 'Noche (desde 19:00)' : 'Día (antes de 19:00)'}</span>
        </div>
        <div className="preview-row">
          <span className="lbl">Refrigerio descontado</span>
          <span className="val">{r.refrigerioMin > 0 ? `${r.refrigerioMin} min descontados` : 'Sin descuento'}</span>
        </div>
        <div className="preview-row">
          <span className="lbl">Tiempo total en local</span>
          <span className="val">{minAHoraStr(r.totalLocalMin)}</span>
        </div>
        <div className="preview-row">
          <span className="lbl">Horas efectivas del día</span>
          <span className="val hhee">{minAHoraStr(r.trabajoEfectivoMin)}</span>
        </div>
      </div>
    </div>
  );
}
