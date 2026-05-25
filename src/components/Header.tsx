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
          <span>25% HHEE netas · ×2 feriados/domingos</span>
          <span>Refrigerio 45min (turno día)</span>
        </div>
      </div>
      <button className="btn-settings" onClick={onToggleConfig}>
        {configOpen ? '✕ Cerrar ajustes' : '⚙️ Ajustes'}
      </button>
    </header>
  );
}
