import type { ButtonHTMLAttributes, ReactNode } from 'react';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' };
const variants = { primary: 'border-accent bg-accent text-white hover:bg-teal-800', secondary: 'border-border-input bg-card text-text-primary hover:bg-muted', danger: 'border-danger bg-card text-danger hover:bg-red-50' };
export function Button({ children, variant = 'primary', className = '', ...props }: Props) {
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-control border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
