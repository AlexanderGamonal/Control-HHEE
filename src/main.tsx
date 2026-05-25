import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from './App';
import { useAppStore } from './store';

// Migrar datos legacy de la versión HTML (hhee_data / hhee_cfg) al store Zustand
// Solo se ejecuta si el store Zustand aún no existe pero hay datos del HTML anterior
const legacyData = localStorage.getItem('hhee_data');
const legacyCfg  = localStorage.getItem('hhee_cfg');
if ((legacyData || legacyCfg) && !localStorage.getItem('hhee_store')) {
  try {
    if (legacyData) useAppStore.setState({ registros: JSON.parse(legacyData) });
    if (legacyCfg)  useAppStore.setState({ config: JSON.parse(legacyCfg) });
    // Forzar persistencia al store nuevo
    useAppStore.getState().setConfig(useAppStore.getState().config);
  } catch {
    // Si los datos legacy están corruptos, ignorar silenciosamente
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
