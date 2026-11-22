import type { ButtonHTMLAttributes, ReactNode } from 'react';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; selected?: boolean };
export function Chip({ children, selected = false, className = '', ...props }: Props) {
  return <button className={`min-h-11 rounded-full border px-3 text-xs font-semibold focus-visible:outline-offset-2 ${selected ? 'border-accent bg-accent text-white' : 'border-border-input bg-card text-text-secondary hover:bg-muted'} ${className}`} aria-pressed={selected} {...props}>{children}</button>;
}
