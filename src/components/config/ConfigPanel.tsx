import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { valorHora } from '../../utils/workerUtils';
import { formatFecha, hoy } from '../../utils/dateUtils';
import type { Config, TarifaSueldo } from '../../types';
import { FontSizeSelector } from './FontSizeSelector';
import { Alert, useAlert } from '../ui/Alert';

export function ConfigPanel({ onClose }: { onClose: () => void }) {
  const { config, setConfig } = useAppStore();
  const { alertState, show, clear } = useAlert();

  const [historialTarifas, setHistorialTarifas] = useState<TarifaSueldo[]>(
    config.historialTarifas ?? []
  );
  const [url, setUrl]           = useState(config.url || '');
  const [jornada, setJornada]   = useState(String(config.jornadaSemanal || 48));
  const [fontSize, setFontSize] = useState<Config['fontSize']>(config.fontSize || 'normal');
  const [autoSync, setAutoSync] = useState(config.autoSync || false);

  // Formulario inline para nueva tarifa
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSueldo,   setNewSueldo]   = useState('');
  const [newAF,       setNewAF]       = useState('0');
  const [newFecha,    setNewFecha]    = useState(hoy());

  // Valor hora de la tarifa más reciente (para el preview)
  const tarifasOrdenadas = [...historialTarifas].sort(
    (a, b) => b.fechaVigenciaDesde.localeCompare(a.fechaVigenciaDesde)
  );
  const tarifaVigente = tarifasOrdenadas[0] ?? null;
  const vh = tarifaVigente ? valorHora(tarifaVigente) : null;

  // Preview de la nueva tarifa siendo ingresada
  const vhNew = (() => {
    const s = parseFloat(newSueldo);
    if (!s || s <= 0) return null;
    return valorHora({ montoSueldo: s, montoAsignacionFamiliar: parseFloat(newAF) || 0, fechaVigenciaDesde: newFecha });
  })();

  useEffect(() => {
    document.documentElement.setAttribute('data-fs', fontSize);
  }, [fontSize]);

  const agregarTarifa = () => {
    const monto = parseFloat(newSueldo);
    if (!monto || monto <= 0) { show('Ingresa un monto de sueldo válido', 'error'); return; }
    if (!newFecha) { show('Ingresa la fecha de vigencia', 'error'); return; }
    const nueva: TarifaSueldo = {
      montoSueldo: monto,
      montoAsignacionFamiliar: parseFloat(newAF) || 0,
      fechaVigenciaDesde: newFecha,
    };
    setHistorialTarifas(prev => [...prev, nueva]);
    setShowNewForm(false);
    setNewSueldo('');
    setNewAF('0');
    setNewFecha(hoy());
  };

  const eliminarTarifa = (fecha: string) => {
    setHistorialTarifas(prev => prev.filter(t => t.fechaVigenciaDesde !== fecha));
  };

  const guardar = () => {
    const cfg: Config = {
      historialTarifas,
      url:            url.trim(),
      fontSize,
      jornadaSemanal: parseInt(jornada) || 48,
      autoSync:       autoSync && !!url.trim(),
    };
    setConfig(cfg);
    localStorage.setItem('hhee_setup_done', '1');
    show('Configuración guardada ✓', 'success');
    setTimeout(onClose, 800);
  };

  return (
    <div className="section" id="section-config">
      <div className="section-header no-toggle">
        <div className="dot"></div> Configuración
      </div>
      <div className="section-body">
        <div className="form-grid">

          {/* ── Historial de Remuneraciones ── */}
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Historial de Remuneraciones</label>

            {tarifasOrdenadas.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0' }}>
                Sin sueldo configurado — agrega el primero con el botón de abajo.
              </div>
            ) : (
              <div className="table-wrap" style={{ marginTop: 8 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Vigente desde</th>
                      <th>Sueldo (S/)</th>
                      <th>AF (S/)</th>
                      <th>Valor hora</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tarifasOrdenadas.map((t, i) => {
                      const vhT = valorHora(t);
                      return (
                        <tr key={t.fechaVigenciaDesde} style={i === 0 ? { background: 'rgba(77,157,232,0.06)' } : {}}>
                          <td>{formatFecha(t.fechaVigenciaDesde)}{i === 0 && <span className="tag tag-0" style={{ marginLeft: 6, fontSize: 9 }}>actual</span>}</td>
                          <td>S/ {t.montoSueldo.toFixed(2)}</td>
                          <td>{t.montoAsignacionFamiliar > 0 ? `S/ ${t.montoAsignacionFamiliar.toFixed(2)}` : '—'}</td>
                          <td style={{ color: 'var(--accent)' }}>S/ {vhT.toFixed(4)}</td>
                          <td>
                            <button
                              className="del-btn"
                              onClick={() => eliminarTarifa(t.fechaVigenciaDesde)}
                              title="Eliminar esta tarifa"
                            >✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formulario inline para nueva tarifa */}
            {showNewForm ? (
              <div style={{ marginTop: 12, padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Nueva tarifa
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>Sueldo básico (S/)</label>
                    <input type="number" value={newSueldo} onChange={e => setNewSueldo(e.target.value)}
                      placeholder="ej. 4511" min="0" step="0.01" autoFocus />
                  </div>
                  <div className="field">
                    <label>Asignación Familiar (S/) — 0 si no aplica</label>
                    <input type="number" value={newAF} onChange={e => setNewAF(e.target.value)}
                      placeholder="ej. 113" min="0" step="0.01" />
                  </div>
                  <div className="field">
                    <label>Vigente desde</label>
                    <input type="date" value={newFecha} onChange={e => setNewFecha(e.target.value)} />
                  </div>
                </div>
                {vhNew !== null && (
                  <div className="vh-ref" style={{ marginTop: 10 }}>
                    <div className="vh-row"><span className="vh-lbl">Hora normal</span><span className="vh-val">S/ {vhNew.toFixed(4)}</span></div>
                    <div className="vh-row"><span className="vh-lbl">HHEE netas (×1.25)</span><span className="vh-val accent">S/ {(vhNew * 1.25).toFixed(4)}</span></div>
                    <div className="vh-row"><span className="vh-lbl">Feriado/Desc. (×2)</span><span className="vh-val accent2">S/ {(vhNew * 2).toFixed(4)}</span></div>
                  </div>
                )}
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={agregarTarifa}>Agregar</button>
                  <button className="btn btn-outline" onClick={() => setShowNewForm(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-outline"
                style={{ marginTop: 10, fontSize: 12 }}
                onClick={() => setShowNewForm(true)}
              >
                ＋ Registrar Nuevo Aumento
              </button>
            )}

            {/* Preview valor hora vigente */}
            {vh !== null && !showNewForm && (
              <div className="vh-ref" style={{ marginTop: 12 }}>
                <div className="vh-row"><span className="vh-lbl">Hora normal</span><span className="vh-val">S/ {vh.toFixed(4)}</span></div>
                <div className="vh-row"><span className="vh-lbl">HHEE netas (×1.25)</span><span className="vh-val accent">S/ {(vh * 1.25).toFixed(4)}</span></div>
                <div className="vh-row"><span className="vh-lbl">Feriado/Desc. (×2)</span><span className="vh-val accent2">S/ {(vh * 2).toFixed(4)}</span></div>
              </div>
            )}
          </div>

          {/* ── Otros ajustes ── */}
          <div className="field">
            <label>Jornada semanal (h)</label>
            <input type="number" value={jornada} onChange={e => setJornada(e.target.value)} min="1" max="48" step="1" />
          </div>
          <div className="field">
            <label>Google Sheets Script URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://script.google.com/..." />
          </div>
          {url && (
            <div className="field">
              <label>Sincronización automática</label>
              <label className="radio-lbl" style={{ marginTop: 4 }}>
                <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} />
                Sincronizar al guardar cada día
              </label>
            </div>
          )}
          <div className="field">
            <label>Tamaño de fuente</label>
            <FontSizeSelector value={fontSize} onChange={setFontSize} />
          </div>
        </div>

        <div className="regla-box">
          <div className="regla">
            <strong>☀️ Turno día temprano (entrada hasta 13:00)</strong>
            Jornada total en local: <strong style={{ color: 'var(--text)' }}>8h 45min</strong><br />
            — 45 min refrigerio descontados<br />
            — 8h trabajo efectivo<br />
            HHEE inician a las 8h 45min de entrada
          </div>
          <div className="regla">
            <strong>☀️ Turno día tarde (entrada después de 13:00)</strong>
            Jornada total en local: <strong style={{ color: 'var(--text)' }}>8h 00min</strong><br />
            — Sin descuento de refrigerio<br />
            — 8h trabajo efectivo<br />
            HHEE inician a las 8h 00min de entrada
          </div>
          <div className="regla night">
            <strong>🌙 Turno noche (entrada 19:00 o después)</strong>
            Jornada total en local: <strong style={{ color: 'var(--text)' }}>8h 00min</strong><br />
            — Sin descuento de refrigerio<br />
            — 8h trabajo efectivo<br />
            HHEE inician a las 8h 00min de entrada
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={guardar}>Guardar y cerrar</button>
        </div>
        <Alert message={alertState.message} type={alertState.type} onClear={clear} />
      </div>
    </div>
  );
}
