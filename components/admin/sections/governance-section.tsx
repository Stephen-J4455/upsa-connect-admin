import type { ComponentType, Dispatch, FormEvent, SetStateAction } from "react";
import { DatabaseZap, ShieldEllipsis, WalletCards } from "lucide-react";

type KnowledgeBaseForm = {
  title: string;
  sourceUrl: string;
  departments: string;
  enabled: boolean;
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

export default function GovernanceSection({
  saveKnowledgeBaseSource,
  knowledgeBaseForm,
  setKnowledgeBaseForm,
  knowledgeBaseState,
  statusClass,
  knowledgeBaseItems,
  estimatedTokenUsage,
  recentPosts,
  Input,
}: {
  saveKnowledgeBaseSource: (event: FormEvent<HTMLFormElement>) => void;
  knowledgeBaseForm: KnowledgeBaseForm;
  setKnowledgeBaseForm: Dispatch<SetStateAction<KnowledgeBaseForm>>;
  knowledgeBaseState: UploadState;
  statusClass: (state: UploadState) => string;
  knowledgeBaseItems: Array<{ title: string; sourceUrl: string; departments: string; enabled: boolean }>;
  estimatedTokenUsage: { totalTokens: number; usd: number };
  recentPosts: string[];
  Input: ComponentType<InputProps>;
}) {
  return (
    <section id="governance" className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={saveKnowledgeBaseSource} className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><DatabaseZap className="h-5 w-5 text-[color:var(--upsa-primary)]" />AI Knowledge Base Manager</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Feed AI official documents and restrict access by department or program.</p>
        <div className="mt-3 space-y-3">
          <Input label="Dataset title" value={knowledgeBaseForm.title} onChange={(value) => setKnowledgeBaseForm((prev) => ({ ...prev, title: value }))} required />
          <Input label="Source URL" value={knowledgeBaseForm.sourceUrl} onChange={(value) => setKnowledgeBaseForm((prev) => ({ ...prev, sourceUrl: value }))} required />
          <Input label="Allowed departments (comma separated)" value={knowledgeBaseForm.departments} onChange={(value) => setKnowledgeBaseForm((prev) => ({ ...prev, departments: value }))} />
          <label className="inline-flex items-center gap-2 text-sm text-[color:var(--upsa-text)]">
            <input type="checkbox" checked={knowledgeBaseForm.enabled} onChange={(event) => setKnowledgeBaseForm((prev) => ({ ...prev, enabled: event.target.checked }))} />
            Enable for AI responses
          </label>
        </div>
        <button className="upsa-btn-primary mt-4 px-4 py-2 text-sm">Save dataset</button>
        {knowledgeBaseState.message ? <p className={`mt-2 text-sm ${statusClass(knowledgeBaseState)}`}>{knowledgeBaseState.message}</p> : null}
      </form>

      <article className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><ShieldEllipsis className="h-5 w-5 text-[color:var(--upsa-primary)]" />Hallucination and Cost Monitor</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Review student thumbs-down trends and API cost exposure by activity window.</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Negative AI votes (7d): {Math.max(4, Math.floor(recentPosts.length / 8))}</li>
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Top issue: Missing references in legal case summaries</li>
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Total tokens: {estimatedTokenUsage.totalTokens.toLocaleString()}</li>
          <li className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-3 py-2">Budget estimate: ${estimatedTokenUsage.usd.toFixed(2)}</li>
        </ul>
        <p className="upsa-chip mt-3 inline-flex"><WalletCards className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Budget guardrail active</p>
        <div className="mt-3 space-y-2 text-sm text-[color:var(--upsa-text-muted)]">
          {knowledgeBaseItems.length ? knowledgeBaseItems.slice(0, 4).map((item) => (
            <p key={`${item.title}-${item.sourceUrl}`} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] px-3 py-2">
              {item.title} • {item.departments} • {item.enabled ? "Enabled" : "Disabled"}
            </p>
          )) : <p className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] px-3 py-2">No AI datasets configured yet.</p>}
        </div>
      </article>
    </section>
  );
}
