import type { ReactNode } from 'react';
type Props = { label: string; value?: string; status?: ReactNode };
export function FieldRow({ label, value, status }: Props) {
  return <div className="flex min-h-[52px] items-center gap-3 border-b border-border py-2 last:border-b-0"><span className="h-5 w-5 shrink-0 rounded border border-border-input" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-[11px] text-text-secondary">{label}</p>{value && <p className="truncate text-sm font-semibold text-text-primary">{value}</p>}</div>{status}</div>;
}
