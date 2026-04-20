"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  BadgeCheck,
  BellRing,
  Landmark,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import appLogo from "@/assets/icon.png";

const OverviewMetricsSection = dynamic(
  () => import("@/components/admin/sections/overview-metrics-section"),
);
const AnalyticsSection = dynamic(
  () => import("@/components/admin/sections/analytics-section"),
);
const ModerationSection = dynamic(
  () => import("@/components/admin/sections/moderation-section"),
);
const AcademicSection = dynamic(
  () => import("@/components/admin/sections/academic-section"),
);
const RecentSection = dynamic(
  () => import("@/components/admin/sections/recent-section"),
);
const DirectorySection = dynamic(
  () => import("@/components/admin/sections/directory-section"),
);
const GovernanceSection = dynamic(
  () => import("@/components/admin/sections/governance-section"),
);
const CommunitySection = dynamic(
  () => import("@/components/admin/sections/community-section"),
);
const SystemSection = dynamic(
  () => import("@/components/admin/sections/system-section"),
);
const CatalogSuiteSection = dynamic(
  () => import("@/components/admin/sections/catalog-suite-section"),
);

type ScopeFields = {
  department: string;
  program: string;
  className: string;
  year: number;
  semester: number;
};

type DepartmentForm = {
  name: string;
  code: string;
  school: string;
};

type ProgramForm = {
  department: string;
  program: string;
  description: string;
};

type ClassForm = {
  department: string;
  program: string;
  className: string;
};

type CourseForm = {
  department: string;
  program: string;
  className: string;
  year: number;
  semester: number;
  courseCode: string;
  courseTitle: string;
  credits: number;
};

type MaterialForm = ScopeFields & {
  materialType: "slide" | "note" | "image";
  title: string;
};

type NewsForm = ScopeFields & {
  title: string;
  body: string;
};

type AIModelForm = {
  provider: "huggingface";
  modelId: string;
  label: string;
  setActive: boolean;
};

type AIModelOption = {
  modelId: string;
  label: string;
  isActive: boolean;
};

type ProgramCatalogRow = {
  id: string;
  program_code: string;
  program_name: string;
  department: string;
  year: number;
  semester: number;
  description: string | null;
};

type DepartmentCatalogRow = {
  id: string;
  name: string;
  code: string | null;
  school: string | null;
  created_at: string | null;
};

type ClassCatalogRow = {
  id: string;
  class_name: string;
  program_name: string;
  department: string;
  year: number;
  semester: number;
};

type CourseCatalogRow = {
  id: string;
  department: string;
  program_name: string;
  class_name: string;
  course_code: string;
  course_title: string;
  credits: number;
  year: number;
  semester: number;
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

type StudentProfileRow = {
  user_id: string;
  department: string;
  program: string;
  class_name: string;
  year: number;
  semester: number;
  updated_at: string;
  created_at: string;
};

type BroadcastForm = {
  title: string;
  body: string;
  department: string;
  program: string;
  year: number;
  semester: number;
};

type NotificationForm = {
  title: string;
  body: string;
  segment: string;
  priority: "normal" | "high" | "critical";
};

type KnowledgeBaseForm = {
  title: string;
  sourceUrl: string;
  departments: string;
  enabled: boolean;
};

type VersionControlForm = {
  minimumVersion: string;
  reason: string;
  forceUpdate: boolean;
};

type SurveyForm = {
  question: string;
  optionsCsv: string;
  segment: string;
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

type MarketplaceItem = {
  id: string;
  title: string;
  seller: string;
  program: string;
  status: "pending" | "approved" | "rejected";
};

type UploadState = {
  busy: boolean;
  message: string;
  kind: "success" | "error" | "idle";
};

type NavIconName =
  | "overview"
  | "departments"
  | "catalog"
  | "materials"
  | "news"
  | "ai"
  | "recent"
  | "directory"
  | "analytics"
  | "moderation"
  | "system"
  | "governance"
  | "academic"
  | "community";

type NavItem = {
  id: string;
  label: string;
  icon: NavIconName;
};

export type AdminPageId =
  | "overview"
  | "directory"
  | "departments"
  | "catalog"
  | "materials"
  | "news"
  | "analytics"
  | "moderation"
  | "governance"
  | "academic"
  | "community"
  | "system"
  | "ai-models"
  | "recent";

const DEFAULT_DEPARTMENTS = [
  "Accounting",
  "Marketing",
  "Information Technology",
  "Economics",
  "Law",
];

const REQUIRED_PUBLIC_TABLES = [
  "department_catalog",
  "program_catalog",
  "class_catalog",
  "course_catalog",
  "learning_materials",
  "campus_posts",
  "ai_models",
  "student_profiles",
] as const;

const semesters = [1, 2];
const years = [1, 2, 3, 4];
const DEFAULT_CATALOG_YEAR = 1;
const DEFAULT_CATALOG_SEMESTER = 1;
const GENERAL_CLASS_NAME = "GENERAL";
const ALL_DEPARTMENTS_VALUE = "ALL";
const GENERAL_PROGRAM_NAME = "General";

const INITIAL_FEEDBACK_TICKETS: FeedbackTicket[] = [
  {
    id: "FB-1021",
    student: "BSc IT • Level 300",
    type: "bug",
    message: "Slide downloads occasionally fail on weak network.",
    status: "open",
  },
  {
    id: "FB-1022",
    student: "BCom Marketing • Level 400",
    type: "feature",
    message: "Add per-course revision reminders before exams.",
    status: "in_review",
  },
  {
    id: "FB-1023",
    student: "LLB • Level 200",
    type: "bug",
    message: "Dark text is hard to read in timetable cards.",
    status: "open",
  },
];

const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: "MK-220", title: "ACCT 302 printed handout", seller: "@akwaa", program: "Accounting", status: "pending" },
  { id: "MK-221", title: "Laptop rental for exam week", seller: "@joseph", program: "Information Technology", status: "pending" },
  { id: "MK-222", title: "Marketing capstone tutoring", seller: "@nana", program: "Marketing", status: "pending" },
];

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "directory", label: "Directory", icon: "directory" },
  { id: "departments", label: "Departments", icon: "departments" },
  { id: "catalog", label: "Catalog", icon: "catalog" },
  { id: "materials", label: "Materials", icon: "materials" },
  { id: "news", label: "News", icon: "news" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "moderation", label: "Moderation", icon: "moderation" },
  { id: "governance", label: "AI Governance", icon: "governance" },
  { id: "academic", label: "Academic Signals", icon: "academic" },
  { id: "community", label: "Community", icon: "community" },
  { id: "system", label: "System", icon: "system" },
  { id: "ai-models", label: "AI Models", icon: "ai" },
  { id: "recent", label: "Recent", icon: "recent" },
];

const NAV_PATHS: Record<AdminPageId, string> = {
  overview: "/",
  directory: "/directory",
  departments: "/departments",
  catalog: "/catalog",
  materials: "/materials",
  news: "/news",
  analytics: "/analytics",
  moderation: "/moderation",
  governance: "/governance",
  academic: "/academic",
  community: "/community",
  system: "/system",
  "ai-models": "/ai-models",
  recent: "/recent",
};

