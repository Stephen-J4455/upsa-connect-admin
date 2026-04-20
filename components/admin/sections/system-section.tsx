import type { ComponentType, Dispatch, FormEvent, SetStateAction } from "react";
import { BellRing, Bug, HeartPulse, LockKeyhole, ShieldUser, SmartphoneNfc } from "lucide-react";

type NotificationForm = {
  title: string;
  body: string;
  segment: string;
  priority: "normal" | "high" | "critical";
};

type VersionControlForm = {
  minimumVersion: string;
  reason: string;
  forceUpdate: boolean;
};

type RoleGrantForm = {
  email: string;
  role: "super_admin" | "department_admin" | "moderator";
  department: string;
};

type FeedbackTicket = {
  id: string;
  student: string;
  type: "bug" | "feature";
  message: string;
  status: "open" | "in_review" | "resolved";
};

type UploadState = {
  busy: boolean;
  message: string;
  kind: "success" | "error" | "idle";
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export default function SystemSection({
  queueNotification,
  notificationForm,
  setNotificationForm,
  notificationState,
  recentPosts,
  recentMaterials,
  saveVersionRule,
  versionControlForm,
  setVersionControlForm,
  versionControlState,
  grantRole,
  roleGrantForm,
  setRoleGrantForm,
  roleGrantState,
  roleAssignments,
  departmentOptions,
  feedbackTickets,
  setFeedbackStatus,
  statusClass,
  Input,
  Select,
  TextArea,
}: {
  queueNotification: (event: FormEvent<HTMLFormElement>) => void;
  notificationForm: NotificationForm;
  setNotificationForm: Dispatch<SetStateAction<NotificationForm>>;
  notificationState: UploadState;
  recentPosts: string[];
  recentMaterials: string[];
  saveVersionRule: (event: FormEvent<HTMLFormElement>) => void;
  versionControlForm: VersionControlForm;
  setVersionControlForm: Dispatch<SetStateAction<VersionControlForm>>;
  versionControlState: UploadState;
  grantRole: (event: FormEvent<HTMLFormElement>) => void;
  roleGrantForm: RoleGrantForm;
  setRoleGrantForm: Dispatch<SetStateAction<RoleGrantForm>>;
  roleGrantState: UploadState;
  roleAssignments: Array<{ email: string; role: RoleGrantForm["role"]; department: string }>;
  departmentOptions: string[];
  feedbackTickets: FeedbackTicket[];
  setFeedbackStatus: (id: string, status: "open" | "in_review" | "resolved") => void;
  statusClass: (state: UploadState) => string;
  Input: ComponentType<InputProps>;
  Select: ComponentType<SelectProps>;
  TextArea: ComponentType<TextAreaProps>;
}) {
  return (
    <>
      <section id="system" className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={queueNotification} className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><BellRing className="h-5 w-5 text-[color:var(--upsa-primary)]" />Notification Center</h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Send alerts for emergencies, app updates, and university-wide events.</p>
          <div className="mt-3 space-y-3">
            <Input label="Notification title" value={notificationForm.title} onChange={(value) => setNotificationForm((prev) => ({ ...prev, title: value }))} required />
            <TextArea label="Message" value={notificationForm.body} onChange={(value) => setNotificationForm((prev) => ({ ...prev, body: value }))} required />
            <Input label="Audience segment" value={notificationForm.segment} onChange={(value) => setNotificationForm((prev) => ({ ...prev, segment: value }))} />
            <Select
              label="Priority"
              value={notificationForm.priority}
              onChange={(value) => setNotificationForm((prev) => ({ ...prev, priority: value as NotificationForm["priority"] }))}
              options={[
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>
          <button className="upsa-btn-primary mt-4 px-4 py-2 text-sm">Queue notification</button>
          {notificationState.message ? <p className={`mt-2 text-sm ${statusClass(notificationState)}`}>{notificationState.message}</p> : null}
        </form>

        <div className="space-y-4">
          <article className="upsa-card animate-rise p-5">
            <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><HeartPulse className="h-5 w-5 text-[color:var(--upsa-primary)]" />System Health and Storage</h2>
            <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Realtime controls for uptime, load, and storage pressure.</p>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
              <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">App uptime: 99.94%</li>
              <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Database load: {Math.max(18, recentPosts.length)} concurrent ops/min</li>
              <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Storage usage: {(recentMaterials.length * 42).toLocaleString()} MB (estimated)</li>
              <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Average upload speed: 11.8 MB/s</li>
            </ul>
          </article>

          <form onSubmit={saveVersionRule} className="upsa-card animate-rise p-5">
            <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><SmartphoneNfc className="h-5 w-5 text-[color:var(--upsa-primary)]" />Version Control Manager</h2>
            <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Force security updates by setting minimum allowed app versions.</p>
            <div className="mt-3 space-y-3">
              <Input label="Minimum version" value={versionControlForm.minimumVersion} onChange={(value) => setVersionControlForm((prev) => ({ ...prev, minimumVersion: value }))} required />
              <Input label="Reason" value={versionControlForm.reason} onChange={(value) => setVersionControlForm((prev) => ({ ...prev, reason: value }))} required />
              <label className="inline-flex items-center gap-2 text-sm text-[color:var(--upsa-text)]">
                <input type="checkbox" checked={versionControlForm.forceUpdate} onChange={(event) => setVersionControlForm((prev) => ({ ...prev, forceUpdate: event.target.checked }))} />
                Require immediate update
              </label>
            </div>
            <button className="upsa-btn-primary mt-4 px-4 py-2 text-sm">Save policy</button>
            {versionControlState.message ? <p className={`mt-2 text-sm ${statusClass(versionControlState)}`}>{versionControlState.message}</p> : null}
          </form>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={grantRole} className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><LockKeyhole className="h-5 w-5 text-[color:var(--upsa-primary)]" />Role-Based Access Control</h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Assign scope-limited admin roles per faculty and operational responsibility.</p>
          <div className="mt-3 space-y-3">
            <Input label="Admin email" value={roleGrantForm.email} onChange={(value) => setRoleGrantForm((prev) => ({ ...prev, email: value }))} required />
            <Select
              label="Role"
              value={roleGrantForm.role}
              onChange={(value) => setRoleGrantForm((prev) => ({ ...prev, role: value as RoleGrantForm["role"] }))}
              options={[
                { value: "super_admin", label: "Super Admin" },
                { value: "department_admin", label: "Department Admin" },
                { value: "moderator", label: "Moderator" },
              ]}
            />
            <Select
              label="Department scope"
              value={roleGrantForm.department}
              onChange={(value) => setRoleGrantForm((prev) => ({ ...prev, department: value }))}
              options={departmentOptions.map((item) => ({ value: item, label: item }))}
            />
          </div>
          <button className="upsa-btn-primary mt-4 px-4 py-2 text-sm">Grant role</button>
          {roleGrantState.message ? <p className={`mt-2 text-sm ${statusClass(roleGrantState)}`}>{roleGrantState.message}</p> : null}
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
            {roleAssignments.length ? roleAssignments.slice(0, 4).map((assignment) => (
              <li key={`${assignment.email}-${assignment.role}-${assignment.department}`} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">
                {assignment.email} • {assignment.role} • {assignment.department}
              </li>
            )) : <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">No role assignments yet.</li>}
          </ul>
        </form>

        <article className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><Bug className="h-5 w-5 text-[color:var(--upsa-primary)]" />Feedback Loop</h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Review bug reports and feature requests from students, then triage quickly.</p>
          <p className="upsa-chip mt-3 inline-flex"><ShieldUser className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Moderation audit enabled</p>
          <ul className="mt-3 space-y-2">
            {feedbackTickets.map((ticket) => (
              <li key={ticket.id} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
                <p className="text-sm font-semibold text-[color:var(--upsa-text)]">{ticket.id} • {ticket.student}</p>
                <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">{ticket.type.toUpperCase()}: {ticket.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setFeedbackStatus(ticket.id, "in_review")} className="upsa-btn-secondary rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--upsa-primary)]">In review</button>
                  <button type="button" onClick={() => setFeedbackStatus(ticket.id, "resolved")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Resolve</button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
