import { esFeriado, esDomingo, nombreFeriado } from '../../utils/holidays';

interface SpecialDayNoticeProps {
  fecha: string;
  sinCompensacion: boolean;
  onSinCompensacionChange: (v: boolean) => void;
}

export function SpecialDayNotice({ fecha, sinCompensacion, onSinCompensacionChange }: SpecialDayNoticeProps) {
  if (!fecha) return null;

  if (esFeriado(fecha)) {
    return (
      <div className="notice-dia-especial feriado">
        📅 {nombreFeriado(fecha)} — pago doble (×2)
      </div>
    );
  }

  if (esDomingo(fecha)) {
    return (
      <div className="notice-dia-especial dom">
        📅 Domingo —{' '}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={sinCompensacion}
            onChange={e => onSinCompensacionChange(e.target.checked)}
          />
          Sin compensación de descanso (×2)
        </label>
      </div>
    );
  }

  return null;
}