const defaultScope: ScopeFields = {
  department: "",
  program: "",
  className: "",
  year: DEFAULT_CATALOG_YEAR,
  semester: DEFAULT_CATALOG_SEMESTER,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTimestampedPath(
  fileName: string,
  scope: ScopeFields,
  section: string,
) {
  const safeName = fileName.replace(/\s+/g, "-");
  const stamp = Date.now();
  return `${scope.year}/sem-${scope.semester}/${slugify(scope.department)}/${slugify(
    scope.program,
  )}/${slugify(scope.className)}/${section}/${stamp}-${safeName}`;
}

function emptyState(): UploadState {
  return { busy: false, message: "", kind: "idle" };
}

function statusClass(state: UploadState) {
  if (state.kind === "error") return "text-red-300";
  if (state.kind === "success") return "text-emerald-300";
  return "text-[color:var(--upsa-text-muted)]";
}

async function detectMissingCatalogTables() {
  const results = await Promise.all(
    REQUIRED_PUBLIC_TABLES.map(async (tableName) => {
      const { error } = await supabase
        .from(tableName)
        .select("id", { head: true, count: "exact" })
        .limit(1);

      if (!error) {
        return null;
      }

      const message = String(error.message ?? "").toLowerCase();
      if (error.code === "PGRST205" || message.includes("could not find the table")) {
        return tableName;
      }

      return null;
    }),
  );

  return results.filter((tableName): tableName is (typeof REQUIRED_PUBLIC_TABLES)[number] =>
    Boolean(tableName),
  );
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeScope(scope: ScopeFields): ScopeFields {
  return {
    department: normalizeText(scope.department),
    program: normalizeText(scope.program),
    className: normalizeText(scope.className),
    year: scope.year,
    semester: scope.semester,
  };
}

function normalizeProgramCode(value: string) {
  return normalizeText(value).toUpperCase();
}

function normalizeCourseCode(value: string) {
  return normalizeText(value).toUpperCase();
}

function buildProgramCode(programName: string, department: string) {
  const normalizedName = normalizeText(programName);
  const normalizedDepartment = normalizeText(department);
  const words = normalizedName.split(" ").filter(Boolean);
  const departmentWords = normalizedDepartment.split(" ").filter(Boolean);
  const initials = words
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  const departmentInitials = departmentWords
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  const compact = normalizedName.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const deptBase = departmentInitials || "GEN";
  const base = initials || compact.slice(0, 8) || "PROGRAM";
  return `${deptBase}-${base}`;
}

let cachedAdminSession: Session | null | undefined;

export default function AdminDashboard({ page }: { page: AdminPageId }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(cachedAdminSession ?? null);
  const [authLoading, setAuthLoading] = useState(
    isSupabaseConfigured && cachedAdminSession === undefined,
  );
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [schemaCheckDone, setSchemaCheckDone] = useState(false);
  const [missingSchemaTables, setMissingSchemaTables] = useState<string[]>([]);
  const [schemaCheckError, setSchemaCheckError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(page);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [departmentForm, setDepartmentForm] = useState<DepartmentForm>({
    name: "",
    code: "",
    school: "",
  });

  const [programForm, setProgramForm] = useState<ProgramForm>({
    department: "",
    program: "",
    description: "",
  });
  const [classForm, setClassForm] = useState<ClassForm>({
    department: "",
    program: "",
    className: "",
  });
  const [courseForm, setCourseForm] = useState<CourseForm>({
    department: "",
    program: "",
    className: "",
    year: DEFAULT_CATALOG_YEAR,
    semester: DEFAULT_CATALOG_SEMESTER,
    courseCode: "",
    courseTitle: "",
    credits: 3,
  });
  const [materialForm, setMaterialForm] = useState<MaterialForm>({
    ...defaultScope,
    materialType: "slide",
    title: "",
  });
  const [newsForm, setNewsForm] = useState<NewsForm>({
    ...defaultScope,
    title: "",
    body: "",
  });

  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [newsImage, setNewsImage] = useState<File | null>(null);

  const [departmentState, setDepartmentState] = useState<UploadState>(emptyState);
  const [programState, setProgramState] = useState<UploadState>(emptyState);
  const [classState, setClassState] = useState<UploadState>(emptyState);
  const [courseState, setCourseState] = useState<UploadState>(emptyState);
  const [materialState, setMaterialState] = useState<UploadState>(emptyState);
  const [newsState, setNewsState] = useState<UploadState>(emptyState);
  const [modelState, setModelState] = useState<UploadState>(emptyState);

  const [modelForm, setModelForm] = useState<AIModelForm>({
    provider: "huggingface",
    modelId: "",
    label: "",
    setActive: true,
  });

  const [departmentOptions, setDepartmentOptions] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [departmentCatalogRows, setDepartmentCatalogRows] = useState<DepartmentCatalogRow[]>([]);
  const [programCatalogRows, setProgramCatalogRows] = useState<ProgramCatalogRow[]>([]);
  const [classCatalogRows, setClassCatalogRows] = useState<ClassCatalogRow[]>([]);
  const [courseCatalogRows, setCourseCatalogRows] = useState<CourseCatalogRow[]>([]);

  const [recentDepartments, setRecentDepartments] = useState<string[]>([]);
  const [recentPrograms, setRecentPrograms] = useState<string[]>([]);
  const [recentClasses, setRecentClasses] = useState<string[]>([]);
  const [recentCourses, setRecentCourses] = useState<string[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<string[]>([]);
  const [recentModels, setRecentModels] = useState<string[]>([]);
  const [aiModelOptions, setAiModelOptions] = useState<AIModelOption[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfileRow[]>([]);
  const [directoryQuery, setDirectoryQuery] = useState("");

  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    title: "",
    body: "",
    department: "ALL",
    program: "ALL",
    year: 1,
    semester: 1,
  });
  const [broadcastState, setBroadcastState] = useState<UploadState>(emptyState);

  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: "",
    body: "",
    segment: "All students",
    priority: "normal",
  });
  const [notificationState, setNotificationState] = useState<UploadState>(emptyState);

  const [knowledgeBaseForm, setKnowledgeBaseForm] = useState<KnowledgeBaseForm>({
    title: "",
    sourceUrl: "",
    departments: "ALL",
    enabled: true,
  });
  const [knowledgeBaseState, setKnowledgeBaseState] = useState<UploadState>(emptyState);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState<Array<{ title: string; sourceUrl: string; departments: string; enabled: boolean }>>([]);

  const [versionControlForm, setVersionControlForm] = useState<VersionControlForm>({
    minimumVersion: "",
    reason: "",
    forceUpdate: true,
  });
  const [versionControlState, setVersionControlState] = useState<UploadState>(emptyState);

  const [surveyForm, setSurveyForm] = useState<SurveyForm>({
    question: "",
    optionsCsv: "Excellent,Good,Fair,Poor",
    segment: "All students",
  });
  const [surveyState, setSurveyState] = useState<UploadState>(emptyState);

  const [roleGrantForm, setRoleGrantForm] = useState<RoleGrantForm>({
    email: "",
    role: "department_admin",
    department: "Accounting",
  });
  const [roleGrantState, setRoleGrantState] = useState<UploadState>(emptyState);
  const [roleAssignments, setRoleAssignments] = useState<Array<{ email: string; role: RoleGrantForm["role"]; department: string }>>([]);

  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>(INITIAL_FEEDBACK_TICKETS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE_ITEMS);

  const envWarning = useMemo(() => {
    if (isSupabaseConfigured) return "";
    return "Supabase credentials are missing for this admin app.";
  }, []);

  const schemaWarning = useMemo(() => {
    if (!schemaCheckDone || missingSchemaTables.length === 0) {
      return "";
    }

    return `Database schema incomplete. Missing: ${missingSchemaTables.join(", ")}. Run UPSA-Connect/supabase/repair_missing_catalog_tables.sql in Supabase SQL Editor.`;
  }, [missingSchemaTables, schemaCheckDone]);

  const filteredProfiles = useMemo(() => {
    if (!directoryQuery.trim()) return studentProfiles;
    const query = directoryQuery.toLowerCase();
    return studentProfiles.filter((profile) =>
      [
        profile.user_id,
        profile.department,
        profile.program,
        profile.class_name,
        `year ${profile.year}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [directoryQuery, studentProfiles]);

  const materialTypeCounts = useMemo(() => {
    return recentMaterials.reduce<Record<string, number>>((acc, item) => {
      const key = item.split(" ")[0]?.toLowerCase() || "other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [recentMaterials]);

  const topPrograms = useMemo(() => {
    const buckets = studentProfiles.reduce<Record<string, number>>((acc, profile) => {
      acc[profile.program] = (acc[profile.program] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [studentProfiles]);

  const topProgramDistribution = useMemo<ProgramDistributionPoint[]>(() => {
    return topPrograms.map(([program, students]) => ({ program, students }));
  }, [topPrograms]);

  const catalogCoverage = useMemo<CatalogCoveragePoint[]>(() => {
    const departmentMap = new Map<string, { programs: Set<string>; classes: Set<string>; courses: Set<string> }>();

    const ensureDepartment = (department: string) => {
      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          programs: new Set<string>(),
          classes: new Set<string>(),
          courses: new Set<string>(),
        });
      }

      return departmentMap.get(department)!;
    };

    departmentOptions.forEach((department) => {
      const normalizedDepartment = normalizeText(department);
      if (normalizedDepartment) {
        ensureDepartment(normalizedDepartment);
      }
    });

    programCatalogRows.forEach((row) => {
      const department = normalizeText(row.department);
      if (!department) return;
      const entry = ensureDepartment(department);
      entry.programs.add(normalizeText(row.program_name));
    });

    classCatalogRows.forEach((row) => {
      const department = normalizeText(row.department);
      if (!department) return;
      const entry = ensureDepartment(department);
      entry.classes.add(`${normalizeText(row.program_name)}::${normalizeText(row.class_name)}`);
    });

    courseCatalogRows.forEach((row) => {
      const department = normalizeText(row.department);
      if (!department) return;
      const entry = ensureDepartment(department);
      entry.courses.add(
        `${normalizeText(row.program_name)}::${normalizeText(row.class_name)}::${normalizeCourseCode(row.course_code)}::${row.year}::${row.semester}`,
      );
    });

    return Array.from(departmentMap.entries())
      .map(([department, entry]) => ({
        department,
        programs: entry.programs.size,
        classes: entry.classes.size,
        courses: entry.courses.size,
      }))
      .sort((a, b) => a.department.localeCompare(b.department));
  }, [classCatalogRows, courseCatalogRows, departmentOptions, programCatalogRows]);

  const atRiskStudents = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return studentProfiles.filter((profile) => {
      const updated = Date.parse(profile.updated_at);
      return Number.isFinite(updated) && updated < cutoff;
    });
  }, [studentProfiles]);

  const estimatedTokenUsage = useMemo(() => {
    const promptTokens = recentMaterials.length * 780;
    const completionTokens = recentPosts.length * 420;
    const totalTokens = promptTokens + completionTokens;
    const usd = totalTokens * 0.0000007;
    return { promptTokens, completionTokens, totalTokens, usd };
  }, [recentMaterials.length, recentPosts.length]);

  function getProgramSuggestions(department: string) {
    const normalizedDepartment = department.trim().toLowerCase();
    const rows = normalizedDepartment
      ? programCatalogRows.filter((item) => item.department.toLowerCase() === normalizedDepartment)
      : programCatalogRows;

    return Array.from(new Set(rows.map((item) => item.program_name).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
  }

  function getClassSuggestions(department: string, program: string) {
    const normalizedDepartment = department.trim().toLowerCase();
    const normalizedProgram = program.trim().toLowerCase();

    const rows = classCatalogRows.filter((item) => {
      const deptMatch = normalizedDepartment
        ? item.department.toLowerCase() === normalizedDepartment
        : true;
      const programMatch = normalizedProgram
        ? item.program_name.toLowerCase() === normalizedProgram
        : true;
      return deptMatch && programMatch;
    });

    return Array.from(new Set(rows.map((item) => item.class_name).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
  }

  const showSection = (id: AdminPageId) => page === id;
  const showCatalogSuite =
    page === "departments" ||
    page === "catalog" ||
    page === "materials" ||
    page === "news" ||
    page === "ai-models";

  useEffect(() => {
    setActiveNav(page);
  }, [page]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      cachedAdminSession = null;
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    if (cachedAdminSession !== undefined) {
      setSession(cachedAdminSession);
      setAuthLoading(false);
    }

    const loadSession = async () => {
      if (cachedAdminSession !== undefined) return;
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      cachedAdminSession = data.session;
      setSession(data.session);
      setAuthLoading(false);
    };

    void loadSession();

    const subscription = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;
        cachedAdminSession = nextSession;
        setSession(nextSession);
        setAuthLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  async function refreshDashboardData() {
    const [departmentResult, programResult, classResult, courseResult, materialResult, postResult, modelResult, studentResult] =
      await Promise.all([
        supabase
          .from("department_catalog")
          .select("id, name, code, school, created_at")
          .order("name", { ascending: true })
          .limit(100),
        supabase
          .from("program_catalog")
          .select("id, program_code, program_name, department, year, semester, description")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("class_catalog")
          .select("id, class_name, program_name, department, year, semester")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("course_catalog")
          .select("id, department, program_name, class_name, course_code, course_title, credits, year, semester")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("learning_materials")
          .select("title, material_type, year, semester, program_name, department")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("campus_posts")
          .select("title, year, semester")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("ai_models")
          .select("provider, model_id, label, is_active")
          .order("updated_at", { ascending: false })
          .limit(10),
        supabase
          .from("student_profiles")
          .select("user_id, department, program, class_name, year, semester, updated_at, created_at")
          .order("updated_at", { ascending: false })
          .limit(300),
      ]);

    const departmentRows: DepartmentCatalogRow[] = (departmentResult.data ?? [])
      .map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? "").trim(),
        code: item.code ? String(item.code).trim() : null,
        school: item.school ? String(item.school).trim() : null,
        created_at: item.created_at ? String(item.created_at) : null,
      }))
      .filter((item) => item.id && item.name);

    setDepartmentCatalogRows(departmentRows);

    const departmentsFromDb = departmentRows.map((item) => item.name);

    setDepartmentOptions(
      departmentsFromDb.length
        ? Array.from(new Set(departmentsFromDb)).sort((a, b) => a.localeCompare(b))
        : DEFAULT_DEPARTMENTS,
    );

    setRecentDepartments(
      departmentRows.map((item) => {
        const code = item.code ? ` (${item.code})` : "";
        const school = item.school ? ` • ${item.school}` : "";
        return `${item.name}${code}${school}`;
      }),
    );

    setRecentPrograms(
      (programResult.data ?? []).map(
        (item) => `${item.program_name} (${item.department}) • Y${item.year} S${item.semester}`,
      ).slice(0, 8),
    );

    setRecentClasses(
      (classResult.data ?? []).map(
        (item) => `${item.class_name} • ${item.program_name} (${item.department}) Y${item.year} S${item.semester}`,
      ).slice(0, 8),
    );

    setProgramCatalogRows(
      (programResult.data ?? [])
        .map((item) => ({
          id: String(item.id ?? "").trim(),
          program_code: String(item.program_code ?? "").trim(),
          program_name: String(item.program_name ?? "").trim(),
          department: String(item.department ?? "").trim(),
          year: Number(item.year ?? 0),
          semester: Number(item.semester ?? 0),
          description: item.description ? String(item.description).trim() : null,
        }))
        .filter(
          (item) =>
            item.id &&
            item.program_code &&
            item.program_name &&
            item.department &&
            item.year > 0 &&
            item.semester > 0,
        ),
    );

    setClassCatalogRows(
      (classResult.data ?? [])
        .map((item) => ({
          id: String(item.id ?? "").trim(),
          class_name: String(item.class_name ?? "").trim(),
          program_name: String(item.program_name ?? "").trim(),
          department: String(item.department ?? "").trim(),
          year: Number(item.year ?? 0),
          semester: Number(item.semester ?? 0),
        }))
        .filter(
          (item) =>
            item.id &&
            item.class_name &&
            item.program_name &&
            item.department &&
            item.year > 0 &&
            item.semester > 0,
        ),
    );

    setRecentCourses(
      (courseResult.data ?? []).map(
        (item) => `${item.course_code} ${item.course_title} • Y${item.year} S${item.semester}`,
      ),
    );

    setCourseCatalogRows(
      (courseResult.data ?? [])
        .map((item) => ({
          id: String(item.id ?? "").trim(),
          department: String(item.department ?? "").trim(),
          program_name: String(item.program_name ?? "").trim(),
          class_name: String(item.class_name ?? "").trim(),
          course_code: String(item.course_code ?? "").trim(),
          course_title: String(item.course_title ?? "").trim(),
          credits: Number(item.credits ?? 0),
          year: Number(item.year ?? 0),
          semester: Number(item.semester ?? 0),
        }))
        .filter(
          (item) =>
            item.id &&
            item.department &&
            item.program_name &&
            item.class_name &&
            item.course_code &&
            item.course_title &&
            item.credits > 0 &&
            item.year > 0 &&
            item.semester > 0,
        ),
    );

    setRecentMaterials(
      (materialResult.data ?? []).map(
        (item) => `${item.material_type.toUpperCase()} ${item.title} • Y${item.year} S${item.semester}`,
      ),
    );

    setRecentPosts(
      (postResult.data ?? []).map(
        (item) => `${item.title} • Y${item.year} S${item.semester}`,
      ),
    );

    setRecentModels(
      (modelResult.data ?? []).map((item) => {
        const label = item.label ? `${item.label} (${item.model_id})` : item.model_id;
        const active = item.is_active ? " • Active" : "";
        return `${item.provider}: ${label}${active}`;
      }),
    );

    setAiModelOptions(
      (modelResult.data ?? []).map((item) => ({
        modelId: String(item.model_id ?? ""),
        label: item.label ? String(item.label) : String(item.model_id ?? ""),
        isActive: Boolean(item.is_active),
      })),
    );

    setStudentProfiles((studentResult.data ?? []) as StudentProfileRow[]);
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    void refreshDashboardData();
  }, [session]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSchemaCheckDone(true);
      return;
    }

    let mounted = true;

    const checkSchema = async () => {
      try {
        const missing = await detectMissingCatalogTables();
        if (!mounted) return;
        setMissingSchemaTables(missing);
        setSchemaCheckError("");
      } catch {
        if (!mounted) return;
        setSchemaCheckError("Could not validate schema health automatically.");
      } finally {
        if (!mounted) return;
        setSchemaCheckDone(true);
      }
    };

    void checkSchema();

    return () => {
      mounted = false;
    };
  }, []);

  async function uploadFileToBucket(
    bucket: string,
    section: string,
    file: File,
    scope: ScopeFields,
  ) {
    const path = toTimestampedPath(file.name, scope, section);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }

  function isScopeComplete(scope: ScopeFields) {
    return Boolean(
      scope.department.trim() &&
        scope.program.trim() &&
        scope.className.trim() &&
        scope.year > 0 &&
        scope.semester > 0,
    );
  }

  async function createDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDepartmentState({ busy: true, message: "Saving department...", kind: "idle" });

    if (!departmentForm.name.trim()) {
      setDepartmentState({
        busy: false,
        message: "Department name is required.",
        kind: "error",
      });
      return;
    }

    const { error } = await supabase.from("department_catalog").upsert(
      {
        name: normalizeText(departmentForm.name),
        code: normalizeProgramCode(departmentForm.code) || null,
        school: normalizeText(departmentForm.school) || null,
      },
      { onConflict: "name" },
    );

    if (error) {
      setDepartmentState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    setDepartmentForm({ name: "", code: "", school: "" });
    setDepartmentState({
      busy: false,
      message: "Department saved successfully.",
      kind: "success",
    });
    await refreshDashboardData();
  }

  async function updateDepartment(
    departmentId: string,
    values: DepartmentForm,
  ): Promise<boolean> {
    setDepartmentState({ busy: true, message: "Updating department...", kind: "idle" });

    if (!values.name.trim()) {
      setDepartmentState({
        busy: false,
        message: "Department name is required.",
        kind: "error",
      });
      return false;
    }

    const { error } = await supabase
      .from("department_catalog")
      .update({
        name: normalizeText(values.name),
        code: normalizeProgramCode(values.code) || null,
        school: normalizeText(values.school) || null,
      })
      .eq("id", departmentId);

    if (error) {
      setDepartmentState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setDepartmentState({
      busy: false,
      message: "Department updated successfully.",
      kind: "success",
    });
    await refreshDashboardData();
    return true;
  }

  async function deleteDepartment(departmentId: string): Promise<boolean> {
    setDepartmentState({ busy: true, message: "Deleting department...", kind: "idle" });

    const { error } = await supabase
      .from("department_catalog")
      .delete()
      .eq("id", departmentId);

    if (error) {
      setDepartmentState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setDepartmentState({ busy: false, message: "Department deleted successfully.", kind: "success" });
    await refreshDashboardData();
    return true;
  }

  async function createProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProgramState({ busy: true, message: "Saving program...", kind: "idle" });

    if (!programForm.department.trim() || !programForm.program.trim()) {
      setProgramState({
        busy: false,
        message: "Fill all required fields before saving.",
        kind: "error",
      });
      return;
    }

    const department = normalizeText(programForm.department);
    const programName = normalizeText(programForm.program);
    const programCode = buildProgramCode(programName, department);

    const { error } = await supabase.from("program_catalog").upsert(
      {
        department,
        program_name: programName,
        program_code: programCode,
        class_name: GENERAL_CLASS_NAME,
        year: DEFAULT_CATALOG_YEAR,
        semester: DEFAULT_CATALOG_SEMESTER,
        description: normalizeText(programForm.description) || null,
      },
      { onConflict: "program_code,class_name,year,semester" },
    );

    if (error) {
      setProgramState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    setProgramState({
      busy: false,
      message: "Program saved successfully.",
      kind: "success",
    });
    setProgramForm({
      department,
      program: "",
      description: "",
    });
    await refreshDashboardData();
  }

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClassState({ busy: true, message: "Saving class...", kind: "idle" });

    if (!classForm.department.trim() || !classForm.program.trim() || !classForm.className.trim()) {
      setClassState({
        busy: false,
        message: "Fill all required fields before saving class.",
        kind: "error",
      });
      return;
    }

    const department = normalizeText(classForm.department);
    const program = normalizeText(classForm.program);
    const className = normalizeText(classForm.className);

    const { error } = await supabase.from("class_catalog").upsert(
      {
        department,
        program_name: program,
        class_name: className,
        year: DEFAULT_CATALOG_YEAR,
        semester: DEFAULT_CATALOG_SEMESTER,
      },
      { onConflict: "department,program_name,class_name,year,semester" },
    );

    if (error) {
      setClassState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    setClassState({ busy: false, message: "Class saved successfully.", kind: "success" });
    setClassForm({
      department,
      program,
      className: "",
    });
    await refreshDashboardData();
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCourseState({ busy: true, message: "Saving course...", kind: "idle" });

    if (
      !courseForm.department.trim() ||
      !courseForm.program.trim() ||
      !courseForm.courseCode.trim() ||
      !courseForm.courseTitle.trim()
    ) {
      setCourseState({
        busy: false,
        message: "Fill all required fields before saving.",
        kind: "error",
      });
      return;
    }

    const rawDepartment = normalizeText(courseForm.department);
    const department =
      rawDepartment.toUpperCase() === ALL_DEPARTMENTS_VALUE
        ? ALL_DEPARTMENTS_VALUE
        : rawDepartment;
    const program =
      department === ALL_DEPARTMENTS_VALUE
        ? GENERAL_PROGRAM_NAME
        : normalizeText(courseForm.program);
    const className = GENERAL_CLASS_NAME;

    const { error } = await supabase.from("course_catalog").upsert(
      {
        department,
        program_name: program,
        class_name: className,
        year: courseForm.year,
        semester: courseForm.semester,
        course_code: normalizeCourseCode(courseForm.courseCode),
        course_title: normalizeText(courseForm.courseTitle),
        credits: courseForm.credits,
      },
      { onConflict: "course_code,class_name,year,semester" },
    );

    if (error) {
      setCourseState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    setCourseState({
      busy: false,
      message: "Course saved successfully.",
      kind: "success",
    });
    setCourseForm((prev) => ({
      ...prev,
      department,
      program,
      className,
      courseCode: "",
      courseTitle: "",
      credits: 3,
    }));
    await refreshDashboardData();
  }

  async function updateProgram(
    programId: string,
    values: ProgramForm,
  ): Promise<boolean> {
    setProgramState({ busy: true, message: "Updating program...", kind: "idle" });

    if (!values.department.trim() || !values.program.trim()) {
      setProgramState({
        busy: false,
        message: "Department and program name are required.",
        kind: "error",
      });
      return false;
    }

    const department = normalizeText(values.department);
    const program = normalizeText(values.program);

    const { error } = await supabase
      .from("program_catalog")
      .update({
        department,
        program_name: program,
        program_code: buildProgramCode(program, department),
        description: normalizeText(values.description) || null,
      })
      .eq("id", programId);

    if (error) {
      setProgramState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setProgramState({
      busy: false,
      message: "Program updated successfully.",
      kind: "success",
    });
    await refreshDashboardData();
    return true;
  }

  async function deleteProgram(programId: string): Promise<boolean> {
    setProgramState({ busy: true, message: "Deleting program...", kind: "idle" });

    const { error } = await supabase
      .from("program_catalog")
      .delete()
      .eq("id", programId);

    if (error) {
      setProgramState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setProgramState({ busy: false, message: "Program deleted successfully.", kind: "success" });
    await refreshDashboardData();
    return true;
  }

  async function updateClass(
    classId: string,
    values: ClassForm,
  ): Promise<boolean> {
    setClassState({ busy: true, message: "Updating class...", kind: "idle" });

    if (!values.department.trim() || !values.program.trim() || !values.className.trim()) {
      setClassState({
        busy: false,
        message: "Department, program, and class name are required.",
        kind: "error",
      });
      return false;
    }

    const { error } = await supabase
      .from("class_catalog")
      .update({
        department: normalizeText(values.department),
        program_name: normalizeText(values.program),
        class_name: normalizeText(values.className),
      })
      .eq("id", classId);

    if (error) {
      setClassState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setClassState({ busy: false, message: "Class updated successfully.", kind: "success" });
    await refreshDashboardData();
    return true;
  }

  async function deleteClass(classId: string): Promise<boolean> {
    setClassState({ busy: true, message: "Deleting class...", kind: "idle" });

    const { error } = await supabase
      .from("class_catalog")
      .delete()
      .eq("id", classId);

    if (error) {
      setClassState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setClassState({ busy: false, message: "Class deleted successfully.", kind: "success" });
    await refreshDashboardData();
    return true;
  }

  async function updateCourse(
    courseId: string,
    values: CourseForm,
  ): Promise<boolean> {
    setCourseState({ busy: true, message: "Updating course...", kind: "idle" });

    if (
      !values.department.trim() ||
      !values.program.trim() ||
      !values.className.trim() ||
      !values.courseCode.trim() ||
      !values.courseTitle.trim() ||
      values.year <= 0 ||
      values.semester <= 0
    ) {
      setCourseState({
        busy: false,
        message: "Fill all required fields before saving.",
        kind: "error",
      });
      return false;
    }

    const rawDepartment = normalizeText(values.department);
    const department =
      rawDepartment.toUpperCase() === ALL_DEPARTMENTS_VALUE
        ? ALL_DEPARTMENTS_VALUE
        : rawDepartment;
    const program =
      department === ALL_DEPARTMENTS_VALUE
        ? GENERAL_PROGRAM_NAME
        : normalizeText(values.program);
    const className =
      department === ALL_DEPARTMENTS_VALUE
        ? GENERAL_CLASS_NAME
        : normalizeText(values.className);

    const { error } = await supabase
      .from("course_catalog")
      .update({
        department,
        program_name: program,
        class_name: className,
        year: values.year,
        semester: values.semester,
        course_code: normalizeCourseCode(values.courseCode),
        course_title: normalizeText(values.courseTitle),
        credits: values.credits,
      })
      .eq("id", courseId);

    if (error) {
      setCourseState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setCourseState({
      busy: false,
      message: "Course updated successfully.",
      kind: "success",
    });
    await refreshDashboardData();
    return true;
  }

  async function deleteCourse(courseId: string): Promise<boolean> {
    setCourseState({ busy: true, message: "Deleting course...", kind: "idle" });

    const { error } = await supabase
      .from("course_catalog")
      .delete()
      .eq("id", courseId);

    if (error) {
      setCourseState({ busy: false, message: error.message, kind: "error" });
      return false;
    }

    setCourseState({ busy: false, message: "Course deleted successfully.", kind: "success" });
    await refreshDashboardData();
    return true;
  }

  async function uploadMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMaterialState({ busy: true, message: "Uploading material...", kind: "idle" });

    if (!materialFile) {
      setMaterialState({ busy: false, message: "Choose a file to upload.", kind: "error" });
      return;
    }

    if (!isScopeComplete(materialForm) || !materialForm.title.trim()) {
      setMaterialState({
        busy: false,
        message: "Fill all required fields before uploading.",
        kind: "error",
      });
      return;
    }

    try {
      const normalizedScope = normalizeScope(materialForm);

      const uploaded = await uploadFileToBucket(
        "course-materials",
        materialForm.materialType,
        materialFile,
        normalizedScope,
      );

      const { error } = await supabase.from("learning_materials").insert({
        department: normalizedScope.department,
        program_name: normalizedScope.program,
        class_name: normalizedScope.className,
        year: normalizedScope.year,
        semester: normalizedScope.semester,
        material_type: materialForm.materialType,
        title: normalizeText(materialForm.title),
        file_path: uploaded.path,
        file_url: uploaded.publicUrl,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMaterialState({
        busy: false,
        message: "Material uploaded successfully.",
        kind: "success",
      });
      setMaterialFile(null);
      await refreshDashboardData();
    } catch (error) {
      setMaterialState({
        busy: false,
        message: error instanceof Error ? error.message : "Upload failed.",
        kind: "error",
      });
    }
  }

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsState({ busy: true, message: "Publishing post...", kind: "idle" });

    if (!isScopeComplete(newsForm) || !newsForm.title.trim() || !newsForm.body.trim()) {
      setNewsState({
        busy: false,
        message: "Fill all required fields before publishing.",
        kind: "error",
      });
      return;
    }

    try {
      const normalizedScope = normalizeScope(newsForm);

      let imagePath: string | null = null;
      let imageUrl: string | null = null;

      if (newsImage) {
        const uploaded = await uploadFileToBucket("news-media", "news", newsImage, normalizedScope);
        imagePath = uploaded.path;
        imageUrl = uploaded.publicUrl;
      }

      const { error } = await supabase.from("campus_posts").insert({
        department: normalizedScope.department,
        program_name: normalizedScope.program,
        class_name: normalizedScope.className,
        year: normalizedScope.year,
        semester: normalizedScope.semester,
        title: normalizeText(newsForm.title),
        body: normalizeText(newsForm.body),
        image_path: imagePath,
        image_url: imageUrl,
      });

      if (error) {
        throw new Error(error.message);
      }

      setNewsState({
        busy: false,
        message: "Post published successfully.",
        kind: "success",
      });
      setNewsImage(null);
      await refreshDashboardData();
    } catch (error) {
      setNewsState({
        busy: false,
        message: error instanceof Error ? error.message : "Unable to publish.",
        kind: "error",
      });
    }
  }

  async function saveAIModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModelState({ busy: true, message: "Saving model...", kind: "idle" });

    const modelId = modelForm.modelId.trim();
    if (!modelId) {
      setModelState({
        busy: false,
        message: "Model ID is required.",
        kind: "error",
      });
      return;
    }

    const { error } = await supabase
      .from("ai_models")
      .upsert(
        {
          provider: "huggingface",
          model_id: modelId,
          label: modelForm.label.trim() || null,
          is_active: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,model_id" },
      );

    if (error) {
      setModelState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    if (modelForm.setActive) {
      const deactiveResult = await supabase
        .from("ai_models")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("provider", "huggingface")
        .eq("is_active", true);

      if (deactiveResult.error) {
        setModelState({ busy: false, message: deactiveResult.error.message, kind: "error" });
        return;
      }

      const activeResult = await supabase
        .from("ai_models")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("provider", "huggingface")
        .eq("model_id", modelId);

      if (activeResult.error) {
        setModelState({ busy: false, message: activeResult.error.message, kind: "error" });
        return;
      }
    }

    setModelState({
      busy: false,
      message: modelForm.setActive
        ? "Model saved and activated."
        : "Model saved successfully.",
      kind: "success",
    });
    setModelForm((prev) => ({ ...prev, modelId: "", label: "" }));
    await refreshDashboardData();
  }

  async function activateAIModel(modelId: string) {
    setModelState({ busy: true, message: `Activating ${modelId}...`, kind: "idle" });

    const deactiveResult = await supabase
      .from("ai_models")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("provider", "huggingface")
      .eq("is_active", true);

    if (deactiveResult.error) {
      setModelState({ busy: false, message: deactiveResult.error.message, kind: "error" });
      return;
    }

    const activeResult = await supabase
      .from("ai_models")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("provider", "huggingface")
      .eq("model_id", modelId);

    if (activeResult.error) {
      setModelState({ busy: false, message: activeResult.error.message, kind: "error" });
      return;
    }

    setModelState({ busy: false, message: `${modelId} is now active.`, kind: "success" });
    await refreshDashboardData();
  }

  async function publishGlobalBroadcast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBroadcastState({ busy: true, message: "Publishing broadcast...", kind: "idle" });

    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      setBroadcastState({ busy: false, message: "Title and body are required.", kind: "error" });
      return;
    }

    const { error } = await supabase.from("campus_posts").insert({
      department: broadcastForm.department,
      program_name: broadcastForm.program,
      class_name: "ALL",
      year: broadcastForm.year,
      semester: broadcastForm.semester,
      title: `[OFFICIAL MEMO] ${broadcastForm.title.trim()}`,
      body: broadcastForm.body.trim(),
      image_path: null,
      image_url: null,
    });

    if (error) {
      setBroadcastState({ busy: false, message: error.message, kind: "error" });
      return;
    }

    setBroadcastForm({
      title: "",
      body: "",
      department: "ALL",
      program: "ALL",
      year: 1,
      semester: 1,
    });
    setBroadcastState({ busy: false, message: "Broadcast posted to feeds.", kind: "success" });
    await refreshDashboardData();
  }

  function queueNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notificationForm.title.trim() || !notificationForm.body.trim()) {
      setNotificationState({ busy: false, message: "Title and body are required.", kind: "error" });
      return;
    }

    setNotificationState({
      busy: false,
      message: `Notification queued for ${notificationForm.segment} (${notificationForm.priority}).`,
      kind: "success",
    });
    setNotificationForm({ title: "", body: "", segment: "All students", priority: "normal" });
  }

  function saveKnowledgeBaseSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!knowledgeBaseForm.title.trim() || !knowledgeBaseForm.sourceUrl.trim()) {
      setKnowledgeBaseState({ busy: false, message: "Dataset title and URL are required.", kind: "error" });
      return;
    }

    setKnowledgeBaseItems((prev) => [
      {
        title: knowledgeBaseForm.title.trim(),
        sourceUrl: knowledgeBaseForm.sourceUrl.trim(),
        departments: knowledgeBaseForm.departments.trim() || "ALL",
        enabled: knowledgeBaseForm.enabled,
      },
      ...prev,
    ]);
    setKnowledgeBaseState({ busy: false, message: "Knowledge source saved.", kind: "success" });
    setKnowledgeBaseForm({ title: "", sourceUrl: "", departments: "ALL", enabled: true });
  }

  function saveVersionRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!versionControlForm.minimumVersion.trim() || !versionControlForm.reason.trim()) {
      setVersionControlState({ busy: false, message: "Minimum version and reason are required.", kind: "error" });
      return;
    }

    setVersionControlState({
      busy: false,
      message: versionControlForm.forceUpdate
        ? `Force update enabled at v${versionControlForm.minimumVersion}.`
        : `Minimum version v${versionControlForm.minimumVersion} saved.`,
      kind: "success",
    });
    setVersionControlForm({ minimumVersion: "", reason: "", forceUpdate: true });
  }

  function deploySurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const optionCount = surveyForm.optionsCsv
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean).length;
    if (!surveyForm.question.trim() || optionCount < 2) {
      setSurveyState({ busy: false, message: "Question and at least 2 options are required.", kind: "error" });
      return;
    }

    setSurveyState({ busy: false, message: `Survey published to ${surveyForm.segment}.`, kind: "success" });
    setSurveyForm({ question: "", optionsCsv: "Excellent,Good,Fair,Poor", segment: "All students" });
  }

  function grantRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleGrantForm.email.trim()) {
      setRoleGrantState({ busy: false, message: "Admin email is required.", kind: "error" });
      return;
    }

    setRoleAssignments((prev) => [
      {
        email: roleGrantForm.email.trim().toLowerCase(),
        role: roleGrantForm.role,
        department: roleGrantForm.role === "department_admin" ? roleGrantForm.department : "ALL",
      },
      ...prev,
    ]);
    setRoleGrantState({ busy: false, message: "Role assignment saved.", kind: "success" });
    setRoleGrantForm({ email: "", role: "department_admin", department: departmentOptions[0] || "Accounting" });
  }

  function setFeedbackStatus(id: string, status: FeedbackTicket["status"]) {
    setFeedbackTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
  }

  function setMarketplaceStatus(id: string, status: MarketplaceItem["status"]) {
    setMarketplaceItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function goToSection(id: string) {
    const targetPath = NAV_PATHS[id as AdminPageId];
    if (!targetPath) return;
    router.push(targetPath);
    setActiveNav(id);
    setMobileSidebarOpen(false);
  }

  if (authLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(10,78,163,0.18),transparent_45%),radial-gradient(circle_at_86%_84%,rgba(246,196,65,0.18),transparent_40%)]" />
        <section className="upsa-glass relative flex min-h-[52vh] w-full max-w-2xl items-center justify-center rounded-3xl p-8">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-[color:var(--upsa-accent)]/25 blur-xl animate-pulse" />
            <div className="absolute h-28 w-28 rounded-full border border-[color:var(--upsa-primary)]/35 animate-ping" />
            <div className="relative rounded-3xl bg-white/92 p-3 shadow-xl shadow-[#04172f]/35 ring-2 ring-[color:var(--upsa-accent)]/45">
              <Image
                src={appLogo}
                alt="UPSA Connect"
                width={72}
                height={72}
                priority
                unoptimized
                className="h-16 w-16 animate-pulse rounded-2xl object-contain"
              />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(10,78,163,0.22),transparent_45%),radial-gradient(circle_at_88%_86%,rgba(246,196,65,0.22),transparent_40%)]" />
        <section className="upsa-glass animate-rise relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[color:var(--upsa-border)] md:grid-cols-[1.1fr_1fr]">
          <aside className="bg-[linear-gradient(160deg,var(--upsa-hero),#113f74)] p-6 text-white md:p-9">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/92 p-2 shadow-lg shadow-[#04172f]/45 ring-2 ring-[color:var(--upsa-accent)]/45">
                <Image src={appLogo} alt="UPSA Connect" width={56} height={56} priority unoptimized className="h-14 w-14 rounded-xl object-contain" />
              </div>
              <div>
                <p className="upsa-title text-xs uppercase tracking-[0.16em] text-[color:var(--upsa-accent)]/85">UPSA Connect</p>
                <h1 className="upsa-title text-xl font-semibold">Admin Console</h1>
              </div>
            </div>

            <p className="mt-8 text-sm leading-6 text-white/85 md:text-base">
              Central control for departments, course catalog, AI governance, moderation, and campus-wide communication.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/92">
              <li className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><BadgeCheck className="h-4 w-4 text-[color:var(--upsa-accent)]" />Manage faculty and student scope</li>
              <li className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><BellRing className="h-4 w-4 text-[color:var(--upsa-accent)]" />Publish official memos and alerts</li>
              <li className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><ShieldCheck className="h-4 w-4 text-[color:var(--upsa-accent)]" />Monitor analytics, safety, and AI quality</li>
            </ul>
          </aside>

          <div className="bg-[linear-gradient(140deg,#072347,#0a2e57)] p-6 md:p-9">
            <p className="upsa-title text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--upsa-primary)]">Secure Access</p>
            <h2 className="upsa-title mt-2 text-3xl font-semibold text-[color:var(--upsa-text)]">Sign in to continue</h2>
            <p className="mt-2 text-sm text-[color:var(--upsa-text-muted)]">
              Use an authorized admin account to access UPSA Connect management tools.
            </p>

            {envWarning ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{envWarning}</p> : null}
            {schemaWarning ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{schemaWarning}</p> : null}
            {schemaCheckError ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{schemaCheckError}</p> : null}

            <form
              className="mt-6 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setAuthError("");

                if (!isSupabaseConfigured) {
                  setAuthError("Supabase is not configured.");
                  return;
                }

                setAuthBusy(true);
                const { error } = await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
                });
                setAuthBusy(false);

                if (error) {
                  setAuthError(error.message);
                }
              }}
            >
              <Input label="Email" value={email} onChange={setEmail} required />
              <Input label="Password" value={password} onChange={setPassword} type="password" required />

              <button
                disabled={authBusy || !isSupabaseConfigured}
                className="upsa-btn-primary mt-2 w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authBusy ? "Signing in..." : "Sign in"}
              </button>

              {authError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p> : null}
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-3 text-[color:var(--upsa-text)] md:p-5">
      <div className="mx-auto flex max-w-[1600px] gap-3">
        <aside
          className={`upsa-glass fixed inset-y-3 left-3 z-40 hidden rounded-3xl p-3 transition-all duration-300 md:block md:h-[calc(100vh-2.5rem)] ${sidebarCollapsed ? "md:w-[82px]" : "md:w-[250px]"}`}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl bg-[color:var(--upsa-hero)] px-3 py-2 text-white ring-1 ring-[color:var(--upsa-border)]"
                onClick={() => goToSection("overview")}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--upsa-accent)] text-[color:var(--upsa-hero)]">
                  <Landmark className="h-4 w-4" />
                </span>
                {!sidebarCollapsed ? <span className="upsa-title text-sm font-semibold">UPSA Admin</span> : null}
              </button>
              <button
                type="button"
                className="upsa-btn-secondary p-2 text-[color:var(--upsa-primary)]"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
              {NAV_ITEMS.map((item) => {
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-[linear-gradient(120deg,var(--upsa-primary),var(--upsa-accent))] text-[#223958]" : "text-[color:var(--upsa-text-muted)] hover:bg-[color:var(--upsa-surface-soft)] hover:text-[color:var(--upsa-primary)]"}`}
                    onClick={() => goToSection(item.id)}
                  >
                    <NavIcon name={item.icon} className="h-4 w-4" />
                    {!sidebarCollapsed ? <span>{item.label}</span> : null}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl bg-[color:var(--upsa-hero)]/95 p-3 text-white ring-1 ring-[color:var(--upsa-border)]">
              {!sidebarCollapsed ? (
                <>
                  <p className="upsa-title flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[color:var(--upsa-accent)]"><Sparkles className="h-3.5 w-3.5" />Theme</p>
                  <p className="mt-1 text-sm">UPSA Connect visual system</p>
                </>
              ) : (
                <div className="mx-auto h-2.5 w-2.5 rounded-full bg-[color:var(--upsa-accent)]" />
              )}
            </div>
          </div>
        </aside>

        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-30 bg-[#06152a]/30 backdrop-blur-sm md:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <aside className="upsa-glass absolute inset-y-2 left-2 w-[260px] rounded-3xl p-3" onClick={(event) => event.stopPropagation()}>
              <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">UPSA Admin</p>
              <nav className="mt-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[color:var(--upsa-text-muted)] transition hover:bg-[color:var(--upsa-surface-soft)]"
                    onClick={() => goToSection(item.id)}
                  >
                    <NavIcon name={item.icon} className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        ) : null}

        <section className={`w-full space-y-4 md:pr-1 ${sidebarCollapsed ? "md:ml-[95px]" : "md:ml-[263px]"}`}>
          <header id="overview" className="upsa-glass animate-rise rounded-3xl p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <button
                  type="button"
                  className="upsa-btn-secondary mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[color:var(--upsa-primary)] md:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
                <p className="upsa-title text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--upsa-primary)]">UPSA Connect Admin</p>
                <h1 className="upsa-title mt-2 text-3xl font-semibold md:text-4xl">Manage UPSA academic data</h1>
                <p className="mt-2 max-w-4xl text-sm text-[color:var(--upsa-text-muted)] md:text-base">
                  Add departments, programs, classes, and courses directly to Supabase. Materials and announcements are scoped by department, program, class, year, and semester.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="upsa-chip"><ShieldCheck className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Secure admin tools</span>
                  <span className="upsa-chip"><Waypoints className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Unified catalog workflow</span>
                </div>
                {envWarning ? <p className="mt-3 text-sm font-medium text-red-700">{envWarning}</p> : null}
                {schemaWarning ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{schemaWarning}</p> : null}
                {schemaCheckError ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{schemaCheckError}</p> : null}
              </div>
              <button
                className="upsa-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                <LogOut className="h-4 w-4 text-[color:var(--upsa-primary)]" />
                Sign out
              </button>
            </div>
          </header>

          {showSection("overview") ? (
            <OverviewMetricsSection
              metrics={[
                { title: "Departments", value: String(recentDepartments.length), subtitle: "Catalog entries" },
                { title: "Programs", value: String(recentPrograms.length), subtitle: "Recent created" },
                { title: "Materials", value: String(recentMaterials.length), subtitle: "Recent uploads" },
                { title: "AI Models", value: String(recentModels.length), subtitle: "Configured models" },
              ]}
            />
          ) : null}

          {showSection("directory") ? (
            <DirectorySection
              filteredProfiles={filteredProfiles}
              directoryQuery={directoryQuery}
              setDirectoryQuery={setDirectoryQuery}
              publishGlobalBroadcast={publishGlobalBroadcast}
              broadcastForm={broadcastForm}
              setBroadcastForm={setBroadcastForm}
              broadcastState={broadcastState}
              isSupabaseConfigured={isSupabaseConfigured}
              departmentOptions={departmentOptions}
              statusClass={statusClass}
              Input={Input}
              TextArea={TextArea}
              Select={Select}
            />
          ) : null}

          {showSection("analytics") ? (
            <AnalyticsSection
              materialTypeCounts={materialTypeCounts}
              estimatedTokenUsage={estimatedTokenUsage}
              topProgramDistribution={topProgramDistribution}
              catalogCoverage={catalogCoverage}
            />
          ) : null}

          {showSection("moderation") ? (
            <ModerationSection
              studentProfiles={studentProfiles}
              feedbackTickets={feedbackTickets}
            />
          ) : null}

          {showSection("governance") ? (
            <GovernanceSection
              saveKnowledgeBaseSource={saveKnowledgeBaseSource}
              knowledgeBaseForm={knowledgeBaseForm}
              setKnowledgeBaseForm={setKnowledgeBaseForm}
              knowledgeBaseState={knowledgeBaseState}
              statusClass={statusClass}
              knowledgeBaseItems={knowledgeBaseItems}
              estimatedTokenUsage={estimatedTokenUsage}
              recentPosts={recentPosts}
              Input={Input}
            />
          ) : null}

          {showSection("academic") ? (
            <AcademicSection
              atRiskCount={atRiskStudents.length}
              topPrograms={topPrograms}
            />
          ) : null}

          {showSection("community") ? (
            <CommunitySection
              marketplaceItems={marketplaceItems}
              setMarketplaceStatus={setMarketplaceStatus}
              deploySurvey={deploySurvey}
              surveyForm={surveyForm}
              setSurveyForm={setSurveyForm}
              surveyState={surveyState}
              statusClass={statusClass}
              Input={Input}
            />
          ) : null}

          {showSection("system") ? (
            <SystemSection
              queueNotification={queueNotification}
              notificationForm={notificationForm}
              setNotificationForm={setNotificationForm}
              notificationState={notificationState}
              recentPosts={recentPosts}
              recentMaterials={recentMaterials}
              saveVersionRule={saveVersionRule}
              versionControlForm={versionControlForm}
              setVersionControlForm={setVersionControlForm}
              versionControlState={versionControlState}
              grantRole={grantRole}
              roleGrantForm={roleGrantForm}
              setRoleGrantForm={setRoleGrantForm}
              roleGrantState={roleGrantState}
              roleAssignments={roleAssignments}
              departmentOptions={departmentOptions}
              feedbackTickets={feedbackTickets}
              setFeedbackStatus={setFeedbackStatus}
              statusClass={statusClass}
              Input={Input}
              Select={Select}
              TextArea={TextArea}
            />
          ) : null}

          {showCatalogSuite ? (
            <CatalogSuiteSection
              page={page}
              departmentCatalogRows={departmentCatalogRows}
              programCatalogRows={programCatalogRows}
              classCatalogRows={classCatalogRows}
              courseCatalogRows={courseCatalogRows}
              departmentForm={departmentForm}
              setDepartmentForm={setDepartmentForm}
              departmentState={departmentState}
              createDepartment={createDepartment}
              updateDepartment={updateDepartment}
              deleteDepartment={deleteDepartment}
              programForm={programForm}
              setProgramForm={setProgramForm}
              programState={programState}
              createProgram={createProgram}
              updateProgram={updateProgram}
              deleteProgram={deleteProgram}
              classForm={classForm}
              setClassForm={setClassForm}
              classState={classState}
              createClass={createClass}
              updateClass={updateClass}
              deleteClass={deleteClass}
              courseForm={courseForm}
              setCourseForm={setCourseForm}
              courseState={courseState}
              createCourse={createCourse}
              updateCourse={updateCourse}
              deleteCourse={deleteCourse}
              materialForm={materialForm}
              setMaterialForm={setMaterialForm}
              materialState={materialState}
              uploadMaterial={uploadMaterial}
              setMaterialFile={setMaterialFile}
              newsForm={newsForm}
              setNewsForm={setNewsForm}
              newsState={newsState}
              createPost={createPost}
              setNewsImage={setNewsImage}
              modelForm={modelForm}
              setModelForm={setModelForm}
              modelState={modelState}
              saveAIModel={saveAIModel}
              activateAIModel={activateAIModel}
              aiModelOptions={aiModelOptions}
              isSupabaseConfigured={isSupabaseConfigured}
              departmentOptions={departmentOptions}
              getProgramSuggestions={getProgramSuggestions}
              getClassSuggestions={getClassSuggestions}
              statusClass={statusClass}
              Input={Input}
              TextArea={TextArea}
              Select={Select}
              ScopeFieldsEditor={ScopeFieldsEditor}
            />
          ) : null}

          {showSection("recent") ? (
            <RecentSection
              recentDepartments={recentDepartments}
              recentPrograms={recentPrograms}
              recentClasses={recentClasses}
              recentCourses={recentCourses}
              recentMaterials={recentMaterials}
              recentPosts={recentPosts}
              recentModels={recentModels}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function NavIcon({ name, className = "h-5 w-5" }: { name: NavIconName; className?: string }) {
  const iconClass = className;
  const baseProps = { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, className: iconClass, stroke: "currentColor", "aria-hidden": true as const };

  switch (name) {
    case "overview":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10Zm10 8h8v-6h-8v6ZM13 3v8h8V3h-8ZM3 21h8v-6H3v6Z" />
        </svg>
      );
    case "departments":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M6 18V8m4 10V8m4 10V8m4 10V8M3 8h18M6 8l6-5 6 5" />
        </svg>
      );
    case "catalog":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "materials":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4 6 2-2h8l2 2h4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm0 0h16" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 14 2.2-2.2a1 1 0 0 1 1.4 0L15 14m-6 3h6" />
        </svg>
      );
    case "news":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "ai":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4M4 12h4m8 0h4M7.8 7.8l2.8 2.8m2.8 2.8 2.8 2.8m0-8.4-2.8 2.8m-2.8 2.8-2.8 2.8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "directory":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14 4-4 3 3 5-6" />
        </svg>
      );
    case "moderation":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 7v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V7l-8-4Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
        </svg>
      );
    case "system":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2m14 0h2M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
        </svg>
      );
    case "governance":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 3 7l9 5 9-5-9-5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 9 5 9-5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 17 9 5 9-5" />
        </svg>
      );
    case "academic":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
        </svg>
      );
    case "community":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M15 15h2a5 5 0 0 1 5 5v1" />
        </svg>
      );
    case "recent":
      return (
        <svg {...baseProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-3.05-6.75" />
        </svg>
      );
    default:
      return null;
  }
}

