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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
