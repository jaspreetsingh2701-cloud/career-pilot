type Props = { title: string; count?: number; action?: string };
export function SectionHeader({ title, count, action }: Props) { return <div className="flex items-center justify-between gap-2"><h2 className="text-xs font-bold text-text-primary">{title}{count !== undefined ? ` (${count})` : ''}</h2>{action && <span className="text-[11px] font-semibold text-accent">{action}</span>}</div>; }