function ScopeFieldsEditor<T extends ScopeFields>({
  scope,
  onChange,
  departmentOptions,
  programSuggestions,
  classSuggestions,
}: {
  scope: T;
  onChange: Dispatch<SetStateAction<T>>;
  departmentOptions: string[];
  programSuggestions: string[];
  classSuggestions: string[];
}) {
  const programOptions = Array.from(
    new Set([
      ...programSuggestions,
      scope.program,
    ].map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const classOptions = Array.from(
    new Set([
      ...classSuggestions,
      scope.className,
    ].map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <Select
        label="Department"
        value={scope.department}
        options={departmentOptions.map((department) => ({ label: department, value: department }))}
        onChange={(value) =>
          onChange((prev) => ({
            ...prev,
            department: value,
            program: "",
            className: "",
          }))
        }
        required
      />
      <Select
        label="Program"
        value={scope.program}
        onChange={(value) =>
          onChange((prev) => ({
            ...prev,
            program: value,
            className: "",
          }))
        }
        options={programOptions.map((program) => ({ label: program, value: program }))}
        required
      />
      <Select
        label="Class"
        value={scope.className}
        onChange={(value) => onChange((prev) => ({ ...prev, className: value }))}
        options={classOptions.map((item) => ({ label: item, value: item }))}
        required
      />
      <Select
        label="Year"
        value={String(scope.year)}
        options={years.map((year) => ({ label: `Year ${year}`, value: String(year) }))}
        onChange={(value) => onChange((prev) => ({ ...prev, year: Number(value) }))}
      />
      <Select
        label="Semester"
        value={String(scope.semester)}
        options={semesters.map((semester) => ({ label: `Semester ${semester}`, value: String(semester) }))}
        onChange={(value) => onChange((prev) => ({ ...prev, semester: Number(value) }))}
      />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  listId,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "password";
  listId?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">{label}</span>
      <input
        className="upsa-field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        list={listId}
        required={required}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">{label}</span>
      <textarea
        className="upsa-field min-h-24"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">{label}</span>
      <select
        className="upsa-field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
