import type { ComponentType, Dispatch, FormEvent, SetStateAction } from "react";
import { MessageSquarePlus, Store, Vote } from "lucide-react";

type MarketplaceItem = {
  id: string;
  title: string;
  seller: string;
  program: string;
  status: "pending" | "approved" | "rejected";
};

type SurveyForm = {
  question: string;
  optionsCsv: string;
  segment: string;
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

export default function CommunitySection({
  marketplaceItems,
  setMarketplaceStatus,
  deploySurvey,
  surveyForm,
  setSurveyForm,
  surveyState,
  statusClass,
  Input,
}: {
  marketplaceItems: MarketplaceItem[];
  setMarketplaceStatus: (id: string, status: "pending" | "approved" | "rejected") => void;
  deploySurvey: (event: FormEvent<HTMLFormElement>) => void;
  surveyForm: SurveyForm;
  setSurveyForm: Dispatch<SetStateAction<SurveyForm>>;
  surveyState: UploadState;
  statusClass: (state: UploadState) => string;
  Input: ComponentType<InputProps>;
}) {
  return (
    <section id="community" className="grid gap-4 lg:grid-cols-3">
      <article className="upsa-card animate-rise p-5 lg:col-span-2">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><Store className="h-5 w-5 text-[color:var(--upsa-primary)]" />Marketplace Oversight</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Approve or reject pending marketplace listings for compliance.</p>
        <ul className="mt-3 space-y-2">
          {marketplaceItems.map((item) => (
            <li key={item.id} className="rounded-lg border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--upsa-text)]">{item.title}</p>
                  <p className="text-xs text-[color:var(--upsa-text-muted)]">{item.id} • {item.seller} • {item.program}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMarketplaceStatus(item.id, "approved")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Approve</button>
                  <button type="button" onClick={() => setMarketplaceStatus(item.id, "rejected")} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Reject</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <form onSubmit={deploySurvey} className="upsa-card animate-rise p-5">
        <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold"><Vote className="h-5 w-5 text-[color:var(--upsa-primary)]" />Survey and Poll Engine</h2>
        <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">Create quick pulse checks and deploy to selected audiences.</p>
        <p className="upsa-chip mt-3 inline-flex"><MessageSquarePlus className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Community sentiment tracker</p>
        <div className="mt-3 space-y-3">
          <Input label="Question" value={surveyForm.question} onChange={(value) => setSurveyForm((prev) => ({ ...prev, question: value }))} required />
          <Input label="Options (comma separated)" value={surveyForm.optionsCsv} onChange={(value) => setSurveyForm((prev) => ({ ...prev, optionsCsv: value }))} required />
          <Input label="Audience" value={surveyForm.segment} onChange={(value) => setSurveyForm((prev) => ({ ...prev, segment: value }))} />
        </div>
        <button className="upsa-btn-primary mt-4 px-4 py-2 text-sm">Deploy poll</button>
        {surveyState.message ? <p className={`mt-2 text-sm ${statusClass(surveyState)}`}>{surveyState.message}</p> : null}
      </form>
    </section>
  );
}
