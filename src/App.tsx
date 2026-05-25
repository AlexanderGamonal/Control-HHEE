import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { getPeriodoDeFecha, labelPeriodo, hoy } from './utils/dateUtils';
import { Header } from './components/Header';
import { ConfigPanel } from './components/config/ConfigPanel';
import { SheetsInstructions } from './components/config/SheetsInstructions';
import { AccordionSection } from './components/AccordionSection';
import { RegistroForm } from './components/registro/RegistroForm';
import { ResumenPanel } from './components/resumen/ResumenPanel';
import { HistorialPanel } from './components/historial/HistorialPanel';
import { InstallBanner } from './components/ui/InstallBanner';

type Section = 'registrar' | 'resumen' | 'historial';

export function App() {
  const { config, registros, periodoActivo, setPeriodo } = useAppStore();
  const [configOpen, setConfigOpen]     = useState(false);
  const [openSection, setOpenSection]   = useState<Section>('registrar');
  const [periodoLabel, setPeriodoLabel] = useState('Período actual');

  // Apply saved font size on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-fs', config.fontSize || 'normal');
  }, [config.fontSize]);

  // Init to current period on mount
  useEffect(() => {
    const p = getPeriodoDeFecha(hoy());
    setPeriodo(p);
    setPeriodoLabel(labelPeriodo(p.inicio, p.fin));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const irAPeriodo = (inicio: string, fin: string) => {
    setPeriodo({ inicio, fin });
    setPeriodoLabel(labelPeriodo(inicio, fin));
  };

  const verTodo = () => {
    setPeriodo(null);
    setPeriodoLabel('Todos los registros');
  };

  const toggleSection = (s: Section) =>
    setOpenSection(prev => (prev === s ? prev : s));

  const registrosFiltrados = periodoActivo
    ? registros.filter(r => r.fecha >= periodoActivo.inicio && r.fecha <= periodoActivo.fin)
    : registros;

  return (
    <div className="app">
      <Header onToggleConfig={() => setConfigOpen(o => !o)} configOpen={configOpen} />

      {configOpen && (
        <>
          <ConfigPanel onClose={() => setConfigOpen(false)} />
          <SheetsInstructions />
        </>
      )}

      <AccordionSection
        id="sec-registrar"
        title="Registrar día"
        isOpen={openSection === 'registrar'}
        onToggle={() => toggleSection('registrar')}
      >
        <RegistroForm />
      </AccordionSection>

      <AccordionSection
        id="sec-resumen"
        title="Resumen"
        isOpen={openSection === 'resumen'}
        onToggle={() => toggleSection('resumen')}
      >
        <ResumenPanel
          periodoLabel={periodoLabel}
          onPeriodo={irAPeriodo}
          onVerTodo={verTodo}
        />
      </AccordionSection>

      <AccordionSection
        id="sec-historial"
        title="Historial"
        isOpen={openSection === 'historial'}
        onToggle={() => toggleSection('historial')}
      >
        <HistorialPanel registrosFiltrados={registrosFiltrados} />
      </AccordionSection>

      <InstallBanner />
    </div>
  );
}
