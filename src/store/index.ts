import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Config, Registro, Periodo } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface AppState {
  config: Config;
  registros: Registro[];
  periodoActivo: Periodo | null;
  setConfig: (cfg: Config) => void;
  saveRegistro: (r: Registro) => void;
  deleteRegistro: (fecha: string) => void;
  clearRegistros: () => void;
  setPeriodo: (p: Periodo | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      registros: [],
      periodoActivo: null,
      setConfig: (config) => set({ config }),
      saveRegistro: (nuevo) =>
        set((state) => {
          const arr = state.registros.filter((r) => r.fecha !== nuevo.fecha);
          return {
            registros: [...arr, nuevo].sort((a, b) => a.fecha.localeCompare(b.fecha)),
          };
        }),
      deleteRegistro: (fecha) =>
        set((state) => ({
          registros: state.registros.filter((r) => r.fecha !== fecha),
        })),
      clearRegistros: () => set({ registros: [] }),
      setPeriodo: (periodoActivo) => set({ periodoActivo }),
    }),
    {
      name: 'hhee_store',
      partialize: (s) => ({ config: s.config, registros: s.registros }),
    }
  )
);
