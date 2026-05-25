import type { Config } from '../../types';

interface FontSizeSelectorProps {
  value: Config['fontSize'];
  onChange: (size: Config['fontSize']) => void;
}

export function FontSizeSelector({ value, onChange }: FontSizeSelectorProps) {
  const sizes: Config['fontSize'][] = ['normal', 'large', 'xlarge'];
  return (
    <div className="fs-selector">
      {sizes.map((size, i) => (
        <button
          key={size}
          className={`fs-btn${value === size ? ' active' : ''}`}
          onClick={() => onChange(size)}
          style={{ fontSize: [12, 16, 20][i] }}
        >
          A
        </button>
      ))}
    </div>
  );
}
