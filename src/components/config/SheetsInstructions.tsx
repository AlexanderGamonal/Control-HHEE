import { useState } from 'react';
import { APPS_SCRIPT } from '../../constants';

export function SheetsInstructions() {
  const [copied, setCopied] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(APPS_SCRIPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="section" id="section-instrucciones">
      <div className="section-header no-toggle">
        <div className="dot"></div> Conectar Google Sheets
      </div>
      <div className="section-body">
        <div className="config-notice">
          <strong>Pasos:</strong><br /><br />
          1. Abre <a href="https://sheets.google.com" target="_blank" rel="noreferrer">sheets.google.com</a> en modo escritorio (Chrome → ⋮ → Sitio de escritorio).<br />
          2. Crea una hoja nueva → nómbrala <code>Control HHEE</code>.<br />
          3. Ve a <code>Extensiones → Apps Script</code>.<br />
          4. Borra el código existente y pega el script de abajo.<br />
          5. Toca <code>Implementar → Nueva implementación</code>.<br />
          6. Tipo: <code>Aplicación web</code> · Ejecutar como: <code>Yo</code> · Acceso: <code>Cualquiera</code>.<br />
          7. Autoriza permisos (acepta aviso de "app no verificada" → Configuración avanzada → Ir a...).<br />
          8. Copia la URL generada y pégala en <strong>Configuración → Script URL</strong> arriba.<br /><br />
          <strong>Script Apps Script:</strong>
          <pre id="apps-script-code">{APPS_SCRIPT}</pre>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-outline" onClick={copiar}>Copiar script</button>
            {copied && <span style={{ color: 'var(--accent2)', fontSize: 12 }}>¡Copiado!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
