interface HeaderProps {
  onToggleConfig: () => void;
  configOpen: boolean;
}

export function Header({ onToggleConfig, configOpen }: HeaderProps) {
  return (
    <header>
      <div className="header-left">
        <h1>Control de <span>HHEE</span></h1>
        <div className="header-meta">
          <span>Cálculo por período 16–15</span>
          <span>HHEE ≤52h ×1.25 · &gt;52h ×1.35 · Feriados/desc. ×2</span>
          <span>Refrigerio 45min (turno día) · Eco Romeo: sin descuento</span>
        </div>
      </div>
      <button className="btn-settings" onClick={onToggleConfig}>
        {configOpen ? '✕ Cerrar ajustes' : '⚙️ Ajustes'}
      </button>
    </header>
  );
}
