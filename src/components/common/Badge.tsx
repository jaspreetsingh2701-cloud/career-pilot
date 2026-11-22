import type { ReactNode } from 'react';
type Props = { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' };
const tones = { neutral: 'bg-disabled text-text-secondary', success: 'bg-success-bg text-success', warning: 'bg-warning-bg text-warning', danger: 'bg-red-50 text-danger' };
export function Badge({ children, tone = 'neutral' }: Props) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>; }
