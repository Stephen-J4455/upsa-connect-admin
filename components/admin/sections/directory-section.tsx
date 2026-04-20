import type { ComponentType, Dispatch, FormEvent, SetStateAction } from "react";
import { Megaphone, SearchCheck, ShieldUser } from "lucide-react";

type StudentProfileRow = {
  user_id: string;
  department: string;
  program: string;
  class_name: string;
  year: number;
  semester: number;
};

type BroadcastForm = {
  title: string;
  body: string;
  department: string;
  program: string;
  year: number;
  semester: number;
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

type TextAreaProps = {
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

export default function DirectorySection({
  filteredProfiles,
  directoryQuery,
  setDirectoryQuery,
  publishGlobalBroadcast,
  broadcastForm,
  setBroadcastForm,
  broadcastState,
  isSupabaseConfigured,
  departmentOptions,
  statusClass,
  Input,
  TextArea,
  Select,
}: {
  filteredProfiles: StudentProfileRow[];
  directoryQuery: string;
  setDirectoryQuery: (value: string) => void;
  publishGlobalBroadcast: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  broadcastForm: BroadcastForm;
  setBroadcastForm: Dispatch<SetStateAction<BroadcastForm>>;
  broadcastState: UploadState;
  isSupabaseConfigured: boolean;
  departmentOptions: string[];
  statusClass: (state: UploadState) => string;
  Input: ComponentType<InputProps>;
  TextArea: ComponentType<TextAreaProps>;
  Select: ComponentType<SelectProps>;
}) {
  return (
    <section id="directory" className="grid gap-4 lg:grid-cols-3">
      <article className="upsa-card animate-rise p-5 lg:col-span-2">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><SearchCheck className="h-5 w-5 text-[color:var(--upsa-primary)]" />Student and Faculty Directory</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Search, verify IDs, and monitor account safety actions for active users.</p>
        <div className="mt-3">
          <Input label="Find by user id, department, class, or year" value={directoryQuery} onChange={setDirectoryQuery} />
        </div>
        <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
          <ul className="space-y-2">
            {filteredProfiles.length ? (
              filteredProfiles.slice(0, 40).map((profile) => (
                <li key={profile.user_id} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] p-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--upsa-text)]">{profile.user_id.slice(0, 8)}... • {profile.department}</p>
                      <p className="text-xs text-[color:var(--upsa-text-muted)]">{profile.program} • {profile.class_name} • Y{profile.year} S{profile.semester}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="upsa-btn-secondary rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--upsa-primary)]">Verify ID</button>
                      <button type="button" className="upsa-btn-secondary rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--upsa-primary)]">Recover</button>
                      <button type="button" className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700">Ban</button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] p-3 text-sm text-[color:var(--upsa-text-muted)]">No matching users found.</li>
            )}
          </ul>
        </div>
      </article>

      <form onSubmit={publishGlobalBroadcast} className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><Megaphone className="h-5 w-5 text-[color:var(--upsa-primary)]" />Global Content Broadcast</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Publish memos, calendars, and official resources to all or selected cohorts.</p>
        <p className="upsa-chip mt-3 inline-flex"><ShieldUser className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Official announcements only</p>
        <div className="mt-3 space-y-3">
          <Input label="Memo title" value={broadcastForm.title} onChange={(value) => setBroadcastForm((prev) => ({ ...prev, title: value }))} required />
          <TextArea label="Memo body" value={broadcastForm.body} onChange={(value) => setBroadcastForm((prev) => ({ ...prev, body: value }))} required />
          <Select
            label="Department segment"
            value={broadcastForm.department}
            onChange={(value) => setBroadcastForm((prev) => ({ ...prev, department: value }))}
            options={[{ value: "ALL", label: "All departments" }, ...departmentOptions.map((item) => ({ value: item, label: item }))]}
          />
          <Input label="Program segment" value={broadcastForm.program} onChange={(value) => setBroadcastForm((prev) => ({ ...prev, program: value || "ALL" }))} />
        </div>
        <button disabled={broadcastState.busy || !isSupabaseConfigured} className="upsa-btn-primary mt-4 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Publish broadcast</button>
        {broadcastState.message ? <p className={`mt-2 text-sm ${statusClass(broadcastState)}`}>{broadcastState.message}</p> : null}
      </form>
    </section>
  );
}
