import { useAppStore } from '../../store';
import { esDomingo, esFeriado } from '../../utils/holidays';
import { getSinComp } from '../../utils/workerUtils';
import { getDeltaInfo, minAHoraStr } from '../../utils/timeUtils';
import { formatFecha, getMondayOfWeek } from '../../utils/dateUtils';
import type { Registro } from '../../types';

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface RegistroTableProps {
  registros: Registro[];
}

export function RegistroTable({ registros }: RegistroTableProps) {
  const { deleteRegistro } = useAppStore();

  const eliminar = (fecha: string) => {
    if (!confirm(`¿Eliminar registro del ${formatFecha(fecha)}?`)) return;
    deleteRegistro(fecha);
  };

  if (!registros.length) {
    return (
      <div className="empty">
        <span>📋</span>Sin registros aún
      </div>
    );
  }

  const semanas: Record<string, Registro[]> = {};
  registros.forEach(r => {
    const w = getMondayOfWeek(r.fecha);
    if (!semanas[w]) semanas[w] = [];
    semanas[w].push(r);
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Entrada</th><th>Salida</th><th>Turno</th>
            <th>Fin jornada</th><th>Horas ef.</th><th>±8h</th><th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(semanas).sort().map(lunes => {
            const dias = semanas[lunes].slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
            const weekEf = dias.reduce((s, r) => s + (r.trabajoEfectivoMin || 0), 0);
            const domingo = new Date(lunes + 'T00:00:00');
            domingo.setDate(domingo.getDate() + 6);
            const domStr = domingo.toISOString().slice(0, 10);

            return [
              <tr key={`w-${lunes}`} className="week-header">
                <td colSpan={6}>Semana {formatFecha(lunes)} – {formatFecha(domStr)}</td>
                <td className="week-hhee">{minAHoraStr(weekEf)}</td>
                <td></td>
              </tr>,
              ...dias.map(r => {
                const dayName = DIAS_ES[new Date(r.fecha + 'T00:00:00').getDay()];
                const esMedico = r.tipoRegistro === 'descansoMedico';
                const esVac    = r.tipoRegistro === 'vacaciones';
                const esEspecial = esMedico || esVac;

                if (esEspecial) {
                  return (
                    <tr key={r.fecha} style={{ opacity: 0.85 }}>
                      <td>
                        {dayName} {formatFecha(r.fecha)}
                        <span
                          className="tag"
                          style={{ marginLeft: 4, background: esMedico ? 'rgba(126,184,247,0.18)' : 'rgba(77,210,130,0.18)', color: esMedico ? 'var(--accent4)' : '#3dbb6b', fontSize: 10 }}
                        >
                          {esMedico ? '🏥 Méd.' : '🌴 Vac.'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>—</td>
                      <td style={{ color: 'var(--text-muted)' }}>—</td>
                      <td>
                        <span className="tag" style={{ background: esMedico ? 'rgba(126,184,247,0.18)' : 'rgba(77,210,130,0.18)', color: esMedico ? 'var(--accent4)' : '#3dbb6b' }}>
                          {esMedico ? '🏥 Médico' : '🌴 Vacaciones'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>—</td>
                      <td style={{ color: 'var(--text-muted)' }}>—</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</td>
                      <td>
                        <button className="del-btn" onClick={() => eliminar(r.fecha)}>✕</button>
                      </td>
                    </tr>
                  );
                }

                const sinComp  = getSinComp(r);
                const esFer    = esFeriado(r.fecha);
                const esDom    = esDomingo(r.fecha);
                const di       = getDeltaInfo(r.trabajoEfectivoMin);

                let badge = '';
                if (sinComp) {
                  badge = esFer ? '×2' : esDom ? '×2' : 'Desc×2';
                }
                const badgeClass = sinComp ? (esFer ? 'tag-feriado' : 'tag-dom') : 'tag-0';
                const showComp   = !sinComp && (esFer || esDom);

                const turnoStyle = r.esTurnoNoche
                  ? { background: 'rgba(126,184,247,0.12)', color: 'var(--accent4)' }
                  : { background: 'rgba(77,157,232,0.08)', color: 'var(--accent)' };

                return (
                  <tr key={r.fecha}>
                    <td>
                      {dayName} {formatFecha(r.fecha)}
                      {r.ecoRomeo && <span className="tag" style={{ marginLeft: 4, background: 'rgba(255,160,60,0.15)', color: '#d4880a', fontSize: 10 }}>ER</span>}
                      {sinComp && <span className={`tag ${badgeClass}`} style={{ marginLeft: 4 }}>{badge}</span>}
                      {showComp && <span className="tag tag-0" style={{ marginLeft: 4, fontSize: 10 }}>Comp.</span>}
                    </td>
                    <td>{r.entrada}</td>
                    <td>{r.salida}</td>
                    <td>
                      <span className="tag" style={turnoStyle}>
                        {r.esTurnoNoche ? '🌙 Noche' : '☀️ Día'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.finJornadaStr}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {minAHoraStr(r.trabajoEfectivoMin ?? 0)}
                    </td>
                    <td>
                      <span style={{ color: di.deltaColor, fontSize: 11 }}>{di.deltaUI}</span>
                    </td>
                    <td>
                      <button className="del-btn" onClick={() => eliminar(r.fecha)}>✕</button>
                    </td>
                  </tr>
                );
              }),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
