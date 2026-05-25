import { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClear: () => void;
}

export function Alert({ message, type, onClear }: AlertProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 3500);
    return () => clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;
  return <div className={`alert alert-${type}`}>{message}</div>;
}

export function useAlert() {
  const [state, setState] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });

  const show = (message: string, type: 'success' | 'error') => setState({ message, type });
  const clear = () => setState((s) => ({ ...s, message: '' }));

  return { alertState: state, show, clear };
}
