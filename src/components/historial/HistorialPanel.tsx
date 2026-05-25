import { useState } from 'react';
import { useAppStore } from '../../store';
import { getTipoLabel } from '../../utils/workerUtils';
import { getDeltaInfo, minAHoraStr } from '../../utils/timeUtils';
import { getPeriodoDeFecha, labelPeriodo, hoy } from '../../utils/dateUtils';
import { RegistroTable } from './RegistroTable';
import { Alert, useAlert } from '../ui/Alert';

interface HistorialPanelProps {
  registrosFiltrados: import('../../types').Registro[];
}

export function HistorialPanel({ registrosFiltrados }: HistorialPanelProps) {
  const { registros, config, periodoActivo, clearRegistros } = useAppStore();
  const { alertState, show, clear } = useAlert();
  const [scope, setScope] = useState<'periodo' | 'todo'>('periodo');

  const getExportData = () => {
    if (scope === 'periodo' && periodoActivo) {
      return registros.filter(r => r.fecha >= periodoActivo.inicio && r.fecha <= periodoActivo.fin);
    }
    return registros;
  };

  const exportarCSV = () => {
    const data = getExportData();
    if (!data.length) { show('Sin datos para exportar en el período activo', 'error'); return; }

    const headers = ['Período', 'Fecha', 'Entrada', 'Salida', 'Turno', 'Fin Jornada', 'Horas Ef.', 'Delta ±8h', 'Tipo', 'Motivo'];
    const rows = data.map(r => {
      const tipo  = getTipoLabel(r);
      const di    = getDeltaInfo(r.trabajoEfectivoMin);
      const per   = getPeriodoDeFecha(r.fecha);
      return [
        `"${labelPeriodo(per.inicio, per.fin)}"`,
        r.fecha, r.entrada, r.salida,
        r.esTurnoNoche ? 'Noche' : 'Día',
        r.finJornadaStr,
        minAHoraStr(r.trabajoEfectivoMin ?? 0),
        di.deltaExport, tipo, r.motivo || '',
      ].join(',');
    });

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `HHEE_${hoy()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportarSheets = async () => {
    if (!config.url) { show('Configura el Script URL en ⚙️ Ajustes', 'error'); return; }
    if (!config.url.includes('script.google.com')) { show('La URL no parece ser de Google Apps Script', 'error'); return; }
    const data = getExportData();
    if (!data.length) { show('Sin datos para exportar en el período activo', 'error'); return; }

    show('Enviando a Google Sheets...', 'success');
    try {
      await fetch(config.url, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          rows: data.map(r => {
            const tipo = getTipoLabel(r);
            const di   = getDeltaInfo(r.trabajoEfectivoMin);
            const per  = getPeriodoDeFecha(r.fecha);
            return {
              periodo: labelPeriodo(per.inicio, per.fin),
              fecha: r.fecha, entrada: r.entrada, salida: r.salida,
              turno: r.esTurnoNoche ? 'Noche' : 'Día',
              finJornada: r.finJornadaStr,
              horasEf: minAHoraStr(r.trabajoEfectivoMin ?? 0),
              delta: di.deltaExport, tipo, motivo: r.motivo || '',
            };
          }),
        }),
      });
      show('✓ Enviado a Google Sheets', 'success');
    } catch {
      show('Error de red. Verifica tu conexión a internet.', 'error');
    }
  };

  const borrarTodo = () => {
    if (!confirm('¿Borrar TODOS los registros? No se puede deshacer.')) return;
    clearRegistros();
  };

  return (
    <>
      <Alert message={alertState.message} type={alertState.type} onClear={clear} />
      <RegistroTable registros={registrosFiltrados} />
      <div className="export-scope">
        <label className="radio-lbl">
          <input type="radio" name="exp-scope" value="periodo" checked={scope === 'periodo'} onChange={() => setScope('periodo')} />
          Período activo
        </label>
        <label className="radio-lbl">
          <input type="radio" name="exp-scope" value="todo" checked={scope === 'todo'} onChange={() => setScope('todo')} />
          Todos
        </label>
      </div>
      <div className="btn-row">
        <button className="btn btn-success" onClick={exportarSheets}>↑ Sync Google Sheets</button>
        <button className="btn btn-outline" onClick={exportarCSV}>↓ Descargar CSV</button>
        <button className="btn btn-danger" onClick={borrarTodo}>Borrar todo</button>
      </div>
    </>
  );
}
