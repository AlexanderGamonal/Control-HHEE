import { useState, useCallback } from 'react';
import { useAppStore } from '../../store';
import { calcHHEE } from '../../utils/calculations';
import { esFeriado, esDomingo } from '../../utils/holidays';
import { hoy } from '../../utils/dateUtils';
import { valorHora } from '../../utils/workerUtils';
import { syncToSheets } from '../../utils/sheetsUtils';
import { SpecialDayNotice } from './SpecialDayNotice';
import { PreviewBox } from './PreviewBox';
import { Alert, useAlert } from '../ui/Alert';
import type { CalcHHEEResult } from '../../types';

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

export function RegistroForm() {
  const { config, saveRegistro } = useAppStore();
  const { alertState, show, clear } = useAlert();

  const [fecha,    setFecha]    = useState(hoy());
  const [entrada,  setEntrada]  = useState('');
  const [salida,   setSalida]   = useState('');
  const [motivo,   setMotivo]   = useState('');
  const [sinComp,  setSinComp]  = useState(false);
  const [preview,  setPreview]  = useState<CalcHHEEResult | null>(null);

  const calcPreview = useCallback((ent: string, sal: string) => {
    if (ent.length === 5 && sal.length === 5) {
      try { setPreview(calcHHEE(ent, sal)); } catch { setPreview(null); }
    } else {
      setPreview(null);
    }
  }, []);

  const handleEntrada = (raw: string) => {
    const v = formatTimeValue(raw);
    setEntrada(v);
    calcPreview(v, salida);
  };

  const handleSalida = (raw: string) => {
    const v = formatTimeValue(raw);
    setSalida(v);
    calcPreview(entrada, v);
  };

  const blurTime = (val: string, setter: (v: string) => void, other: string, isEntrada: boolean) => {
    const completed = completeTime(val);
    setter(completed);
    calcPreview(isEntrada ? completed : other, isEntrada ? other : completed);
  };

  const handleFechaChange = (f: string) => {
    setFecha(f);
    setSinComp(false);
  };

  const registrar = () => {
    if (!fecha || !entrada || !salida) {
      show('Completa fecha, entrada y salida', 'error');
      return;
    }
    const r = calcHHEE(entrada, salida);
    const esFeriadoHoy = esFeriado(fecha);
    const esDomingoHoy = esDomingo(fecha);
    const sinCompensacion = esFeriadoHoy ? true : esDomingoHoy ? sinComp : false;

    saveRegistro({
      fecha, entrada, salida,
      turnoLabel:         r.turnoLabel,
      esTurnoNoche:       r.esTurnoNoche,
      refrigerioMin:      r.refrigerioMin,
      finJornadaStr:      r.finJornadaStr,
      trabajoEfectivoMin: r.trabajoEfectivoMin,
      vh: config.sueldo ? valorHora(config) : 0,
      sinCompensacion,
      motivo,
    });

    show('Día registrado ✓', 'success');
    setEntrada('');
    setSalida('');
    setMotivo('');
    setSinComp(false);
    setPreview(null);

    if (config.autoSync) {
      syncToSheets(useAppStore.getState().registros, config).catch(() => {});
    }
  };

  return (
    <>
      <div className="form-grid">
        <div className="field">
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => handleFechaChange(e.target.value)} />
        </div>
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
        <div className="field">
          <label>Motivo HHEE (opcional)</label>
          <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="ej. Cierre de mes" />
        </div>
      </div>

      <SpecialDayNotice fecha={fecha} sinCompensacion={sinComp} onSinCompensacionChange={setSinComp} />

      {preview && <PreviewBox result={preview} />}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={registrar}>Registrar día</button>
      </div>
      <Alert message={alertState.message} type={alertState.type} onClear={clear} />
    </>
  );
}
