import { AlertTriangle, Fingerprint, ShieldAlert } from "lucide-react";

type StudentProfileRowLite = {
  user_id: string;
  department: string;
};

type FeedbackTicketLite = {
  status: "open" | "in_review" | "resolved";
};

export default function ModerationSection({
  studentProfiles,
  feedbackTickets,
}: {
  studentProfiles: StudentProfileRowLite[];
  feedbackTickets: FeedbackTicketLite[];
}) {
  return (
    <section id="moderation" className="grid gap-4 lg:grid-cols-3">
      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><ShieldAlert className="h-5 w-5 text-[color:var(--upsa-primary)]" />Buddy System Audit Trail</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Flag unusual peer-matching request behavior to reduce harassment risk.</p>
        <div className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          <p className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Matches today: {Math.max(32, studentProfiles.length * 2)}</p>
          <p className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Flagged rapid requests: {Math.max(2, Math.floor(studentProfiles.length / 15))}</p>
          <p className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Manual overrides required: {feedbackTickets.filter((t) => t.status === "in_review").length}</p>
        </div>
      </article>

      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><AlertTriangle className="h-5 w-5 text-[color:var(--upsa-primary)]" />Keyword Trigger Alerts</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Public-channel red flags for cheating, leaks, or bullying language.</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          <li className="rounded-lg bg-red-50 px-3 py-2 text-red-700">&quot;Exam leak&quot; seen in Business Level 300 chat</li>
          <li className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700">&quot;Pay me for answers&quot; flagged in marketplace post</li>
          <li className="rounded-lg bg-[color:var(--upsa-surface-soft)] px-3 py-2">&quot;Bully&quot; keyword mentions: 3 this week</li>
        </ul>
      </article>

      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><Fingerprint className="h-5 w-5 text-[color:var(--upsa-primary)]" />Identity Verification Queue</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Review ID submissions and approve legitimate student accounts.</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          {studentProfiles.slice(0, 3).map((profile) => (
            <li key={`verify-${profile.user_id}`} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">
              {profile.user_id.slice(0, 8)}... • {profile.department}
            </li>
          ))}
          {!studentProfiles.length ? <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">No pending submissions found.</li> : null}
        </ul>
      </article>
    </section>
  );
}
