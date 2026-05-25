import { usePWA } from '../../hooks/usePWA';

export function InstallBanner() {
  const { showBanner, instalar, cerrar } = usePWA();
  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#1c2030', borderTop: '2px solid #4d9de8',
      padding: '14px 20px', zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '12px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/icons/icon-192.png" style={{ width: 40, height: 40, borderRadius: 8 }} alt="icon" />
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#e8eaf0' }}>
            Instalar Control HHEE
          </div>
          <div style={{ fontSize: 11, color: '#6b7194', marginTop: 2 }}>
            Accede sin internet · funciona como app nativa
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={instalar} className="btn btn-primary">Instalar</button>
        <button onClick={cerrar} className="btn btn-outline">✕</button>
      </div>
    </div>
  );
}
