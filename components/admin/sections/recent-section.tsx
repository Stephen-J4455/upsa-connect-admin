import { Clock3, LucideIcon } from "lucide-react";

type RecentSectionProps = {
  recentDepartments: string[];
  recentPrograms: string[];
  recentClasses: string[];
  recentCourses: string[];
  recentMaterials: string[];
  recentPosts: string[];
  recentModels: string[];
};

type RecentListProps = {
  title: string;
  items: string[];
  Icon: LucideIcon;
};

function RecentList({ title, items, Icon }: RecentListProps) {
  return (
    <article className="upsa-card animate-rise p-4">
      <h3 className="upsa-title flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--upsa-primary)]"><Icon className="h-4 w-4" />{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2 text-[color:var(--upsa-text-muted)]">No records yet.</li>
        )}
      </ul>
    </article>
  );
}

export default function RecentSection({
  recentDepartments,
  recentPrograms,
  recentClasses,
  recentCourses,
  recentMaterials,
  recentPosts,
  recentModels,
}: RecentSectionProps) {
  return (
    <section id="recent" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <RecentList title="Recent Departments" items={recentDepartments} Icon={Clock3} />
      <RecentList title="Recent Programs" items={recentPrograms} Icon={Clock3} />
      <RecentList title="Recent Classes" items={recentClasses} Icon={Clock3} />
      <RecentList title="Recent Courses" items={recentCourses} Icon={Clock3} />
      <RecentList title="Recent Materials" items={recentMaterials} Icon={Clock3} />
      <RecentList title="Recent Posts" items={recentPosts} Icon={Clock3} />
      <RecentList title="Recent AI Models" items={recentModels} Icon={Clock3} />
    </section>
  );
}
