import { useState } from 'react';
import { useAppStore } from '../../store';
import { calcHHEE } from '../../utils/calculations';
import { esFeriado, esDomingo } from '../../utils/holidays';
import { hoy } from '../../utils/dateUtils';
import { valorHora, getTarifaParaPeriodo } from '../../utils/workerUtils';
import { syncToSheets } from '../../utils/sheetsUtils';
import { SpecialDayNotice } from './SpecialDayNotice';
import { PreviewBox } from './PreviewBox';
import { Alert, useAlert } from '../ui/Alert';
import type { CalcHHEEResult, Registro } from '../../types';

function formatTimeValue(raw: string): string {
  let v = raw.replace(/\D/g, '');
  if (v.length > 4) v = v.slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4);
  return v;
}

function completeTime(raw: string): string {
  let v = raw.replace(/\D/g, '');
  if (!v) return '';
  if (v.length === 1) v = '0' + v + '00';
  if (v.length === 2) v = v + '00';
  if (v.length === 3) v = v[0] + v[1] + v[2] + '0';
  v = v.slice(0, 4);
  const h = parseInt(v.slice(0, 2), 10);
  const m = parseInt(v.slice(2, 4), 10);
  if (h > 23 || m > 59) return '';
  return v.slice(0, 2) + ':' + v.slice(2, 4);
}

type TipoRegistro = 'trabajo' | 'descansoMedico' | 'vacaciones';

function runCalcHHEE(ent: string, sal: string, sinRefrigerio: boolean): CalcHHEEResult | null {
  if (ent.length !== 5 || sal.length !== 5) return null;
  try { return calcHHEE(ent, sal, sinRefrigerio); } catch { return null; }
}

