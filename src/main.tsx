import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from './App';
import { useAppStore } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';

// Desregistrar service workers antiguos (hhee-v*) que pueden bloquear los assets del build React
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => {
      reg.active?.scriptURL.includes('workbox') || reg.unregister();
    });
  });
}

// Migrar datos legacy de la versión HTML (hhee_data / hhee_cfg) al store Zustand
try {
  const legacyData = localStorage.getItem('hhee_data');
  const legacyCfg  = localStorage.getItem('hhee_cfg');
  if ((legacyData || legacyCfg) && !localStorage.getItem('hhee_store')) {
    if (legacyData) useAppStore.setState({ registros: JSON.parse(legacyData) });
    if (legacyCfg)  useAppStore.setState({ config: JSON.parse(legacyCfg) });
    useAppStore.getState().setConfig(useAppStore.getState().config);
  }
} catch {
  // localStorage no disponible o datos legacy corruptos — continuar con estado vacío
}

// Migrar config v1 (sueldo/aplicaAF/valorAF) → v2 (historialTarifas)
try {
  const raw = localStorage.getItem('hhee_store');
  if (raw) {
    const stored = JSON.parse(raw) as { state?: { config?: Record<string, unknown> } };
    const cfg = stored?.state?.config;
    if (cfg && typeof cfg['sueldo'] === 'number' && !Array.isArray(cfg['historialTarifas'])) {
      const montoSueldo = (cfg['sueldo'] as number) || 0;
      const aplicaAF    = !!(cfg['aplicaAF'] as boolean);
      const valorAF     = (cfg['valorAF'] as number) || 102.5;
      const migratedConfig = {
        historialTarifas: montoSueldo > 0
          ? [{ montoSueldo, montoAsignacionFamiliar: aplicaAF ? valorAF : 0, fechaVigenciaDesde: '2020-01-16' }]
          : [],
        url:           (cfg['url'] as string)  || '',
        fontSize:      (cfg['fontSize'] as 'normal' | 'large' | 'xlarge') || 'normal',
        jornadaSemanal:(cfg['jornadaSemanal'] as number) || 48,
        autoSync:      !!(cfg['autoSync'] as boolean),
      };
      stored.state!.config = migratedConfig;
      localStorage.setItem('hhee_store', JSON.stringify(stored));
      useAppStore.setState({ config: migratedConfig });
    }
  }
} catch {
  // ignore migration errors
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
