import type { InputHTMLAttributes } from 'react';
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };
export function TextInput({ label, id, className = '', ...props }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <label className="block space-y-1.5 text-xs font-semibold text-text-secondary" htmlFor={inputId}>{label}<input id={inputId} className={`min-h-11 w-full rounded-control border border-border-input bg-card px-3 text-sm font-normal text-text-primary placeholder:text-text-secondary/70 disabled:bg-disabled ${className}`} {...props} /></label>;
}
