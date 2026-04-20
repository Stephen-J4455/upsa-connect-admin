import { Fragment, useMemo, useState, type ComponentType, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  BookCopy,
  Building2,
  FolderUp,
  Layers,
  Library,
  Newspaper,
  Plus,
  Sparkles,
  Waypoints,
  X,
} from "lucide-react";

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

type DepartmentCatalogRow = {
  id: string;
  name: string;
  code: string | null;
  school: string | null;
  created_at: string | null;
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

type UploadState = {
  busy: boolean;
  message: string;
  kind: "success" | "error" | "idle";
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "password";
  listId?: string;
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
  required?: boolean;
};

type ScopeEditorProps = {
  scope: ScopeFields;
  onChange: Dispatch<SetStateAction<ScopeFields>>;
  departmentOptions: string[];
  programSuggestions: string[];
  classSuggestions: string[];
};

type PageId = "departments" | "catalog" | "materials" | "news" | "ai-models";

type CatalogFormId =
  | "department"
  | "program"
  | "class"
  | "course"
  | "material"
  | "news"
  | "ai-model";

type CatalogFormOption = {
  id: CatalogFormId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const CATALOG_FORM_OPTIONS: Record<CatalogFormId, CatalogFormOption> = {
  department: {
    id: "department",
    label: "Department",
    description: "Create or update a department catalog record.",
    icon: Building2,
  },
  program: {
    id: "program",
    label: "Program",
    description: "Select department and enter program name.",
    icon: Waypoints,
  },
  class: {
    id: "class",
    label: "Class",
    description: "Select department and program, then create class name.",
    icon: Layers,
  },
  course: {
    id: "course",
    label: "Course",
    description: "Add courses by department and program, including general courses.",
    icon: BookCopy,
  },
  material: {
    id: "material",
    label: "Material",
    description: "Upload slides, notes, and images.",
    icon: FolderUp,
  },
  news: {
    id: "news",
    label: "News",
    description: "Compose and post updates to the campus feed.",
    icon: Newspaper,
  },
  "ai-model": {
    id: "ai-model",
    label: "AI Model",
    description: "Manage model registry and active runtime model.",
    icon: Sparkles,
  },
};

const CATALOG_YEARS = [1, 2, 3, 4];
const CATALOG_SEMESTERS = [1, 2];
const ALL_DEPARTMENTS_VALUE = "ALL";
const GENERAL_PROGRAM_NAME = "General";
const GENERAL_CLASS_NAME = "GENERAL";
const TREE_NODE_WIDTH = 180;
const TREE_NODE_HEIGHT = 34;
const TREE_COLUMN_GAP = 220;
const TREE_ROW_GAP = 14;
const TREE_EDGE_COLOR = "#6fa6e0";

const TREE_LEVEL_COLORS: Record<0 | 1 | 2 | 3, { fill: string; stroke: string }> = {
  0: { fill: "#4b3d16", stroke: "#f2c659" },
  1: { fill: "#5a4513", stroke: "#ffd976" },
  2: { fill: "#163b62", stroke: "#5b9be1" },
  3: { fill: "#12314f", stroke: "#35679f" },
};

type CatalogTreeNode = {
  id: string;
  label: string;
  level: 0 | 1 | 2 | 3;
  x: number;
  y: number;
};

type CatalogTreeEdge = {
  id: string;
  from: string;
  to: string;
};

function trimLabel(value: string, max = 24) {
  const safe = value.trim();
  if (safe.length <= max) return safe;
  return `${safe.slice(0, max - 3)}...`;
}

export default function CatalogSuiteSection({
  page,
  departmentCatalogRows,
  programCatalogRows,
  classCatalogRows,
  courseCatalogRows,
  departmentForm,
  setDepartmentForm,
  departmentState,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  programForm,
  setProgramForm,
  programState,
  createProgram,
  updateProgram,
  deleteProgram,
  classForm,
  setClassForm,
  classState,
  createClass,
  updateClass,
  deleteClass,
  courseForm,
  setCourseForm,
  courseState,
  createCourse,
  updateCourse,
  deleteCourse,
  materialForm,
  setMaterialForm,
  materialState,
  uploadMaterial,
  setMaterialFile,
  newsForm,
  setNewsForm,
  newsState,
  createPost,
  setNewsImage,
  modelForm,
  setModelForm,
  modelState,
  saveAIModel,
  activateAIModel,
  aiModelOptions,
  isSupabaseConfigured,
  departmentOptions,
  getProgramSuggestions,
  getClassSuggestions,
  statusClass,
  Input,
  TextArea,
  Select,
  ScopeFieldsEditor,
}: {
  page: PageId;
  departmentCatalogRows: DepartmentCatalogRow[];
  programCatalogRows: ProgramCatalogRow[];
  classCatalogRows: ClassCatalogRow[];
  courseCatalogRows: CourseCatalogRow[];
  departmentForm: DepartmentForm;
  setDepartmentForm: Dispatch<SetStateAction<DepartmentForm>>;
  departmentState: UploadState;
  createDepartment: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateDepartment: (departmentId: string, values: DepartmentForm) => Promise<boolean>;
  deleteDepartment: (departmentId: string) => Promise<boolean>;
  programForm: ProgramForm;
  setProgramForm: Dispatch<SetStateAction<ProgramForm>>;
  programState: UploadState;
  createProgram: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateProgram: (programId: string, values: ProgramForm) => Promise<boolean>;
  deleteProgram: (programId: string) => Promise<boolean>;
  classForm: ClassForm;
  setClassForm: Dispatch<SetStateAction<ClassForm>>;
  classState: UploadState;
  createClass: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateClass: (classId: string, values: ClassForm) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
  courseForm: CourseForm;
  setCourseForm: Dispatch<SetStateAction<CourseForm>>;
  courseState: UploadState;
  createCourse: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateCourse: (courseId: string, values: CourseForm) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  materialForm: MaterialForm;
  setMaterialForm: Dispatch<SetStateAction<MaterialForm>>;
  materialState: UploadState;
  uploadMaterial: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setMaterialFile: (file: File | null) => void;
  newsForm: NewsForm;
  setNewsForm: Dispatch<SetStateAction<NewsForm>>;
  newsState: UploadState;
  createPost: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setNewsImage: (file: File | null) => void;
  modelForm: AIModelForm;
  setModelForm: Dispatch<SetStateAction<AIModelForm>>;
  modelState: UploadState;
  saveAIModel: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  activateAIModel: (modelId: string) => Promise<void>;
  aiModelOptions: AIModelOption[];
  isSupabaseConfigured: boolean;
  departmentOptions: string[];
  getProgramSuggestions: (department: string) => string[];
  getClassSuggestions: (department: string, program: string) => string[];
  statusClass: (state: UploadState) => string;
  Input: ComponentType<InputProps>;
  TextArea: ComponentType<TextAreaProps>;
  Select: ComponentType<SelectProps>;
  ScopeFieldsEditor: ComponentType<ScopeEditorProps>;
}) {
  const showCatalog = page === "catalog";
  const showDepartments = page === "departments" || showCatalog;
  const showMaterials = page === "materials" || showCatalog;
  const showNews = page === "news" || showCatalog;
  const showAiModels = page === "ai-models" || showCatalog;

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<CatalogFormId | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingDepartmentForm, setEditingDepartmentForm] = useState<DepartmentForm>({
    name: "",
    code: "",
    school: "",
  });
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingProgramForm, setEditingProgramForm] = useState<ProgramForm>({
    department: "",
    program: "",
    description: "",
  });
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassForm, setEditingClassForm] = useState<ClassForm>({
    department: "",
    program: "",
    className: "",
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseForm, setEditingCourseForm] = useState<CourseForm>({
    department: "",
    program: "",
    className: "",
    year: 1,
    semester: 1,
    courseCode: "",
    courseTitle: "",
    credits: 3,
  });

  const sortedProgramRows = useMemo(() => {
    return [...programCatalogRows].sort((a, b) => {
      const byDepartment = a.department.localeCompare(b.department);
      if (byDepartment !== 0) return byDepartment;
      return a.program_name.localeCompare(b.program_name);
    });
  }, [programCatalogRows]);

  const sortedClassRows = useMemo(() => {
    return [...classCatalogRows].sort((a, b) => {
      const byDepartment = a.department.localeCompare(b.department);
      if (byDepartment !== 0) return byDepartment;
      const byProgram = a.program_name.localeCompare(b.program_name);
      if (byProgram !== 0) return byProgram;
      return a.class_name.localeCompare(b.class_name);
    });
  }, [classCatalogRows]);

  const sortedCourseRows = useMemo(() => {
    return [...courseCatalogRows].sort((a, b) => {
      const byDepartment = a.department.localeCompare(b.department);
      if (byDepartment !== 0) return byDepartment;
      const byProgram = a.program_name.localeCompare(b.program_name);
      if (byProgram !== 0) return byProgram;
      const byClass = a.class_name.localeCompare(b.class_name);
      if (byClass !== 0) return byClass;
      return a.course_code.localeCompare(b.course_code);
    });
  }, [courseCatalogRows]);

  const catalogTree = useMemo(() => {
    const departmentSet = new Set<string>();
    const programSet = new Set<string>();
    const courseSet = new Set<string>();
    const courseLabelById = new Map<string, string>();
    const classSet = new Set<string>();
    const edges = new Map<string, CatalogTreeEdge>();
    const classIdsByProgram = new Map<string, Set<string>>();
    const allClassIds = new Set<string>();
    let hasGeneralDepartmentScope = false;

    const deptNodeId = (department: string) => `dept::${department}`;
    const programNodeId = (department: string, program: string) =>
      `program::${department}::${program}`;
    const courseNodeId = (department: string, program: string, courseCode: string) =>
      `course::${department}::${program}::${courseCode}`;
    const classNodeId = (department: string, program: string, className: string) =>
      `class::${department}::${program}::${className}`;
    const isGeneralDepartment = (department: string) =>
      department.toUpperCase() === ALL_DEPARTMENTS_VALUE;
    const isGeneralProgram = (program: string) =>
      program.toLowerCase() === GENERAL_PROGRAM_NAME.toLowerCase();

    departmentCatalogRows.forEach((department) => {
      if (department.name.trim()) {
        departmentSet.add(department.name.trim());
      }
    });

    sortedProgramRows.forEach((program) => {
      const department = program.department.trim();
      const programName = program.program_name.trim();
      if (!department || !programName || isGeneralDepartment(department) || isGeneralProgram(programName)) {
        return;
      }

      departmentSet.add(department);
      programSet.add(programNodeId(department, programName));

      const edgeId = `${deptNodeId(department)}->${programNodeId(department, programName)}`;
      edges.set(edgeId, {
        id: edgeId,
        from: deptNodeId(department),
        to: programNodeId(department, programName),
      });
    });

    sortedClassRows.forEach((row) => {
      const department = row.department.trim();
      const program = row.program_name.trim();
      const className = row.class_name.trim();
      if (!department || !program || !className || isGeneralDepartment(department) || isGeneralProgram(program)) {
        return;
      }

      const classId = classNodeId(department, program, className);
      const programKey = `${department}::${program}`;

      departmentSet.add(department);
      programSet.add(programNodeId(department, program));
      classSet.add(classId);
      allClassIds.add(classId);

      const linkedClasses = classIdsByProgram.get(programKey) ?? new Set<string>();
      linkedClasses.add(classId);
      classIdsByProgram.set(programKey, linkedClasses);

      const deptToProgramId = `${deptNodeId(department)}->${programNodeId(department, program)}`;
      edges.set(deptToProgramId, {
        id: deptToProgramId,
        from: deptNodeId(department),
        to: programNodeId(department, program),
      });
    });

    sortedCourseRows.forEach((course) => {
      const department = course.department.trim();
      const program = course.program_name.trim();
      const className = course.class_name.trim();
      const courseCode = course.course_code.trim();
      const courseTitle = course.course_title.trim();
      if (!department || !program || !courseCode) return;

      const isGeneralCourse =
        isGeneralDepartment(department) ||
        isGeneralProgram(program) ||
        className.toUpperCase() === GENERAL_CLASS_NAME;

      if (isGeneralDepartment(department)) {
        hasGeneralDepartmentScope = true;
      }

      if (!isGeneralCourse) {
        departmentSet.add(department);
        programSet.add(programNodeId(department, program));

        const deptToProgramId = `${deptNodeId(department)}->${programNodeId(department, program)}`;
        edges.set(deptToProgramId, {
          id: deptToProgramId,
          from: deptNodeId(department),
          to: programNodeId(department, program),
        });
      }

      const courseId = courseNodeId(department, program, courseCode);
      courseSet.add(courseId);
      courseLabelById.set(courseId, courseTitle || courseCode);

      if (isGeneralCourse) {
        Array.from(programSet).forEach((programId) => {
          const edgeId = `${programId}->${courseId}`;
          edges.set(edgeId, {
            id: edgeId,
            from: programId,
            to: courseId,
          });
        });
      } else {
        const programToCourseId = `${programNodeId(department, program)}->${courseId}`;
        edges.set(programToCourseId, {
          id: programToCourseId,
          from: programNodeId(department, program),
          to: courseId,
        });
      }

      const programKey = `${department}::${program}`;
      const targetClassIds = isGeneralCourse
        ? Array.from(allClassIds)
        : Array.from(classIdsByProgram.get(programKey) ?? []);

      const resolvedClassIds =
        targetClassIds.length > 0
          ? targetClassIds
          : className
            ? [classNodeId(department, program, className)]
            : [];

      resolvedClassIds.forEach((classId) => {
        classSet.add(classId);
        const courseToClassId = `${courseId}->${classId}`;
        edges.set(courseToClassId, {
          id: courseToClassId,
          from: courseId,
          to: classId,
        });
      });
    });

    if (hasGeneralDepartmentScope) {
      const departments = Array.from(departmentSet).filter(
        (department) => department.toUpperCase() !== ALL_DEPARTMENTS_VALUE,
      );
      const programs = Array.from(programSet).filter((programId) => {
        const [, , programName] = programId.split("::");
        return !isGeneralProgram(programName);
      });

      departments.forEach((department) => {
        programs.forEach((programId) => {
          const edgeId = `${deptNodeId(department)}->${programId}`;
          edges.set(edgeId, {
            id: edgeId,
            from: deptNodeId(department),
            to: programId,
          });
        });
      });
    }

    const departments = Array.from(departmentSet).sort((a, b) => a.localeCompare(b));
    const programs = Array.from(programSet).sort((a, b) => a.localeCompare(b));
    const courses = Array.from(courseSet).sort((a, b) => a.localeCompare(b));
    const classes = Array.from(classSet).sort((a, b) => a.localeCompare(b));

    const levels = [departments, programs, courses, classes];
    const maxRows = Math.max(...levels.map((items) => items.length), 1);
    const svgHeight = Math.max(220, 28 + maxRows * (TREE_NODE_HEIGHT + TREE_ROW_GAP));
    const svgWidth = 72 + TREE_NODE_WIDTH * 4 + TREE_COLUMN_GAP * 3;

    const buildNode = (
      id: string,
      label: string,
      level: 0 | 1 | 2 | 3,
      index: number,
    ): CatalogTreeNode => ({
      id,
      label,
      level,
      x: 24 + level * (TREE_NODE_WIDTH + TREE_COLUMN_GAP),
      y: 18 + index * (TREE_NODE_HEIGHT + TREE_ROW_GAP),
    });

    const nodes: CatalogTreeNode[] = [
      ...departments.map((department, index) =>
        buildNode(deptNodeId(department), department, 0, index),
      ),
      ...programs.map((programId, index) => {
        const [, department, program] = programId.split("::");
        return buildNode(programId, `${program} (${department})`, 1, index);
      }),
      ...courses.map((courseId, index) => {
        const [, department, program, courseCode] = courseId.split("::");
        const courseLabel = courseLabelById.get(courseId) ?? courseCode;
        return buildNode(courseId, `${courseLabel} (${program}/${department})`, 2, index);
      }),
      ...classes.map((classId, index) => {
        const [, department, program, className] = classId.split("::");
        return buildNode(classId, `${className} (${program}/${department})`, 3, index);
      }),
    ];

    const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
    const filteredEdges = Array.from(edges.values()).filter(
      (edge) => nodeLookup.has(edge.from) && nodeLookup.has(edge.to),
    );

    return {
      nodes,
      edges: filteredEdges,
      nodeLookup,
      svgHeight,
      svgWidth,
      hasData: nodes.length > 0,
    };
  }, [departmentCatalogRows, sortedClassRows, sortedCourseRows, sortedProgramRows]);

  const availableForms = useMemo(() => {
    const ids: CatalogFormId[] = [];

    if (showDepartments) {
      ids.push("department");
    }

    if (showCatalog) {
      ids.push("program", "class", "course");
    }

    if (showMaterials) {
      ids.push("material");
    }

    if (showNews) {
      ids.push("news");
    }

    if (showAiModels) {
      ids.push("ai-model");
    }

    return ids.map((id) => CATALOG_FORM_OPTIONS[id]);
  }, [showAiModels, showCatalog, showDepartments, showMaterials, showNews]);

  const activeFormOption = availableForms.find((item) => item.id === activeForm) ?? null;

  function openForm(formId: CatalogFormId) {
    setActiveForm(formId);
    setSelectorOpen(false);
  }

  function closeForm() {
    setActiveForm(null);
  }

  function startDepartmentEdit(department: DepartmentCatalogRow) {
    setEditingDepartmentId(department.id);
    setEditingDepartmentForm({
      name: department.name,
      code: department.code ?? "",
      school: department.school ?? "",
    });
  }

  function cancelDepartmentEdit() {
    setEditingDepartmentId(null);
    setEditingDepartmentForm({ name: "", code: "", school: "" });
  }

  async function saveDepartmentEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingDepartmentId) return;

    const saved = await updateDepartment(editingDepartmentId, editingDepartmentForm);
    if (saved) {
      cancelDepartmentEdit();
    }
  }

  async function removeDepartment() {
    if (!editingDepartmentId) return;
    if (!window.confirm("Delete this department? This action cannot be undone.")) return;

    const removed = await deleteDepartment(editingDepartmentId);
    if (removed) {
      cancelDepartmentEdit();
    }
  }

  function startProgramEdit(program: ProgramCatalogRow) {
    setEditingProgramId(program.id);
    setEditingProgramForm({
      department: program.department,
      program: program.program_name,
      description: program.description ?? "",
    });
  }

  function cancelProgramEdit() {
    setEditingProgramId(null);
    setEditingProgramForm({ department: "", program: "", description: "" });
  }

  async function saveProgramEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProgramId) return;

    const saved = await updateProgram(editingProgramId, editingProgramForm);
    if (saved) {
      cancelProgramEdit();
    }
  }

  async function removeProgram() {
    if (!editingProgramId) return;
    if (!window.confirm("Delete this program? This action cannot be undone.")) return;

    const removed = await deleteProgram(editingProgramId);
    if (removed) {
      cancelProgramEdit();
    }
  }

  function startClassEdit(classRow: ClassCatalogRow) {
    setEditingClassId(classRow.id);
    setEditingClassForm({
      department: classRow.department,
      program: classRow.program_name,
      className: classRow.class_name,
    });
  }

  function cancelClassEdit() {
    setEditingClassId(null);
    setEditingClassForm({ department: "", program: "", className: "" });
  }

  async function saveClassEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingClassId) return;

    const saved = await updateClass(editingClassId, editingClassForm);
    if (saved) {
      cancelClassEdit();
    }
  }

  async function removeClassRow() {
    if (!editingClassId) return;
    if (!window.confirm("Delete this class? This action cannot be undone.")) return;

    const removed = await deleteClass(editingClassId);
    if (removed) {
      cancelClassEdit();
    }
  }

  function startCourseEdit(course: CourseCatalogRow) {
    setEditingCourseId(course.id);
    setEditingCourseForm({
      department: course.department,
      program: course.program_name,
      className: course.class_name,
      year: course.year,
      semester: course.semester,
      courseCode: course.course_code,
      courseTitle: course.course_title,
      credits: course.credits,
    });
  }

  function cancelCourseEdit() {
    setEditingCourseId(null);
    setEditingCourseForm({
      department: "",
      program: "",
      className: "",
      year: 1,
      semester: 1,
      courseCode: "",
      courseTitle: "",
      credits: 3,
    });
  }

  async function saveCourseEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCourseId) return;

    const saved = await updateCourse(editingCourseId, editingCourseForm);
    if (saved) {
      cancelCourseEdit();
    }
  }

  async function removeCourse() {
    if (!editingCourseId) return;
    if (!window.confirm("Delete this course? This action cannot be undone.")) return;

    const removed = await deleteCourse(editingCourseId);
    if (removed) {
      cancelCourseEdit();
    }
  }

  function renderForm(formId: CatalogFormId) {
    if (formId === "department") {
      return (
        <form onSubmit={createDepartment} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Department name" value={departmentForm.name} onChange={(value) => setDepartmentForm((prev) => ({ ...prev, name: value }))} required />
            <Input label="Code (optional)" value={departmentForm.code} onChange={(value) => setDepartmentForm((prev) => ({ ...prev, code: value }))} />
            <TextArea label="School (optional)" value={departmentForm.school} onChange={(value) => setDepartmentForm((prev) => ({ ...prev, school: value }))} />
          </div>
          <button disabled={departmentState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Save department</button>
          {departmentState.message ? <p className={`text-sm ${statusClass(departmentState)}`}>{departmentState.message}</p> : null}
        </form>
      );
    }

    if (formId === "program") {
      return (
        <form onSubmit={createProgram} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Department"
              value={programForm.department}
              options={departmentOptions.map((department) => ({ label: department, value: department }))}
              onChange={(value) =>
                setProgramForm((prev) => ({
                  ...prev,
                  department: value,
                }))
              }
              required
            />
            <Input
              label="Program name"
              value={programForm.program}
              onChange={(value) =>
                setProgramForm((prev) => ({
                  ...prev,
                  program: value,
                }))
              }
              required
            />
            <TextArea
              label="Description"
              value={programForm.description}
              onChange={(value) =>
                setProgramForm((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
            />
          </div>
          <button disabled={programState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Save program</button>
          {programState.message ? <p className={`text-sm ${statusClass(programState)}`}>{programState.message}</p> : null}
        </form>
      );
    }

    if (formId === "class") {
      const classProgramOptions = getProgramSuggestions(classForm.department);
      return (
        <form onSubmit={createClass} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Department"
              value={classForm.department}
              options={departmentOptions.map((department) => ({ label: department, value: department }))}
              onChange={(value) =>
                setClassForm((prev) => ({
                  ...prev,
                  department: value,
                  program: "",
                }))
              }
              required
            />
            <Select
              label="Program"
              value={classForm.program}
              options={classProgramOptions.map((program) => ({ label: program, value: program }))}
              onChange={(value) =>
                setClassForm((prev) => ({
                  ...prev,
                  program: value,
                }))
              }
              required
            />
            <Input
              label="Class name"
              value={classForm.className}
              onChange={(value) =>
                setClassForm((prev) => ({
                  ...prev,
                  className: value,
                }))
              }
              required
            />
          </div>
          <button disabled={classState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Save class</button>
          {classState.message ? <p className={`text-sm ${statusClass(classState)}`}>{classState.message}</p> : null}
        </form>
      );
    }

    if (formId === "course") {
      const courseDepartmentOptions = [
        { label: "All departments (General)", value: ALL_DEPARTMENTS_VALUE },
        ...departmentOptions.map((department) => ({ label: department, value: department })),
      ];
      const rawCoursePrograms =
        courseForm.department === ALL_DEPARTMENTS_VALUE
          ? [GENERAL_PROGRAM_NAME]
          : getProgramSuggestions(courseForm.department);
      const courseProgramOptions = Array.from(
        new Set([
          ...rawCoursePrograms,
          courseForm.program,
        ].map((value) => value.trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b));

      return (
        <form onSubmit={createCourse} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Department"
              value={courseForm.department}
              options={courseDepartmentOptions}
              onChange={(value) =>
                setCourseForm((prev) => ({
                  ...prev,
                  department: value,
                  program: value === ALL_DEPARTMENTS_VALUE ? GENERAL_PROGRAM_NAME : "",
                }))
              }
              required
            />
            <Select
              label="Program"
              value={courseForm.program}
              options={courseProgramOptions.map((program) => ({ label: program, value: program }))}
              onChange={(value) =>
                setCourseForm((prev) => ({
                  ...prev,
                  program: value,
                }))
              }
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Year"
              value={String(courseForm.year)}
              options={CATALOG_YEARS.map((year) => ({ label: `Year ${year}`, value: String(year) }))}
              onChange={(value) =>
                setCourseForm((prev) => ({
                  ...prev,
                  year: Number(value),
                }))
              }
              required
            />
            <Select
              label="Semester"
              value={String(courseForm.semester)}
              options={CATALOG_SEMESTERS.map((semester) => ({ label: `Semester ${semester}`, value: String(semester) }))}
              onChange={(value) =>
                setCourseForm((prev) => ({
                  ...prev,
                  semester: Number(value),
                }))
              }
              required
            />
            <Input label="Course code" value={courseForm.courseCode} onChange={(value) => setCourseForm((prev) => ({ ...prev, courseCode: value }))} required />
            <Input label="Course title" value={courseForm.courseTitle} onChange={(value) => setCourseForm((prev) => ({ ...prev, courseTitle: value }))} required />
            <Input label="Credits" type="number" value={String(courseForm.credits)} onChange={(value) => setCourseForm((prev) => ({ ...prev, credits: Number(value) || 0 }))} required />
          </div>
          <p className="text-xs text-[color:var(--upsa-text-muted)]">
            Classes are derived from programs automatically. Choose &quot;All departments (General)&quot; to create a general course accessible across departments.
          </p>
          <button disabled={courseState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Save course</button>
          {courseState.message ? <p className={`text-sm ${statusClass(courseState)}`}>{courseState.message}</p> : null}
        </form>
      );
    }

    if (formId === "material") {
      return (
        <form onSubmit={uploadMaterial} className="space-y-3">
          <ScopeFieldsEditor
            scope={materialForm}
            onChange={setMaterialForm as Dispatch<SetStateAction<ScopeFields>>}
            departmentOptions={departmentOptions}
            programSuggestions={getProgramSuggestions(materialForm.department)}
            classSuggestions={getClassSuggestions(materialForm.department, materialForm.program)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Material type"
              value={materialForm.materialType}
              onChange={(value) =>
                setMaterialForm((prev) => ({
                  ...prev,
                  materialType: value as MaterialForm["materialType"],
                }))
              }
              options={[
                { value: "slide", label: "Slide" },
                { value: "note", label: "Note" },
                { value: "image", label: "Image" },
              ]}
              required
            />
            <Input label="Title" value={materialForm.title} onChange={(value) => setMaterialForm((prev) => ({ ...prev, title: value }))} required />
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">File</label>
              <input
                className="upsa-field"
                type="file"
                onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)}
                required
              />
            </div>
          </div>
          <button disabled={materialState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Upload material</button>
          {materialState.message ? <p className={`text-sm ${statusClass(materialState)}`}>{materialState.message}</p> : null}
        </form>
      );
    }

    if (formId === "news") {
      return (
        <form onSubmit={createPost} className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--upsa-primary)]/15 text-[color:var(--upsa-primary)]">
                <Newspaper className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">Headline</span>
                  <input
                    className="upsa-field"
                    value={newsForm.title}
                    onChange={(event) =>
                      setNewsForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Share a campus update headline"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">Post</span>
                  <textarea
                    className="upsa-field min-h-28"
                    value={newsForm.body}
                    onChange={(event) =>
                      setNewsForm((prev) => ({
                        ...prev,
                        body: event.target.value,
                      }))
                    }
                    placeholder="What is happening on campus today?"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">Cover image (optional)</span>
                  <input
                    className="upsa-field"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setNewsImage(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-4">
            <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">Post audience</p>
            <p className="mt-1 text-xs text-[color:var(--upsa-text-muted)]">Select department/program/class/year/semester scope for this post.</p>
            <ScopeFieldsEditor
              scope={newsForm}
              onChange={setNewsForm as Dispatch<SetStateAction<ScopeFields>>}
              departmentOptions={departmentOptions}
              programSuggestions={getProgramSuggestions(newsForm.department)}
              classSuggestions={getClassSuggestions(newsForm.department, newsForm.program)}
            />
          </div>

          <button disabled={newsState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Post update</button>
          {newsState.message ? <p className={`text-sm ${statusClass(newsState)}`}>{newsState.message}</p> : null}
        </form>
      );
    }

    return (
      <form onSubmit={saveAIModel} className="space-y-3">
        <p className="upsa-chip inline-flex"><Library className="h-3.5 w-3.5 text-[color:var(--upsa-accent)]" />Model registry with active fallback</p>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Model ID"
            value={modelForm.modelId}
            onChange={(value) => setModelForm((prev) => ({ ...prev, modelId: value }))}
            required
          />
          <Input
            label="Label (optional)"
            value={modelForm.label}
            onChange={(value) => setModelForm((prev) => ({ ...prev, label: value }))}
          />
          <label className="mt-1 inline-flex items-center gap-2 text-sm text-[color:var(--upsa-text)] md:col-span-2">
            <input
              type="checkbox"
              checked={modelForm.setActive}
              onChange={(event) =>
                setModelForm((prev) => ({ ...prev, setActive: event.target.checked }))
              }
            />
            Set this model as active after save
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button disabled={modelState.busy || !isSupabaseConfigured} className="upsa-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Save model</button>

          {aiModelOptions.length ? (
            <select
              className="upsa-field"
              defaultValue=""
              onChange={(event) => {
                const modelId = event.target.value;
                if (!modelId) return;
                void activateAIModel(modelId);
                event.currentTarget.value = "";
              }}
            >
              <option value="">Activate existing model...</option>
              {aiModelOptions.map((item) => (
                <option key={item.modelId} value={item.modelId}>
                  {item.label} ({item.modelId}){item.isActive ? " • Active" : ""}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {modelState.message ? <p className={`text-sm ${statusClass(modelState)}`}>{modelState.message}</p> : null}
      </form>
    );
  }

  return (
    <div id="departments" className="space-y-4">
      <section className="upsa-card animate-rise p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="upsa-title text-2xl font-semibold">Catalog Action Center</h2>
            <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
              Use the plus icon to choose what to add, then complete the form in a popup.
            </p>
          </div>
          <button
            type="button"
            className="upsa-btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => setSelectorOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {availableForms.map((option) => {
            const Icon = option.icon;
            return (
              <article key={option.id} className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
                <p className="upsa-title flex items-center gap-2 text-base font-semibold text-[color:var(--upsa-primary)]">
                  <Icon className="h-4 w-4" />
                  {option.label}
                </p>
                <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">{option.description}</p>
                <button
                  type="button"
                  className="upsa-btn-secondary mt-3 px-3 py-1.5 text-xs font-semibold"
                  onClick={() => openForm(option.id)}
                >
                  Open form
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {showDepartments ? (
        <section className="upsa-card animate-rise p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="upsa-title text-xl font-semibold">Department Directory</h3>
              <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
                Loaded from Supabase. Edit any row and save updates instantly.
              </p>
            </div>
            <span className="upsa-chip">{departmentCatalogRows.length} departments</span>
          </div>

          {departmentState.message ? (
            <p className={`mt-3 text-sm ${statusClass(departmentState)}`}>{departmentState.message}</p>
          ) : null}

          {departmentCatalogRows.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] px-4 py-3 text-sm text-[color:var(--upsa-text-muted)]">
              No departments found yet. Use Add New to create your first department.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-2xl border border-[color:var(--upsa-border)] text-sm">
                <thead className="bg-[color:var(--upsa-surface-soft)] text-left text-[color:var(--upsa-text-muted)]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Department</th>
                    <th className="px-3 py-2.5 font-semibold">Code</th>
                    <th className="px-3 py-2.5 font-semibold">School</th>
                    <th className="px-3 py-2.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentCatalogRows.map((department) => {
                    const isEditing = editingDepartmentId === department.id;
                    return (
                      <Fragment key={department.id}>
                        <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)]">
                          <td className="px-3 py-2.5 font-medium text-[color:var(--upsa-text)]">{department.name}</td>
                          <td className="px-3 py-2.5 text-[color:var(--upsa-text-muted)]">{department.code || "-"}</td>
                          <td className="px-3 py-2.5 text-[color:var(--upsa-text-muted)]">{department.school || "-"}</td>
                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              className="upsa-btn-secondary px-3 py-1.5 text-xs font-semibold"
                              onClick={() => startDepartmentEdit(department)}
                              disabled={departmentState.busy}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>

                        {isEditing ? (
                          <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)]">
                            <td className="px-3 py-3" colSpan={4}>
                              <form onSubmit={saveDepartmentEdit} className="space-y-3">
                                <div className="grid gap-3 md:grid-cols-3">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">Department name</label>
                                    <input
                                      className="upsa-field"
                                      value={editingDepartmentForm.name}
                                      onChange={(event) =>
                                        setEditingDepartmentForm((prev) => ({
                                          ...prev,
                                          name: event.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">Code</label>
                                    <input
                                      className="upsa-field"
                                      value={editingDepartmentForm.code}
                                      onChange={(event) =>
                                        setEditingDepartmentForm((prev) => ({
                                          ...prev,
                                          code: event.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-[color:var(--upsa-text-muted)]">School</label>
                                    <input
                                      className="upsa-field"
                                      value={editingDepartmentForm.school}
                                      onChange={(event) =>
                                        setEditingDepartmentForm((prev) => ({
                                          ...prev,
                                          school: event.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="submit"
                                    className="upsa-btn-primary px-3 py-1.5 text-xs font-semibold"
                                    disabled={departmentState.busy || !isSupabaseConfigured}
                                  >
                                    {departmentState.busy ? "Saving..." : "Save changes"}
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md border border-red-400/50 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                                    onClick={() => void removeDepartment()}
                                    disabled={departmentState.busy || !isSupabaseConfigured}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    className="upsa-btn-secondary px-3 py-1.5 text-xs font-semibold"
                                    onClick={cancelDepartmentEdit}
                                    disabled={departmentState.busy}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        ) : null}
                        </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {showCatalog ? (
        <section className="upsa-card animate-rise p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="upsa-title text-xl font-semibold">Catalog Records</h3>
              <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">
                Live program, class, and course records loaded from Supabase.
              </p>
            </div>
          </div>

          <article className="mt-4 rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">
                Node Link Tree: Department -&gt; Program -&gt; Course -&gt; Class
              </p>
              <span className="upsa-chip">{catalogTree.edges.length} links</span>
            </div>
            <p className="text-xs text-[color:var(--upsa-text-muted)]">
              This graph uses current catalog data and updates automatically as you add or edit records.
            </p>

            {catalogTree.hasData ? (
              <div className="mt-3 overflow-x-auto rounded-xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] p-2">
                <svg
                  width={catalogTree.svgWidth}
                  height={catalogTree.svgHeight}
                  viewBox={`0 0 ${catalogTree.svgWidth} ${catalogTree.svgHeight}`}
                  role="img"
                  aria-label="Catalog relationship graph"
                >
                  <rect
                    x="0"
                    y="0"
                    width={catalogTree.svgWidth}
                    height={catalogTree.svgHeight}
                    fill="#061b33"
                    rx="10"
                  />
                  {catalogTree.edges.map((edge) => {
                    const fromNode = catalogTree.nodeLookup.get(edge.from);
                    const toNode = catalogTree.nodeLookup.get(edge.to);
                    if (!fromNode || !toNode) return null;

                    const fromX = fromNode.x + TREE_NODE_WIDTH;
                    const fromY = fromNode.y + TREE_NODE_HEIGHT / 2;
                    const toX = toNode.x;
                    const toY = toNode.y + TREE_NODE_HEIGHT / 2;
                    const controlOffset = 64;

                    return (
                      <path
                        key={edge.id}
                        d={`M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`}
                        fill="none"
                        stroke={TREE_EDGE_COLOR}
                        opacity="0.75"
                        strokeWidth="1.35"
                      />
                    );
                  })}

                  {catalogTree.nodes.map((node) => {
                    const levelColors = TREE_LEVEL_COLORS[node.level];

                    return (
                      <g key={node.id}>
                        <rect
                          x={node.x}
                          y={node.y}
                          width={TREE_NODE_WIDTH}
                          height={TREE_NODE_HEIGHT}
                          rx="8"
                          fill={levelColors.fill}
                          stroke={levelColors.stroke}
                          strokeWidth="1.2"
                        />
                        <text
                          x={node.x + 10}
                          y={node.y + 22}
                          fill="#eef5ff"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {trimLabel(node.label)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)] px-3 py-2 text-xs text-[color:var(--upsa-text-muted)]">
                No catalog data available yet for visualization.
              </p>
            )}
          </article>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <article className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">Programs</p>
                <span className="upsa-chip">{sortedProgramRows.length}</span>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-[color:var(--upsa-border)]">
                <table className="min-w-full text-xs">
                  <thead className="bg-[color:var(--upsa-surface-soft)] text-left text-[color:var(--upsa-text-muted)]">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Program</th>
                      <th className="px-2.5 py-2 font-semibold">Department</th>
                      <th className="px-2.5 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProgramRows.length ? (
                      sortedProgramRows.map((row) => {
                        const isEditing = editingProgramId === row.id;
                        return (
                          <Fragment key={row.id}>
                            <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)]">
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text)]">{row.program_name}</td>
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text-muted)]">{row.department}</td>
                              <td className="px-2.5 py-2">
                                <button
                                  type="button"
                                  className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                  onClick={() => startProgramEdit(row)}
                                  disabled={programState.busy}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                            {isEditing ? (
                              <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)]">
                                <td className="px-2.5 py-2" colSpan={3}>
                                  <form onSubmit={saveProgramEdit} className="grid gap-2">
                                    <div className="grid gap-2 md:grid-cols-2">
                                      <Select
                                        label="Department"
                                        value={editingProgramForm.department}
                                        options={departmentOptions.map((department) => ({ label: department, value: department }))}
                                        onChange={(value) =>
                                          setEditingProgramForm((prev) => ({
                                            ...prev,
                                            department: value,
                                          }))
                                        }
                                        required
                                      />
                                      <Input
                                        label="Program"
                                        value={editingProgramForm.program}
                                        onChange={(value) =>
                                          setEditingProgramForm((prev) => ({
                                            ...prev,
                                            program: value,
                                          }))
                                        }
                                        required
                                      />
                                      <TextArea
                                        label="Description"
                                        value={editingProgramForm.description}
                                        onChange={(value) =>
                                          setEditingProgramForm((prev) => ({
                                            ...prev,
                                            description: value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="submit"
                                        className="upsa-btn-primary px-2 py-1 text-[11px] font-semibold"
                                        disabled={programState.busy || !isSupabaseConfigured}
                                      >
                                        {programState.busy ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-md border border-red-400/50 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"
                                        onClick={() => void removeProgram()}
                                        disabled={programState.busy || !isSupabaseConfigured}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                        onClick={cancelProgramEdit}
                                        disabled={programState.busy}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-2.5 py-3 text-[color:var(--upsa-text-muted)]" colSpan={3}>
                          No programs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">Classes</p>
                <span className="upsa-chip">{sortedClassRows.length}</span>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-[color:var(--upsa-border)]">
                <table className="min-w-full text-xs">
                  <thead className="bg-[color:var(--upsa-surface-soft)] text-left text-[color:var(--upsa-text-muted)]">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Class</th>
                      <th className="px-2.5 py-2 font-semibold">Program</th>
                      <th className="px-2.5 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClassRows.length ? (
                      sortedClassRows.map((row) => {
                        const isEditing = editingClassId === row.id;
                        const classProgramOptions = getProgramSuggestions(
                          isEditing ? editingClassForm.department : row.department,
                        );

                        return (
                          <Fragment key={row.id}>
                            <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)]">
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text)]">{row.class_name}</td>
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text-muted)]">{row.program_name}</td>
                              <td className="px-2.5 py-2">
                                <button
                                  type="button"
                                  className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                  onClick={() => startClassEdit(row)}
                                  disabled={classState.busy}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                            {isEditing ? (
                              <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)]">
                                <td className="px-2.5 py-2" colSpan={3}>
                                  <form onSubmit={saveClassEdit} className="grid gap-2">
                                    <div className="grid gap-2 md:grid-cols-3">
                                      <Select
                                        label="Department"
                                        value={editingClassForm.department}
                                        options={departmentOptions.map((department) => ({ label: department, value: department }))}
                                        onChange={(value) =>
                                          setEditingClassForm((prev) => ({
                                            ...prev,
                                            department: value,
                                            program: "",
                                          }))
                                        }
                                        required
                                      />
                                      <Select
                                        label="Program"
                                        value={editingClassForm.program}
                                        options={classProgramOptions.map((program) => ({ label: program, value: program }))}
                                        onChange={(value) =>
                                          setEditingClassForm((prev) => ({
                                            ...prev,
                                            program: value,
                                          }))
                                        }
                                        required
                                      />
                                      <Input
                                        label="Class"
                                        value={editingClassForm.className}
                                        onChange={(value) =>
                                          setEditingClassForm((prev) => ({
                                            ...prev,
                                            className: value,
                                          }))
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="submit"
                                        className="upsa-btn-primary px-2 py-1 text-[11px] font-semibold"
                                        disabled={classState.busy || !isSupabaseConfigured}
                                      >
                                        {classState.busy ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-md border border-red-400/50 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"
                                        onClick={() => void removeClassRow()}
                                        disabled={classState.busy || !isSupabaseConfigured}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                        onClick={cancelClassEdit}
                                        disabled={classState.busy}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-2.5 py-3 text-[color:var(--upsa-text-muted)]" colSpan={3}>
                          No classes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="upsa-title text-sm font-semibold text-[color:var(--upsa-primary)]">Courses</p>
                <span className="upsa-chip">{sortedCourseRows.length}</span>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-[color:var(--upsa-border)]">
                <table className="min-w-full text-xs">
                  <thead className="bg-[color:var(--upsa-surface-soft)] text-left text-[color:var(--upsa-text-muted)]">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Course</th>
                      <th className="px-2.5 py-2 font-semibold">Scope</th>
                      <th className="px-2.5 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCourseRows.length ? (
                      sortedCourseRows.map((row) => {
                        const isEditing = editingCourseId === row.id;
                        const courseDepartmentOptions = [
                          { label: "All departments (General)", value: ALL_DEPARTMENTS_VALUE },
                          ...departmentOptions.map((department) => ({ label: department, value: department })),
                        ];
                        const rawCoursePrograms =
                          (isEditing ? editingCourseForm.department : row.department) === ALL_DEPARTMENTS_VALUE
                            ? [GENERAL_PROGRAM_NAME]
                            : getProgramSuggestions(isEditing ? editingCourseForm.department : row.department);
                        const courseProgramOptions = Array.from(
                          new Set([
                            ...rawCoursePrograms,
                            isEditing ? editingCourseForm.program : row.program_name,
                          ].map((value) => value.trim()).filter(Boolean)),
                        ).sort((a, b) => a.localeCompare(b));
                        const rawCourseClasses =
                          (isEditing ? editingCourseForm.department : row.department) === ALL_DEPARTMENTS_VALUE
                            ? [GENERAL_CLASS_NAME]
                            : getClassSuggestions(
                                isEditing ? editingCourseForm.department : row.department,
                                isEditing ? editingCourseForm.program : row.program_name,
                              );
                        const courseClassOptions = Array.from(
                          new Set([
                            ...rawCourseClasses,
                            isEditing ? editingCourseForm.className : row.class_name,
                          ].map((value) => value.trim()).filter(Boolean)),
                        ).sort((a, b) => a.localeCompare(b));

                        return (
                          <Fragment key={row.id}>
                            <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface)]">
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text)]">
                                <p className="font-semibold">{row.course_title}</p>
                                <p className="text-[10px] text-[color:var(--upsa-text-muted)]">{row.course_code}</p>
                              </td>
                              <td className="px-2.5 py-2 text-[color:var(--upsa-text-muted)]">{row.program_name} • {row.class_name} • Y{row.year} S{row.semester}</td>
                              <td className="px-2.5 py-2">
                                <button
                                  type="button"
                                  className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                  onClick={() => startCourseEdit(row)}
                                  disabled={courseState.busy}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                            {isEditing ? (
                              <tr className="border-t border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)]">
                                <td className="px-2.5 py-2" colSpan={3}>
                                  <form onSubmit={saveCourseEdit} className="grid gap-2">
                                    <div className="grid gap-2 md:grid-cols-3">
                                      <Select
                                        label="Department"
                                        value={editingCourseForm.department}
                                        options={courseDepartmentOptions}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            department: value,
                                            program: value === ALL_DEPARTMENTS_VALUE ? GENERAL_PROGRAM_NAME : "",
                                            className: value === ALL_DEPARTMENTS_VALUE ? GENERAL_CLASS_NAME : "",
                                          }))
                                        }
                                        required
                                      />
                                      <Select
                                        label="Program"
                                        value={editingCourseForm.program}
                                        options={courseProgramOptions.map((program) => ({ label: program, value: program }))}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            program: value,
                                            className: prev.department === ALL_DEPARTMENTS_VALUE ? GENERAL_CLASS_NAME : "",
                                          }))
                                        }
                                        required
                                      />
                                      <Select
                                        label="Class"
                                        value={editingCourseForm.className}
                                        options={courseClassOptions.map((className) => ({ label: className, value: className }))}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            className: value,
                                          }))
                                        }
                                        required
                                      />
                                      <Input
                                        label="Course code"
                                        value={editingCourseForm.courseCode}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            courseCode: value,
                                          }))
                                        }
                                        required
                                      />
                                      <Input
                                        label="Course title"
                                        value={editingCourseForm.courseTitle}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            courseTitle: value,
                                          }))
                                        }
                                        required
                                      />
                                      <Select
                                        label="Year"
                                        value={String(editingCourseForm.year)}
                                        options={CATALOG_YEARS.map((year) => ({ label: `Year ${year}`, value: String(year) }))}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            year: Number(value),
                                          }))
                                        }
                                        required
                                      />
                                      <Select
                                        label="Semester"
                                        value={String(editingCourseForm.semester)}
                                        options={CATALOG_SEMESTERS.map((semester) => ({ label: `Semester ${semester}`, value: String(semester) }))}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            semester: Number(value),
                                          }))
                                        }
                                        required
                                      />
                                      <Input
                                        label="Credits"
                                        type="number"
                                        value={String(editingCourseForm.credits)}
                                        onChange={(value) =>
                                          setEditingCourseForm((prev) => ({
                                            ...prev,
                                            credits: Number(value) || 0,
                                          }))
                                        }
                                        required
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="submit"
                                        className="upsa-btn-primary px-2 py-1 text-[11px] font-semibold"
                                        disabled={courseState.busy || !isSupabaseConfigured}
                                      >
                                        {courseState.busy ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded-md border border-red-400/50 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"
                                        onClick={() => void removeCourse()}
                                        disabled={courseState.busy || !isSupabaseConfigured}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        className="upsa-btn-secondary px-2 py-1 text-[11px] font-semibold"
                                        onClick={cancelCourseEdit}
                                        disabled={courseState.busy}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-2.5 py-3 text-[color:var(--upsa-text-muted)]" colSpan={3}>
                          No courses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {selectorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02142e]/70 p-4">
          <div className="upsa-card w-full max-w-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="upsa-title text-xl font-semibold">Choose what to add</h3>
              <button type="button" className="upsa-btn-secondary p-2" onClick={() => setSelectorOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {availableForms.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className="rounded-xl border border-[color:var(--upsa-border)] bg-[color:var(--upsa-surface-soft)] p-3 text-left transition hover:border-[color:var(--upsa-primary)]"
                    onClick={() => openForm(option.id)}
                  >
                    <p className="upsa-title flex items-center gap-2 text-base font-semibold text-[color:var(--upsa-primary)]">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {activeFormOption ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02142e]/70 p-4">
          <div className="upsa-card max-h-[90vh] w-full max-w-4xl overflow-auto p-5 md:p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="upsa-title flex items-center gap-2 text-xl font-semibold">
                  <activeFormOption.icon className="h-5 w-5 text-[color:var(--upsa-primary)]" />
                  Add {activeFormOption.label}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--upsa-text-muted)]">{activeFormOption.description}</p>
              </div>
              <button type="button" className="upsa-btn-secondary p-2" onClick={closeForm}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {renderForm(activeFormOption.id)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
