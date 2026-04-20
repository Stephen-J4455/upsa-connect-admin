import { AlertCircle, BarChart3, BookDashed } from "lucide-react";

export default function AcademicSection({
  atRiskCount,
  topPrograms,
}: {
  atRiskCount: number;
  topPrograms: Array<[string, number]>;
}) {
  return (
    <section id="academic" className="grid gap-4 lg:grid-cols-3">
      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><AlertCircle className="h-5 w-5 text-[color:var(--upsa-primary)]" />At-Risk Student Identification</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Students inactive for at least 14 days based on profile updates.</p>
        <p className="mt-3 text-3xl font-semibold text-[color:var(--upsa-primary)]">{atRiskCount}</p>
        <p className="text-sm text-[color:var(--upsa-text-muted)]">Recommended outreach list for faculty advisors.</p>
      </article>

      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><BarChart3 className="h-5 w-5 text-[color:var(--upsa-primary)]" />Content Popularity Heatmap</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Most active programs by enrolled dashboard profiles.</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          {topPrograms.length ? topPrograms.map(([program, count]) => (
            <li key={program} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">{program}: {count} active students</li>
          )) : <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">No profile data available.</li>}
        </ul>
      </article>

      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><BookDashed className="h-5 w-5 text-[color:var(--upsa-primary)]" />Resource Gap Analysis</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Need-to-upload topics inferred from unanswered academic queries.</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">&quot;Corporate Finance 401 worked examples&quot;</li>
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">&quot;Auditing practicum slide deck&quot;</li>
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">&quot;Business Law exam structure guide&quot;</li>
        </ul>
      </article>
    </section>
  );
}
