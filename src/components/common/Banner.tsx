import type { HTMLAttributes, ReactNode } from 'react';
type Props = HTMLAttributes<HTMLDivElement> & { children: ReactNode };
export function Banner({ children, className = '', ...props }: Props) { return <div className={`rounded-control border border-warning-border bg-warning-bg p-3 text-xs leading-5 text-warning ${className}`} role="note" {...props}>{children}</div>; }
