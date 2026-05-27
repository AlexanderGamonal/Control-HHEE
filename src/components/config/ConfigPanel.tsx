import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { valorHora } from '../../utils/workerUtils';
import { RMV } from '../../constants';
import type { Config } from '../../types';
import { FontSizeSelector } from './FontSizeSelector';
import { Alert, useAlert } from '../ui/Alert';

export function ConfigPanel({ onClose }: { onClose: () => void }) {
  const { config, setConfig } = useAppStore();
  const { alertState, show, clear } = useAlert();

  const [sueldo, setSueldo]       = useState(String(config.sueldo || ''));
  const [url, setUrl]             = useState(config.url || '');
  const [jornada, setJornada]     = useState(String(config.jornadaSemanal || 48));
  const [aplicaAF, setAplicaAF]   = useState(config.aplicaAF || false);
  const [valorAF, setValorAF]     = useState(String(config.valorAF || RMV * 0.1));
  const [fontSize, setFontSize]   = useState<Config['fontSize']>(config.fontSize || 'normal');

  const vh = (() => {
    const s = parseFloat(sueldo);
    if (!s || s <= 0) return null;
    return valorHora({ sueldo: s, aplicaAF, valorAF: parseFloat(valorAF) || RMV * 0.1, url, fontSize, jornadaSemanal: parseInt(jornada) || 48 });
  })();

  useEffect(() => {
    document.documentElement.setAttribute('data-fs', fontSize);
  }, [fontSize]);

  const guardar = () => {
    const cfg: Config = {
      sueldo:         parseFloat(sueldo) || 0,
      url:            url.trim(),
      fontSize,
      jornadaSemanal: parseInt(jornada) || 48,
      aplicaAF,
      valorAF:        parseFloat(valorAF) || RMV * 0.1,
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
          <div className="field">
            <label>Remuneración mensual (S/)</label>
            <input type="number" value={sueldo} onChange={e => setSueldo(e.target.value)} placeholder="ej. 3500" min="0" step="0.01" />
          </div>
          <div className="field">
            <label>Jornada semanal (h)</label>
            <input type="number" value={jornada} onChange={e => setJornada(e.target.value)} min="1" max="48" step="1" />
          </div>
          <div className="field">
            <label>Asignación Familiar</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <label className="radio-lbl">
                <input type="checkbox" checked={aplicaAF} onChange={e => setAplicaAF(e.target.checked)} /> Aplica AF
              </label>
            </div>
          </div>
          {aplicaAF && (
            <div className="field">
              <label>Valor AF (S/)</label>
              <input type="number" value={valorAF} onChange={e => setValorAF(e.target.value)} placeholder="102.50" min="0" step="0.01" />
            </div>
          )}
          {vh !== null && (
            <div className="field">
              <label>Valor hora referencial</label>
              <div className="vh-ref">
                <div className="vh-row"><span className="vh-lbl">Hora normal</span><span className="vh-val">S/ {vh.toFixed(4)}</span></div>
                <div className="vh-row"><span className="vh-lbl">HHEE netas (×1.25)</span><span className="vh-val accent">S/ {(vh * 1.25).toFixed(4)}</span></div>
                <div className="vh-row"><span className="vh-lbl">Feriado/Desc. (×2)</span><span className="vh-val accent2">S/ {(vh * 2).toFixed(4)}</span></div>
              </div>
            </div>
          )}
          <div className="field">
            <label>Google Sheets Script URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://script.google.com/..." />
          </div>
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
