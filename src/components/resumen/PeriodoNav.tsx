import { useAppStore } from '../../store';
import { getPeriodoDeFecha, labelPeriodo, hoy } from '../../utils/dateUtils';

interface PeriodoNavProps {
  periodoLabel: string;
  onPeriodo: (inicio: string, fin: string) => void;
  onVerTodo: () => void;
}

export function PeriodoNav({ periodoLabel, onPeriodo, onVerTodo }: PeriodoNavProps) {
  const { periodoActivo } = useAppStore();

  const navegar = (delta: number) => {
    const ref = periodoActivo ? periodoActivo.inicio : hoy();
    const [y, m] = ref.split('-').map(Number);
    let nM = m + delta, nY = y;
    if (nM > 12) { nM = 1; nY++; }
    if (nM < 1)  { nM = 12; nY--; }
    const p = getPeriodoDeFecha(`${nY}-${String(nM).padStart(2, '0')}-16`);
    onPeriodo(p.inicio, p.fin);
  };

  const irAHoy = () => {
    const p = getPeriodoDeFecha(hoy());
    onPeriodo(p.inicio, p.fin);
  };

  return (
    <div className="periodo-nav">
      <button className="btn btn-outline icon-btn" onClick={() => navegar(-1)}>◀</button>
      <button className="btn btn-outline periodo-btn" onClick={irAHoy}>
        <span id="periodo-label">{periodoLabel}</span>
      </button>
      <button className="btn btn-outline icon-btn" onClick={() => navegar(1)}>▶</button>
      <button className="btn btn-outline" onClick={onVerTodo}>Todo</button>
    </div>
  );
}

export function getPeriodoLabel(inicio: string, fin: string): string {
  return labelPeriodo(inicio, fin);
}