export function RegistroForm() {
  const { config, saveRegistro } = useAppStore();
  const { alertState, show, clear } = useAlert();

  const [fecha,        setFecha]        = useState(hoy());
  const [entrada,      setEntrada]      = useState('');
  const [salida,       setSalida]       = useState('');
  const [motivo,       setMotivo]       = useState('');
  const [sinComp,      setSinComp]      = useState(false);
  const [preview,      setPreview]      = useState<CalcHHEEResult | null>(null);
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>('trabajo');
  const [ecoRomeo,     setEcoRomeo]     = useState(false);

  const updatePreview = (ent: string, sal: string, er: boolean) => {
    setPreview(runCalcHHEE(ent, sal, er));
  };

  const handleEntrada = (raw: string) => {
    const v = formatTimeValue(raw);
    setEntrada(v);
    updatePreview(v, salida, ecoRomeo);
  };

  const handleSalida = (raw: string) => {
    const v = formatTimeValue(raw);
    setSalida(v);
    updatePreview(entrada, v, ecoRomeo);
  };

  const blurTime = (val: string, setter: (v: string) => void, other: string, isEntrada: boolean) => {
    const completed = completeTime(val);
    setter(completed);
    updatePreview(
      isEntrada ? completed : other,
      isEntrada ? other : completed,
      ecoRomeo,
    );
  };

  const handleFechaChange = (f: string) => {
    setFecha(f);
    setSinComp(false);
  };

  const handleEcoRomeo = (checked: boolean) => {
    setEcoRomeo(checked);
    updatePreview(entrada, salida, checked);
  };

  const handleTipoChange = (tipo: TipoRegistro) => {
    setTipoRegistro(tipo);
    if (tipo !== 'trabajo') setPreview(null);
  };

  const registrar = () => {
    if (!fecha) { show('Completa la fecha', 'error'); return; }

    let reg: Omit<Registro, 'fecha'>;

    if (tipoRegistro === 'descansoMedico' || tipoRegistro === 'vacaciones') {
      reg = {
        entrada: '',
        salida: '',
        turnoLabel: tipoRegistro === 'descansoMedico' ? '🏥 Médico' : '🌴 Vacaciones',
        esTurnoNoche: false,
        refrigerioMin: 0,
        finJornadaStr: '',
        trabajoEfectivoMin: 0,
        vh: 0,
        sinCompensacion: false,
        motivo,
        tipoRegistro,
      };
    } else {
      if (!entrada || !salida) { show('Completa fecha, entrada y salida', 'error'); return; }
      const r = calcHHEE(entrada, salida, ecoRomeo);
      const esFeriadoHoy = esFeriado(fecha);
      const esDomingoHoy = esDomingo(fecha);
      const sinCompensacion = esFeriadoHoy ? true : esDomingoHoy ? sinComp : false;
      reg = {
        entrada, salida,
        turnoLabel:         r.turnoLabel,
        esTurnoNoche:       r.esTurnoNoche,
        refrigerioMin:      r.refrigerioMin,
        finJornadaStr:      r.finJornadaStr,
        trabajoEfectivoMin: r.trabajoEfectivoMin,
        vh: (() => { const t = getTarifaParaPeriodo(config.historialTarifas, fecha); return t ? valorHora(t) : 0; })(),
        sinCompensacion,
        motivo,
        tipoRegistro: 'trabajo',
        ecoRomeo: ecoRomeo || undefined,
      };
    }

    saveRegistro({ fecha, ...reg });
    show('Día registrado ✓', 'success');
    setEntrada('');
    setSalida('');
    setMotivo('');
    setSinComp(false);
    setEcoRomeo(false);
    setPreview(null);
    setTipoRegistro('trabajo');

    if (config.autoSync) {
      syncToSheets(useAppStore.getState().registros, config).catch(() => {});
    }
  };

  return (
    <>
      <div className="form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Tipo de día</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            {(['trabajo', 'descansoMedico', 'vacaciones'] as TipoRegistro[]).map(tipo => (
              <label key={tipo} className="radio-lbl" style={{ cursor: 'pointer' }}>
                <input
                  type="radio" name="tipoRegistro" value={tipo}
                  checked={tipoRegistro === tipo}
                  onChange={() => handleTipoChange(tipo)}
                />
                {tipo === 'trabajo' ? '☀️ Día trabajado' : tipo === 'descansoMedico' ? '🏥 Descanso médico' : '🌴 Vacaciones'}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => handleFechaChange(e.target.value)} />
        </div>

        {tipoRegistro === 'trabajo' && (
          <>
            <div className="field">
              <label>Hora entrada (HH:MM)</label>
              <input
                type="text" inputMode="numeric" placeholder="08:00" maxLength={5}
                value={entrada}
                onChange={e => handleEntrada(e.target.value)}
                onBlur={e => blurTime(e.target.value, setEntrada, salida, true)}
              />
            </div>
            <div className="field">
              <label>Hora salida (HH:MM)</label>
              <input
                type="text" inputMode="numeric" placeholder="17:45" maxLength={5}
                value={salida}
                onChange={e => handleSalida(e.target.value)}
                onBlur={e => blurTime(e.target.value, setSalida, entrada, false)}
              />
            </div>
          </>
        )}

        <div className="field">
          <label>Motivo (opcional)</label>
          <input
            type="text" value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder={tipoRegistro === 'trabajo' ? 'ej. Cierre de mes' : 'ej. Certificado médico N°123'}
          />
        </div>
      </div>

      {tipoRegistro === 'trabajo' && (
        <SpecialDayNotice fecha={fecha} sinCompensacion={sinComp} onSinCompensacionChange={setSinComp} />
      )}

      {tipoRegistro === 'trabajo' && (
        <div style={{ margin: '8px 0 4px' }}>
          <label className="radio-lbl" style={{ cursor: 'pointer', gap: 8 }}>
            <input
              type="checkbox"
              checked={ecoRomeo}
              onChange={e => handleEcoRomeo(e.target.checked)}
            />
            <span>
              <strong>Eco Romeo</strong>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> — sin descuento de refrigerio (no se almorzó)</span>
            </span>
          </label>
        </div>
      )}

      {tipoRegistro === 'trabajo' && preview && <PreviewBox result={preview} />}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={registrar}>Registrar día</button>
      </div>
      <Alert message={alertState.message} type={alertState.type} onClear={clear} />
    </>
  );
}
