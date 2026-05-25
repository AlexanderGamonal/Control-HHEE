import type { ReactNode } from 'react';

interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionSection({ id, title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className={`section${isOpen ? '' : ' collapsed'}`} id={id}>
      <div className="section-header" onClick={onToggle}>
        <div className="dot"></div>
        {title}
        <span className="chevron">▲</span>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
