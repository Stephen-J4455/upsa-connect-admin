"use client";

import { useMemo } from "react";
import { Activity, Bot, ChartNoAxesColumnIncreasing, DatabaseZap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  usd: number;
};

type ProgramDistributionPoint = {
  program: string;
  students: number;
};

type CatalogCoveragePoint = {
  department: string;
  programs: number;
  classes: number;
  courses: number;
};

const MATERIAL_COLORS = ["#f2c659", "#7ab8ff", "#4b8dd9", "#9ac8ff"];
const CHART_GRID = "rgba(171, 195, 223, 0.18)";
const CHART_TICK = "#abc3df";

export default function AnalyticsSection({
  materialTypeCounts,
  estimatedTokenUsage,
  topProgramDistribution,
  catalogCoverage,
}: {
  materialTypeCounts: Record<string, number>;
  estimatedTokenUsage: TokenUsage;
  topProgramDistribution: ProgramDistributionPoint[];
  catalogCoverage: CatalogCoveragePoint[];
}) {
  const materialMixData = useMemo(() => {
    const entries = [
      { name: "Slides", value: materialTypeCounts.slide || 0 },
      { name: "Notes", value: materialTypeCounts.note || 0 },
      { name: "Images", value: materialTypeCounts.image || 0 },
    ];

    const total = entries.reduce((sum, entry) => sum + entry.value, 0);
    return total > 0 ? entries : [{ name: "No data", value: 1 }];
  }, [materialTypeCounts.image, materialTypeCounts.note, materialTypeCounts.slide]);

  const tokenBreakdownData = useMemo(
    () => [
      { name: "Prompt", tokens: estimatedTokenUsage.promptTokens },
      { name: "Completion", tokens: estimatedTokenUsage.completionTokens },
    ],
    [estimatedTokenUsage.completionTokens, estimatedTokenUsage.promptTokens],
  );

  return (
    <section id="analytics" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="upsa-card animate-rise p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--upsa-text-muted)]">
            Total Tokens
          </p>
          <p className="upsa-title mt-2 text-2xl font-semibold text-[color:var(--upsa-primary)]">
            {estimatedTokenUsage.totalTokens.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">Model usage this window</p>
        </article>

        <article className="upsa-card animate-rise p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--upsa-text-muted)]">
            Estimated Spend
          </p>
          <p className="upsa-title mt-2 text-2xl font-semibold text-[color:var(--upsa-primary)]">
            ${estimatedTokenUsage.usd.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">Current cost projection</p>
        </article>

        <article className="upsa-card animate-rise p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--upsa-text-muted)]">
            Program Coverage
          </p>
          <p className="upsa-title mt-2 text-2xl font-semibold text-[color:var(--upsa-primary)]">
            {catalogCoverage.reduce((sum, item) => sum + item.programs, 0)}
          </p>
          <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">Distinct program scope rows</p>
        </article>

        <article className="upsa-card animate-rise p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--upsa-text-muted)]">
            Student Program Signals
          </p>
          <p className="upsa-title mt-2 text-2xl font-semibold text-[color:var(--upsa-primary)]">
            {topProgramDistribution.reduce((sum, item) => sum + item.students, 0)}
          </p>
          <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">Profiles represented</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold">
            <DatabaseZap className="h-5 w-5 text-[color:var(--upsa-primary)]" />
            Catalog Coverage by Department
          </h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
            Programs, classes, and courses currently configured in admin catalog tables.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catalogCoverage} margin={{ left: -10, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="department" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #275283",
                    backgroundColor: "#072347",
                    color: "#eef5ff",
                  }}
                  cursor={{ fill: "rgba(122,184,255,0.08)" }}
                />
                <Legend wrapperStyle={{ color: "#abc3df" }} />
                <Bar dataKey="programs" fill="#f2c659" radius={[6, 6, 0, 0]} />
                <Bar dataKey="classes" fill="#7ab8ff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="courses" fill="#4b8dd9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold">
            <ChartNoAxesColumnIncreasing className="h-5 w-5 text-[color:var(--upsa-primary)]" />
            Material Type Mix
          </h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
            Distribution of uploaded materials by type.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialMixData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={102}
                  innerRadius={56}
                  paddingAngle={4}
                >
                  {materialMixData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #275283",
                    backgroundColor: "#072347",
                    color: "#eef5ff",
                  }}
                />
                <Legend wrapperStyle={{ color: "#abc3df" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold">
            <Bot className="h-5 w-5 text-[color:var(--upsa-primary)]" />
            Token Consumption Breakdown
          </h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
            Prompt versus completion usage split for AI interactions.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenBreakdownData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString()}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #275283",
                    backgroundColor: "#072347",
                    color: "#eef5ff",
                  }}
                />
                <Bar dataKey="tokens" fill="#f2c659" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="upsa-card animate-rise p-5">
          <h2 className="upsa-title flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-5 w-5 text-[color:var(--upsa-primary)]" />
            Top Program Activity
          </h2>
          <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
            Most represented programs based on student profile activity.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProgramDistribution}
                layout="vertical"
                margin={{ left: 28, right: 10, top: 6, bottom: 2 }}
              >
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART_TICK, fontSize: 12 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="program"
                  tick={{ fill: CHART_TICK, fontSize: 12 }}
                  width={126}
                />
                <Tooltip
                  formatter={(value: number) => `${value} students`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #275283",
                    backgroundColor: "#072347",
                    color: "#eef5ff",
                  }}
                />
                <Bar dataKey="students" fill="#7ab8ff" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
