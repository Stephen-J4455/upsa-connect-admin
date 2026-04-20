import { BookMarked, Building2, BrainCircuit, FolderKanban, LucideIcon } from "lucide-react";

type Metric = {
  title: string;
  value: string;
  subtitle: string;
};

const METRIC_ICONS: Record<string, LucideIcon> = {
  Departments: Building2,
  Programs: BookMarked,
  Materials: FolderKanban,
  "AI Models": BrainCircuit,
};

export default function OverviewMetricsSection({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = METRIC_ICONS[metric.title] ?? Building2;

        return (
          <article key={metric.title} className="upsa-card animate-rise p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--upsa-text-muted)]">
                {metric.title}
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--upsa-primary)]/15 text-[color:var(--upsa-primary)] ring-1 ring-[color:var(--upsa-border)]">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="upsa-title mt-2 text-3xl font-semibold text-[color:var(--upsa-primary)]">{metric.value}</p>
            <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">{metric.subtitle}</p>
          </article>
        );
      })}
    </div>
  );
}
