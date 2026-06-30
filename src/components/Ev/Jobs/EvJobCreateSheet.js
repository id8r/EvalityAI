/* src/components/Ev/Jobs/EvJobCreateSheet.js | Branded create-job flow sheet | Sree | 2026-06-28 */

"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  BadgeCheck,
  Banknote,
  Brain,
  BusFront,
  CalendarDays,
  Circle,
  Clock3,
  Coffee,
  Dumbbell,
  Gift,
  Globe,
  GraduationCap,
  GripVertical,
  HeartPulse,
  House,
  Laptop,
  Pencil,
  PiggyBank,
  Plane,
  Plus,
  Save,
  Send,
  ShieldPlus,
  Trash2,
  Upload,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { FxAiButton, FxButton, FxInput, FxRichTextEditor, FxSelect, FxTagsInput, FxTextarea } from "@/components/FxUI/Forms";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { EvUploadJobDescriptionDialog } from "@/components/Ev/Jobs/EvUploadJobDescriptionDialog";
import { FxTabs } from "@/components/FxUI/Navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const CURRENCY_LOCALES = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

const STEPS = [
  { value: "basic", label: "Basic Details" },
  { value: "description", label: "Job Description" },
  { value: "questionnaire", label: "Screening Mode" },
  { value: "benefits", label: "Benefits" },
  { value: "evaluation", label: "Evaluation" },
  { value: "review", label: "Review" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const WORKPLACE_TYPE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-site" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR", description: "Indian Rupee" },
  { value: "USD", label: "USD", description: "US Dollar" },
  { value: "EUR", label: "EUR", description: "Euro" },
];

const QUESTION_FORMAT_OPTIONS = [
  { value: "prescreen_only", label: "Standard Questions Only", description: "Keep the flow shorter when the goal is quick qualification." },
  { value: "cv_and_prescreen", label: "Standard Questions and AI led Email", description: "Use CV context first, then ask focused qualification questions." },
];

// Curated benefit groups shown as a checkbox grid on the Benefits step (parity with the old product).
const BENEFITS_GROUPS = [
  {
    title: "Office",
    items: [
      { label: "Cafeteria", icon: Coffee },
      { label: "Free Meal", icon: UtensilsCrossed },
      { label: "Office Transportation", icon: BusFront },
      { label: "Office Gym", icon: Dumbbell },
      { label: "Recreational Activities", icon: Users },
      { label: "Work From Home", icon: House },
    ],
  },
  {
    title: "Health Benefits",
    items: [
      { label: "Health Insurance", icon: HeartPulse },
      { label: "Life Insurance", icon: ShieldPlus },
      { label: "Mental Health", icon: Brain },
      { label: "Gym Membership", icon: Dumbbell },
    ],
  },
  {
    title: "Financial Benefits",
    items: [
      { label: "Performance Bonus", icon: Gift },
      { label: "Joining Bonus", icon: PiggyBank },
      { label: "Stock Options / Equity", icon: Banknote },
      { label: "Relocation Expenses", icon: Plane },
      { label: "Mobile Bill Reimbursement", icon: Laptop },
    ],
  },
  {
    title: "Professional Benefits",
    items: [
      { label: "Reimbursement for Courses", icon: GraduationCap },
      { label: "Job Training", icon: GraduationCap },
      { label: "Rewards and Recognition", icon: BadgeCheck },
      { label: "Onsite / International Work", icon: Globe },
    ],
  },
  {
    title: "Leaves",
    items: [
      { label: "Maternity & Paternity Leave", icon: Baby },
      { label: "Sick Leave", icon: CalendarDays },
      { label: "Flexible Hours", icon: Clock3 },
      { label: "Paid Time Off", icon: Plane },
    ],
  },
];

// Two-step prompt set behind the Evaluation "Generate Context" AI dialog.
const EVALUATION_CONTEXT_PROMPTS = [
  {
    id: "evaluation_focus",
    title: "What matters most when evaluating this role?",
    options: [
      "Hands-on role fit and practical problem solving",
      "Communication, clarity, and stakeholder handling",
      "Ownership, pace, and execution under pressure",
      "Systematic thinking and structured decision-making",
    ],
  },
  {
    id: "evaluation_signal",
    title: "Which signals should the AI prioritize?",
    options: [
      "Relevant experience and domain alignment",
      "Confidence in the candidate's screening answers",
      "Consistency between profile and conversation",
      "Evidence of impact, ownership, and follow-through",
    ],
  },
];

const DEFAULT_JOB_QUESTION_SUGGESTIONS = [
  {
    id: "availability",
    label: "Availability",
    question: "We must fill this role immediately, How soon can you join us?",
    note: "Capture near-term readiness quickly.",
  },
  {
    id: "notice-period",
    label: "Notice Period",
    question: "What is your current notice period?",
    note: "Useful for prioritizing candidates in motion.",
  },
  {
    id: "current-salary",
    label: "Current Salary",
    question: "What is your Current Annual Salary in INR?",
    note: "Use only when compensation alignment matters.",
  },
  {
    id: "salary-expectation",
    label: "Salary Expectation",
    question: "What are your Salary Expectations?",
    note: "Keep this focused on the target range for the role.",
  },
  {
    id: "job-location",
    label: "Job Location",
    question: "The Job Role is on-site based out of the selected location. Are you comfortable commuting to the location?",
    note: "Useful when commute or work setup fit matters.",
  },
  {
    id: "current-company",
    label: "Current Company",
    question: "What is the name of the Current Company you are working with?",
    note: "Helpful when the current employer context matters.",
  },
];

const DEFAULT_FORM = {
  title: "",
  employmentType: "full_time",
  workplaceType: "hybrid",
  city: "",
  locality: "",
  positions: "1",
  experienceFrom: "",
  experienceTo: "",
  interviewRounds: "1",
  salaryMin: "",
  salaryMax: "",
  currency: "INR",
  hideCompensationFromCandidates: true,
  jobDescription: "",
  primarySkills: [],
  secondarySkills: [],
  // Pre-render a couple of standard questions by default (parity with the old product).
  questions: DEFAULT_JOB_QUESTION_SUGGESTIONS.slice(0, 2).map((item) => ({ id: item.id, label: item.label, question: item.question, note: item.note })),
  questionFormat: "cv_and_prescreen",
  preScreeningMode: "manual",
  companyBrief: "",
  benefits: [],
  evaluationContext: "",
  additionalInformation: "",
};

function formFromJob(job) {
  const roleSpec = job?.roleSpec ?? {};
  const content = job?.content ?? {};
  const screeningConfig = job?.screeningConfig ?? {};
  const evaluationConfig = job?.evaluationConfig ?? {};
  return {
    title: job?.core?.title ?? "",
    employmentType: roleSpec.employmentType ?? "full_time",
    workplaceType: roleSpec.workplaceType ?? "hybrid",
    city: roleSpec.city ?? "",
    locality: roleSpec.locality ?? "",
    positions: String(roleSpec.positions ?? "1"),
    experienceFrom: String(roleSpec.experienceFrom ?? ""),
    experienceTo: String(roleSpec.experienceTo ?? ""),
    interviewRounds: String(roleSpec.interviewRounds ?? "1"),
    salaryMin: String(roleSpec.salaryRange?.min ?? ""),
    salaryMax: String(roleSpec.salaryRange?.max ?? ""),
    currency: roleSpec.salaryRange?.currency ?? "INR",
    hideCompensationFromCandidates: Boolean(roleSpec.hideCompensationFromCandidates ?? true),
    jobDescription: content.jobDescription ?? "",
    primarySkills: Array.isArray(content.primarySkills) ? content.primarySkills : [],
    secondarySkills: Array.isArray(content.secondarySkills) ? content.secondarySkills : [],
    questions: Array.isArray(screeningConfig.questions)
      ? screeningConfig.questions.map((item, index) => ({
          id: normalizeQuestionId(item.id, index),
          label: item.label ?? "Custom",
          question: item.question ?? item.text ?? "",
          note: item.note ?? "",
        }))
      : DEFAULT_FORM.questions,
    questionFormat: screeningConfig.questionFormat ?? "cv_and_prescreen",
    preScreeningMode: screeningConfig.preScreeningMode ?? "manual",
    companyBrief: content.companyBrief ?? "",
    benefits: Array.isArray(content.benefits) ? content.benefits : [],
    evaluationContext: evaluationConfig.evaluationContext ?? "",
    additionalInformation: job?.additionalInformation ?? "",
  };
}

function currencyLocale(currency = "INR") {
  return CURRENCY_LOCALES[currency] ?? "en-US";
}

function formatCurrencyValue(value, currency = "INR") {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  const numericValue = Number(digitsOnly);
  if (!Number.isFinite(numericValue)) return digitsOnly;
  return new Intl.NumberFormat(currencyLocale(currency), { maximumFractionDigits: 0, useGrouping: true }).format(numericValue);
}

function digitsOnly(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function toNumber(value) {
  const normalized = digitsOnly(value);
  if (!normalized) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createQuestionItem(label, question, note = "") {
  return {
    id: `question-${Math.random().toString(36).slice(2, 8)}`,
    label,
    question,
    note,
  };
}

function normalizeQuestionId(value, index = 0) {
  const raw = String(value ?? "").trim();
  if (!raw) return `question-${index + 1}`;
  if (raw.startsWith("question-")) return raw;
  return `question-${raw}-${index + 1}`;
}

function normalizeQuestionKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function buildPayload(form, status, job) {
  const now = new Date().toISOString();
  return {
    core: {
      id: job?.core?.id,
      title: form.title.trim(),
      status,
      clientId: job?.core?.clientId ?? null,
      priority: job?.core?.priority ?? "medium",
      assigneeId: job?.core?.assigneeId ?? null,
      createdById: job?.core?.createdById ?? null,
      archivedAt: job?.core?.archivedAt ?? null,
      createdAt: job?.core?.createdAt ?? now,
      ...(status === "published" ? { publishedAt: now } : {}),
    },
    roleSpec: {
      positions: toNumber(form.positions) ?? 1,
      experienceFrom: toNumber(form.experienceFrom),
      experienceTo: toNumber(form.experienceTo),
      interviewRounds: toNumber(form.interviewRounds) ?? 1,
      employmentType: form.employmentType,
      workplaceType: form.workplaceType,
      city: form.city.trim(),
      locality: form.locality.trim(),
      salaryRange: {
        min: toNumber(form.salaryMin),
        max: toNumber(form.salaryMax),
        currency: form.currency,
      },
      hideCompensationFromCandidates: Boolean(form.hideCompensationFromCandidates),
    },
    content: {
      jobDescription: form.jobDescription.trim(),
      primarySkills: form.primarySkills,
      secondarySkills: form.secondarySkills,
      companyBrief: form.companyBrief.trim(),
      benefits: form.benefits,
    },
    screeningConfig: {
      questionFormat: form.questionFormat,
      preScreeningMode: form.preScreeningMode,
      questions: form.questions.map((item) => {
        const trimmed = String(item?.question ?? "").trim();
        return trimmed ? { id: item.id, label: item.label, question: trimmed, note: item.note ?? "" } : null;
      }).filter(Boolean),
    },
    evaluationConfig: {
      evaluationContext: form.evaluationContext.trim(),
      evaluationRounds: [],
    },
    additionalInformation: form.additionalInformation.trim(),
  };
}

function EvJobCreateSheet({ open, onOpenChange, onCreate, initialJob = null }) {
  const [step, setStep] = useState("basic");
  const [form, setForm] = useState(() => formFromJob(initialJob));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isUploadJdOpen, setIsUploadJdOpen] = useState(false);
  const [isCustomQuestionComposerOpen, setIsCustomQuestionComposerOpen] = useState(false);
  const [customQuestionDraft, setCustomQuestionDraft] = useState("");
  const [customQuestionSuggestion, setCustomQuestionSuggestion] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionDraft, setEditingQuestionDraft] = useState(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState(null);
  const [dragHandleQuestionId, setDragHandleQuestionId] = useState(null);
  const [isEvaluationContextOpen, setIsEvaluationContextOpen] = useState(false);
  const [evaluationContextStep, setEvaluationContextStep] = useState(0);
  const [evaluationContextAnswers, setEvaluationContextAnswers] = useState({});
  const [evaluationContextPromptInclusions, setEvaluationContextPromptInclusions] = useState({});
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const titleInputRef = useRef(null);
  const customQuestionInputRef = useRef(null);

  const initialForm = useMemo(() => formFromJob(initialJob), [initialJob]);
  // Any edit away from the initial form makes the sheet dirty → closing must confirm (parity with old).
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const title = form.title.trim();
  const isRemote = form.workplaceType === "remote";
  const headerDescription = title ? `${title}` : "Enter job details to get started"; //Replaces the header's description when user starts typing [Sree]
  const basicRequiredFields = ["title", "employmentType", "workplaceType", "city", "experienceFrom", "positions"];
  const basicFieldOrder = [
    "title",
    "employmentType",
    "workplaceType",
    "city",
    "locality",
    "experienceFrom",
    "experienceTo",
    "positions",
    "interviewRounds",
    "salaryMin",
    "salaryMax",
    "currency",
  ];

  const stepIndex = (value) => STEPS.findIndex((item) => item.value === value);
  const currentIndex = stepIndex(step);

  function clearError(name) {
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    clearError(name);
  }

  function handleOpenChange(nextOpen) {
    if (nextOpen) {
      setStep("basic");
      onOpenChange?.(true);
      return;
    }
    requestClose();
  }

  // Close request (Esc / scrim / X / Cancel / Back-on-first-step): confirm first if there are unsaved edits.
  function requestClose() {
    if (isDirty && !submitting) {
      setConfirmDiscardOpen(true);
      return;
    }
    onOpenChange?.(false);
  }

  function discardAndClose() {
    setConfirmDiscardOpen(false);
    onOpenChange?.(false);
  }

  function syncExperienceRange(name, value) {
    const normalized = digitsOnly(value);
    const next = { ...form, [name]: normalized };
    setForm(next);

    const min = toNumber(next.experienceFrom);
    const max = toNumber(next.experienceTo);
    const invalid = min != null && max != null && min > max;

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      // Clear the edited field's own required error once it has a value (e.g. "Experience min is required.").
      if (normalized && nextErrors[name]) delete nextErrors[name];
      // The min > max range error lives on experienceTo.
      if (invalid) nextErrors.experienceTo = "Check the range please.";
      else delete nextErrors.experienceTo;
      return nextErrors;
    });
  }

  function focusNextField(currentName) {
    const index = basicFieldOrder.indexOf(currentName);
    const nextName = basicFieldOrder[index + 1];
    if (!nextName) return;
    requestAnimationFrame(() => focusField(nextName));
  }

  function focusField(name) {
    if (typeof document === "undefined") return;
    const node = document.querySelector(`[name="${name}"]`) || document.getElementById(name);
    if (node && typeof node.focus === "function") {
      node.focus();
      if (typeof node.select === "function") node.select();
    }
  }

  function validateBasicStep() {
    const nextErrors = {};
    if (!title) nextErrors.title = "Job title is required.";
    if (!form.employmentType) nextErrors.employmentType = "Employment type is required.";
    if (!form.workplaceType) nextErrors.workplaceType = "Workplace type is required.";
    if (!isRemote && !String(form.city).trim()) nextErrors.city = "City is required.";
    if (!String(form.experienceFrom).trim()) nextErrors.experienceFrom = "Experience min is required.";
    if (!String(form.positions).trim()) nextErrors.positions = "Openings is required.";

    if (String(form.experienceFrom).trim() && String(form.experienceTo).trim() && Number(form.experienceFrom) > Number(form.experienceTo)) {
      nextErrors.experienceTo = "Check Range.";
    }

    setErrors((current) => {
      const next = { ...current };
      for (const field of basicRequiredFields) delete next[field];
      delete next.experienceTo;
      return { ...next, ...nextErrors };
    });
    const firstError = [...basicRequiredFields, "experienceTo"].find((field) => nextErrors[field]);
    if (firstError) requestAnimationFrame(() => focusField(firstError));
    return Object.keys(nextErrors).length === 0;
  }

  function validateDescriptionStep() {
    return true;
  }

  function validateQuestionnaireStep() {
    const nextErrors = {};
    if (!form.questions.length) nextErrors.questions = "Add at least one screening question.";
    setErrors((current) => ({ ...current, ...nextErrors }));
    if (nextErrors.questions) {
      setIsCustomQuestionComposerOpen(true);
      requestAnimationFrame(() => customQuestionInputRef.current?.focus?.());
    }
    return Object.keys(nextErrors).length === 0;
  }

  function validateCurrentStep(nextStep) {
    if (stepIndex(nextStep) <= currentIndex) return true;
    if (step === "basic") return validateBasicStep();
    if (step === "description") return validateDescriptionStep();
    if (step === "questionnaire") return validateQuestionnaireStep();
    return true;
  }

  function validateForPublish() {
    if (!validateBasicStep()) {
      setStep("basic");
      return false;
    }
    if (!validateDescriptionStep()) {
      setStep("description");
      return false;
    }
    if (!validateQuestionnaireStep()) {
      setStep("questionnaire");
      return false;
    }
    return true;
  }

  function patchArrayField(name, nextValues) {
    setField(name, nextValues);
  }

  function getQuestionTemplateText(template) {
    return template.question;
  }

  function addQuestion(question) {
    const resolvedQuestionText = getQuestionTemplateText(question);
    setField("questions", [...form.questions, createQuestionItem(question.label, resolvedQuestionText, question.note)]);
    setCustomQuestionSuggestion("");
  }

  function removeQuestion(questionId) {
    setField("questions", form.questions.filter((question) => question.id !== questionId));
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
      setEditingQuestionDraft(null);
    }
  }

  function moveQuestionToIndex(questionId, targetIndex) {
    const currentIndex = form.questions.findIndex((question) => question.id === questionId);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= form.questions.length) return;
    const nextQuestions = [...form.questions];
    const [question] = nextQuestions.splice(currentIndex, 1);
    nextQuestions.splice(targetIndex, 0, question);
    setField("questions", nextQuestions);
  }

  function beginQuestionEdit(question) {
    setEditingQuestionId(question.id);
    setEditingQuestionDraft({
      label: question.label,
      question: question.question,
    });
  }

  function cancelQuestionEdit() {
    setEditingQuestionId(null);
    setEditingQuestionDraft(null);
  }

  function saveQuestionEdit(questionId) {
    if (!editingQuestionDraft) {
      setEditingQuestionId(null);
      return;
    }
    setField(
      "questions",
      form.questions.map((question) =>
        question.id === questionId
          ? createQuestionItem(editingQuestionDraft.label, editingQuestionDraft.question, question.note)
          : question,
      ),
    );
    setEditingQuestionId(null);
    setEditingQuestionDraft(null);
  }

  function suggestCustomQuestion(nextValue) {
    const normalized = String(nextValue ?? "").trim().toLowerCase();
    if (!normalized) return "";
    const suggestion = DEFAULT_JOB_QUESTION_SUGGESTIONS.find((question) => normalizeQuestionKey(question.question).startsWith(normalized));
    return suggestion?.question ?? "";
  }

  function handleCustomQuestionChange(nextValue) {
    const resolvedValue = String(nextValue?.target?.value ?? nextValue?.currentTarget?.value ?? nextValue ?? "");
    setCustomQuestionDraft(resolvedValue);
    setCustomQuestionSuggestion(suggestCustomQuestion(resolvedValue));
  }

  function acceptCustomQuestionSuggestion() {
    if (!customQuestionSuggestion) return;
    setCustomQuestionDraft(customQuestionSuggestion);
  }

  function commitCustomQuestion(nextQuestion = customQuestionDraft) {
    const trimmedQuestion = String(nextQuestion ?? "").trim();
    if (!trimmedQuestion) return;
    addQuestion({
      label: "Custom",
      question: trimmedQuestion,
      note: "",
    });
    setCustomQuestionDraft("");
    setCustomQuestionSuggestion("");
    setIsCustomQuestionComposerOpen(false);
  }

  function renderQuestionCard(question) {
    const questionIndex = form.questions.findIndex((item) => item.id === question.id);
    const isEditing = editingQuestionId === question.id;
    const draft = isEditing && editingQuestionDraft ? editingQuestionDraft : { label: question.label, question: question.question };

    return (
      <div
        key={normalizeQuestionId(question.id, questionIndex)}
        draggable={dragHandleQuestionId === question.id}
        onDragStart={() => setDraggedQuestionId(question.id)}
        onDragOver={(event) => {
          event.preventDefault();
          if (draggedQuestionId && draggedQuestionId !== question.id) setDragOverQuestionId(question.id);
        }}
        onDrop={() => {
          if (draggedQuestionId) moveQuestionToIndex(draggedQuestionId, questionIndex);
          setDraggedQuestionId(null);
          setDragOverQuestionId(null);
          setDragHandleQuestionId(null);
        }}
        onDragEnd={() => {
          setDraggedQuestionId(null);
          setDragOverQuestionId(null);
          setDragHandleQuestionId(null);
        }}
        className={cn(
          "rounded-[10px] border bg-[var(--fx-surface)] px-[14px] py-[12px]",
          dragOverQuestionId === question.id && draggedQuestionId !== question.id
            ? "border-[var(--fx-primary)] ring-1 ring-[var(--fx-primary)]"
            : "border-[var(--fx-border)]",
          draggedQuestionId === question.id ? "opacity-50" : "",
        )}
      >
        <div className="flex items-start gap-[12px]">
          <button
            type="button"
            aria-label="Reorder question"
            onPointerDown={() => setDragHandleQuestionId(question.id)}
            onPointerUp={() => setDragHandleQuestionId(null)}
            className="mt-[2px] inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] active:cursor-grabbing"
          >
            <GripVertical className="size-[16px]" />
          </button>

          <div className="min-w-0 flex-1 space-y-[6px]">
            {isEditing ? (
              <>
                <FxInput
                  label="Question Type"
                  value={draft.label}
                  onChange={(event) =>
                    setEditingQuestionDraft((current) => ({
                      ...(current ?? { label: question.label, question: question.question }),
                      label: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      cancelQuestionEdit();
                    }
                  }}
                  size="sm"
                />
                <FxInput
                  label="Question"
                  value={draft.question}
                  onChange={(event) =>
                    setEditingQuestionDraft((current) => ({
                      ...(current ?? { label: question.label, question: question.question }),
                      question: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      cancelQuestionEdit();
                    }
                  }}
                  size="sm"
                />
              </>
            ) : (
              <>
                <span className="block text-[12px] font-medium leading-[18px] text-[var(--fx-text-muted)]">
                  {question.label || "General"}
                </span>
                <p className="text-[13px] font-medium leading-[20px] text-[var(--fx-text)]">{question.question}</p>
              </>
            )}
          </div>

          <div className={cn("flex shrink-0 items-start gap-[4px]", isEditing ? "pt-[29px]" : "pt-[20px]")}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                  onClick={cancelQuestionEdit}
                  aria-label="Cancel question edit"
                >
                  <span className="text-[12px] leading-none font-medium">Cancel</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                  onClick={() => saveQuestionEdit(question.id)}
                  aria-label="Save question"
                >
                  <Save className="size-[15px]" />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                onClick={() => beginQuestionEdit(question)}
                aria-label="Edit question"
              >
                <Pencil className="size-[15px]" />
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
              onClick={() => removeQuestion(question.id)}
              aria-label="Remove question"
            >
              <Trash2 className="size-[15px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function autofillJobDescription() {
    const jobTitle = title || "the role";
    const primarySkills = ["Communication", "Role Fit", "Candidate Screening", jobTitle]
      .map((item) => String(item).trim())
      .filter(Boolean);
    const secondarySkills = ["AI Collaboration", "Reporting", "Team Coordination", `${jobTitle} Execution`]
      .map((item) => String(item).trim())
      .filter(Boolean);

    setField(
      "jobDescription",
      [
        `<h2><strong>${escapeHtml(jobTitle)}</strong></h2>`,
        `<p>We are looking for a hands-on professional who can own day-to-day execution, communicate clearly, and move work forward with minimal supervision.</p>`,
        `<h3>What you will do</h3>`,
        `<ul><li>Own the core responsibilities for the role and keep delivery on track.</li><li>Work with recruiters, hiring managers, or team leads to keep expectations aligned.</li><li>Contribute ideas, raise risks early, and help improve how the team works.</li></ul>`,
        `<h3>What we expect</h3>`,
        `<ul><li>Relevant experience in similar work or environments.</li><li>Good communication and follow-through.</li><li>Comfort with fast-moving, collaborative work.</li></ul>`,
        `<h3>Nice to have</h3>`,
        `<ul><li>Experience with similar tools, workflows, or domain context.</li><li>Ability to work independently and keep stakeholders updated.</li></ul>`,
      ].join(""),
    );
    setField("primarySkills", primarySkills);
    setField("secondarySkills", secondarySkills);
  }

  function autofillPrimarySkills() {
    const jobTitle = title || "the role";
    setField(
      "primarySkills",
      ["Communication", "Role Fit", "Candidate Screening", jobTitle]
        .map((item) => String(item).trim())
        .filter(Boolean),
    );
  }

  function autofillSecondarySkills() {
    const jobTitle = title || "the role";
    setField(
      "secondarySkills",
      ["AI Collaboration", "Reporting", "Team Coordination", `${jobTitle} Execution`]
        .map((item) => String(item).trim())
        .filter(Boolean),
    );
  }

  function handleUploadJdFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "").trim();
      if (text) setField("jobDescription", `<p>${escapeHtml(text).replace(/\n/g, "</p><p>")}</p>`);
      setIsUploadJdOpen(false);
    };
    reader.readAsText(file);
  }

  async function commit(status) {
    if (!title) {
      setStep("basic");
      validateBasicStep();
      return;
    }

    if (status === "published" && !validateForPublish()) return;
    if (status === "draft" && !validateBasicStep()) return;

    setSubmitting(true);
    try {
      await onCreate?.(buildPayload(form, status, initialJob), status, initialJob);
      onOpenChange?.(false);
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!validateCurrentStep(STEPS[currentIndex + 1]?.value)) return;
    setStep(STEPS[Math.min(currentIndex + 1, STEPS.length - 1)].value);
  }

  function goBack() {
    setStep(STEPS[Math.max(currentIndex - 1, 0)].value);
  }

  function goToSheetStep(value) {
    setStep(value);
  }

  function toggleBenefit(label) {
    setField("benefits", form.benefits.includes(label) ? form.benefits.filter((item) => item !== label) : [...form.benefits, label]);
  }

  // Generate Context: turn the picked prompt answers into an evaluation-context draft (only when empty).
  function applyEvaluationContextDraft() {
    const selectedAnswers = EVALUATION_CONTEXT_PROMPTS.flatMap((prompt) =>
      evaluationContextPromptInclusions[prompt.id] === false ? [] : evaluationContextAnswers[prompt.id] ?? [],
    );
    const roleTitle = form.title.trim() || "the role";
    const summary = selectedAnswers.length ? selectedAnswers.join("; ") : "Role fit, communication, and readiness to move quickly.";
    setField(
      "evaluationContext",
      form.evaluationContext ||
        `Evaluate ${roleTitle} with focus on ${summary}. Keep the screening context practical, compact, and easy for recruiters to run.`,
    );
    setIsEvaluationContextOpen(false);
    setEvaluationContextStep(0);
    setEvaluationContextPromptInclusions({});
  }

  const evaluationMissing = !String(form.evaluationContext).trim();
  const reviewBasicComplete = Boolean(
    title &&
      String(form.experienceFrom).trim() &&
      form.employmentType &&
      form.workplaceType &&
      String(form.positions).trim() &&
      (isRemote || String(form.city).trim()),
  );
  const reviewDescriptionComplete = form.jobDescription.trim().length > 0;
  const reviewQuestionnaireComplete = form.questions.length > 0;
  const reviewBenefitsComplete = form.benefits.length > 0;
  const reviewEvaluationComplete = String(form.evaluationContext).trim().length > 0;

  function renderBenefitItem(item) {
    const active = form.benefits.includes(item.label);
    const Icon = item.icon;
    return (
      <label
        key={item.label}
        className={cn(
          "flex w-full cursor-pointer items-start gap-2 rounded-[8px] px-1 py-1 transition-colors hover:bg-[var(--fx-surface-hover)]",
          active ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]",
        )}
      >
        <Checkbox checked={active} onCheckedChange={() => toggleBenefit(item.label)} className="mt-0.5 size-4 shrink-0" />
        {Icon ? <Icon className="mt-0.5 size-4 shrink-0 text-[var(--fx-primary)]" /> : null}
        <span className="min-w-0 text-[14px] font-medium leading-[22px]">{item.label}</span>
      </label>
    );
  }

  function renderReviewRow({ title: rowTitle, step: rowStep, complete, missing }) {
    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-4 shrink-0 items-center justify-center">
            {complete ? (
              <BadgeCheck className="size-4 text-[var(--fx-success)]" />
            ) : (
              <Circle className="size-2 fill-current text-[var(--fx-warning)]" />
            )}
          </span>
          <p className="flex min-w-0 items-center gap-1.5 text-[14px] text-[var(--fx-text-muted)]">
            <span className="truncate font-normal">{rowTitle}</span>
            {!complete && missing ? <span className="min-w-0 truncate font-medium text-[var(--fx-text)]">- {missing}</span> : null}
          </p>
        </div>
        <FxButton type="button" variant="ghost" size="sm" onClick={() => goToSheetStep(rowStep)}>
          Edit
        </FxButton>
      </div>
    );
  }

  function renderEvaluationMissingCard() {
    return (
      <div className="rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-warning)_32%,var(--fx-border)_68%)] bg-[color:color-mix(in_srgb,var(--fx-warning)_8%,var(--fx-surface)_92%)] p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-[14px] font-medium text-[var(--fx-text-muted)]">Evaluation</h4>
              <p className="text-[14px] font-medium text-[var(--fx-text)]">Evaluation Context Missing</p>
              <p className="text-[13px] leading-5 text-[var(--fx-text-muted)]">Add context before publishing, or finish it later.</p>
            </div>
            <FxButton type="button" variant="ghost" size="sm" onClick={() => goToSheetStep("evaluation")}>
              Edit
            </FxButton>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <FxButton
              type="button"
              variant="outline"
              size="sm"
              className="border-[var(--fx-primary)] text-[var(--fx-primary)] hover:bg-[color-mix(in_srgb,var(--fx-primary)_8%,var(--fx-surface)_92%)]"
              onClick={() => goToSheetStep("evaluation")}
            >
              Go to Evaluation
            </FxButton>
            <FxButton type="button" variant="destructive" size="sm" onClick={() => commit("published")}>
              Publish Anyway
            </FxButton>
          </div>
        </div>
      </div>
    );
  }

  function renderEvaluationPromptCard() {
    const prompt = EVALUATION_CONTEXT_PROMPTS[evaluationContextStep];
    const selectedValues = evaluationContextAnswers[prompt.id] ?? [];
    const isIncluded = evaluationContextPromptInclusions[prompt.id] !== false;
    return (
      <div className="space-y-4 rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-[16px] font-medium leading-6 text-[var(--fx-text)]">{prompt.title}</h3>
            <p className="text-[13px] leading-5 text-[var(--fx-text-muted)]">
              Select the questions that apply and answer them. Evality will use these answers to generate the evaluation context.
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2.5 py-1.5">
            <Checkbox
              checked={isIncluded}
              onCheckedChange={(checked) => setEvaluationContextPromptInclusions((current) => ({ ...current, [prompt.id]: Boolean(checked) }))}
            />
            <span className="text-[13px] font-medium text-[var(--fx-text)]">Use this question</span>
          </label>
        </div>
        <div className={cn("space-y-2", !isIncluded && "opacity-50")}>
          {prompt.options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <label
                key={`${prompt.id}-${String(option)}`}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[12px] border px-3.5 py-3 text-left transition-colors",
                  !isIncluded
                    ? "cursor-not-allowed border-[var(--fx-border)] bg-[var(--fx-surface)]"
                    : isSelected
                      ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                      : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={!isIncluded}
                  className="mt-0.5"
                  onCheckedChange={(checked) =>
                    isIncluded &&
                    setEvaluationContextAnswers((current) => ({
                      ...current,
                      [prompt.id]: checked ? [...selectedValues, option] : selectedValues.filter((value) => value !== option),
                    }))
                  }
                />
                <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <FxSheet
      open={open}
      onOpenChange={handleOpenChange}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        requestAnimationFrame(() => {
          const node = titleInputRef.current;
          if (node && typeof node.focus === "function") {
            node.focus();
            if (typeof node.select === "function") node.select();
          }
        });
      }}
      size="md"
      title={initialJob ? "Edit Job" : "Create Job"}
      description={headerDescription}
      headerActions={
        <>
          <FxButton variant="ghost" size="sm" onClick={() => commit("draft")} loading={submitting}>
            <Save className="size-4" />
            Save as Draft
          </FxButton>
          <FxButton size="sm" onClick={() => commit("published")} loading={submitting}>
            <Send className="size-4" />
            Publish
          </FxButton>
        </>
      }
      footerStart={
        <FxButton variant="ghost" size="sm" onClick={requestClose}>
          Cancel
        </FxButton>
      }
      footer={
        <>
          <FxButton variant="outline" size="sm" onClick={goBack} disabled={step === "basic"}>
            <ArrowLeft className="size-4" />
            Back
          </FxButton>
          {step === "review" ? (
            <FxButton size="sm" onClick={() => commit("published")} loading={submitting}>
              Publish
            </FxButton>
          ) : (
            <FxButton variant="secondary" size="sm" onClick={goNext}>
              Next
              <ArrowRight className="size-4" />
            </FxButton>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <FxTabs
          variant="regular"
          value={step}
          onValueChange={(nextStep) => {
            if (!validateCurrentStep(nextStep)) return;
            setStep(nextStep);
          }}
          tabs={STEPS}
          className="w-full"
          fullWidth
          showIcons={false}
        >
          <FxTabs.Content value="basic" className="mt-5 space-y-5">
            <div className="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-12">
                  <FxInput
                    ref={titleInputRef}
                    name="title"
                    label="Job Title"
                    size="lg"
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("title");
                    }}
                    required
                    message={errors.title}
                    placeholder="Senior Frontend Engineer"
                  />
                </div>

                <div className="xl:col-span-6">
                  <FxSelect
                    name="employmentType"
                    label="Employment Type"
                    size="lg"
                    value={form.employmentType}
                    onChange={(value) => setField("employmentType", value)}
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    required
                    placeholder="Employment type"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("employmentType");
                    }}
                  />
                </div>

                <div className="xl:col-span-6">
                  <FxSelect
                    name="workplaceType"
                    label="Workplace Type"
                    size="lg"
                    value={form.workplaceType}
                    onChange={(value) => setField("workplaceType", value)}
                    options={WORKPLACE_TYPE_OPTIONS}
                    required
                    placeholder="Workplace type"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("workplaceType");
                    }}
                  />
                </div>

                <div className="xl:col-span-6">
                  <FxInput
                    name="city"
                    label="City"
                    size="lg"
                    value={form.city}
                    onChange={(event) => setField("city", event.target.value)}
                    required={!isRemote}
                    message={errors.city}
                    placeholder={isRemote ? "Bengaluru" : "Bengaluru"}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("city");
                    }}
                  />
                </div>

                <div className="xl:col-span-6">
                  <FxInput
                    name="locality"
                    label="Locality"
                    size="lg"
                    value={form.locality}
                    onChange={(event) => setField("locality", event.target.value)}
                    placeholder="HSR Layout"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("locality");
                    }}
                  />
                </div>

                <div className="xl:col-span-3">
                  <FxInput
                    name="experienceFrom"
                    label="Experience Min"
                    size="lg"
                    value={form.experienceFrom}
                    onChange={(event) => syncExperienceRange("experienceFrom", event.target.value)}
                    required
                    message={errors.experienceFrom}
                    inputMode="numeric"
                    placeholder="Min"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("experienceFrom");
                    }}
                  />
                </div>

                <div className="xl:col-span-3">
                  <FxInput
                    name="experienceTo"
                    label="Experience Max"
                    size="lg"
                    value={form.experienceTo}
                    onChange={(event) => syncExperienceRange("experienceTo", event.target.value)}
                    message={errors.experienceTo}
                    inputMode="numeric"
                    placeholder="Max"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("experienceTo");
                    }}
                  />
                </div>

                <div className="xl:col-span-3">
                  <FxInput
                    name="positions"
                    label="Openings"
                    size="lg"
                    value={form.positions}
                    onChange={(event) => setField("positions", digitsOnly(event.target.value))}
                    required
                    message={errors.positions}
                    inputMode="numeric"
                    placeholder="1"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("positions");
                    }}
                  />
                </div>

                <div className="xl:col-span-3">
                  <FxInput
                    name="interviewRounds"
                    label="Interview Rounds"
                    size="lg"
                    value={form.interviewRounds}
                    onChange={(event) => setField("interviewRounds", digitsOnly(event.target.value))}
                    inputMode="numeric"
                    placeholder="1"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("interviewRounds");
                    }}
                  />
                </div>

                <div className="xl:col-span-12">
                  <p className="text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">Compensation</p>
                </div>

                <div className="xl:col-span-4">
                  <FxInput
                    name="salaryMin"
                    label="Salary Min"
                    size="lg"
                    value={formatCurrencyValue(form.salaryMin, form.currency)}
                    onChange={(event) => setField("salaryMin", digitsOnly(event.target.value))}
                    inputMode="numeric"
                    placeholder={formatCurrencyValue("1000000", form.currency)}
                    inputClassName="text-right"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("salaryMin");
                    }}
                  />
                </div>

                <div className="xl:col-span-4">
                  <FxInput
                    name="salaryMax"
                    label="Salary Max"
                    size="lg"
                    value={formatCurrencyValue(form.salaryMax, form.currency)}
                    onChange={(event) => setField("salaryMax", digitsOnly(event.target.value))}
                    inputMode="numeric"
                    placeholder={formatCurrencyValue("1500000", form.currency)}
                    inputClassName="text-right"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("salaryMax");
                    }}
                  />
                </div>

                <div className="xl:col-span-4">
                  <FxSelect
                    name="currency"
                    label="Currency"
                    size="lg"
                    value={form.currency}
                    onChange={(value) => setField("currency", value)}
                    options={CURRENCY_OPTIONS}
                    placeholder="Currency"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      focusNextField("currency");
                    }}
                  />
                </div>

                <div className="xl:col-span-12">
                  <label className="flex items-start gap-3 pt-1">
                    <Checkbox
                      defaultChecked
                      checked={Boolean(form.hideCompensationFromCandidates)}
                      onCheckedChange={(checked) => setField("hideCompensationFromCandidates", Boolean(checked))}
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-foreground">Don&apos;t Show Salary to Candidates</span>
                      <span className="block text-[13px] leading-5 text-muted-foreground">
                        Keep the compensation private on the candidate-facing job.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </FxTabs.Content>

          <FxTabs.Content value="description" className="mt-5 space-y-5">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-[16px] font-normal leading-[24px] text-[var(--fx-text)]">Job Description</h3>
                  <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                    Upload an existing JD or write one with AI.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <FxButton type="button" variant="outline" size="sm" onClick={() => setIsUploadJdOpen(true)}>
                    <Upload className="size-4" />
                    Upload JD
                  </FxButton>
                  <FxAiButton size="sm" onClick={autofillJobDescription}>
                    Generate JD
                  </FxAiButton>
                </div>
              </div>

              <FxRichTextEditor
                name="jobDescription"
                value={form.jobDescription}
                onChange={(nextValue) => setField("jobDescription", nextValue)}
                placeholder="Add job description"
                minHeight={320}
                toolbarPosition="bottom"
              />

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-medium leading-[20px] text-[var(--fx-text-muted)]">Primary Skills</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setField("primarySkills", [])}
                        disabled={!form.primarySkills.length}
                        className="text-[13px] leading-[20px] font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40"
                      >
                        Clear All
                      </button>
                      <FxAiButton size="sm" onClick={autofillPrimarySkills}>
                        Get Primary Skills
                      </FxAiButton>
                    </div>
                  </div>
                  <FxTagsInput
                    name="primarySkills"
                    value={form.primarySkills}
                    onChange={(value) => patchArrayField("primarySkills", value)}
                    size="lg"
                    placeholder="Add primary skills"
                    emptyText="No primary skills yet"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-medium leading-[20px] text-[var(--fx-text-muted)]">Secondary Skills</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setField("secondarySkills", [])}
                        disabled={!form.secondarySkills.length}
                        className="text-[13px] leading-[20px] font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40"
                      >
                        Clear All
                      </button>
                      <FxAiButton size="sm" onClick={autofillSecondarySkills}>
                        Get Secondary Skills
                      </FxAiButton>
                    </div>
                  </div>
                  <FxTagsInput
                    name="secondarySkills"
                    value={form.secondarySkills}
                    onChange={(value) => patchArrayField("secondarySkills", value)}
                    size="lg"
                    placeholder="Add secondary skills"
                    emptyText="No secondary skills yet"
                  />
                </div>
              </div>
            </div>
          </FxTabs.Content>

          <FxTabs.Content value="questionnaire" className="mt-5 space-y-5">
            <div className="space-y-6">
              <div className="space-y-[4px]">
                <p className="text-[16px] leading-[24px] font-normal text-[var(--fx-text)]">Setup Screening Mode</p>
                <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                  Candidates will answer these configured pre-screening questions. Default settings can be managed in Settings. Changes made here apply only to this job.
                </p>
              </div>

              <div className="grid gap-[12px]">
                <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
                  <div className="flex items-start gap-[12px] px-[16px] py-[16px]">
                    <Checkbox checked disabled className="mt-[2px]" />
                    <span className="min-w-0 space-y-[4px]">
                      <span className="block text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">Manual</span>
                      <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Review candidates yourself.</span>
                    </span>
                  </div>
                </div>

                <div className={`rounded-[12px] border ${form.preScreeningMode === "form" ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]" : "border-[var(--fx-border)] bg-[var(--fx-surface)]"}`}>
                  <div className="grid gap-[12px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <label className="flex cursor-pointer items-start gap-[12px] px-[16px] py-[16px] text-left">
                      <Checkbox
                        checked={form.preScreeningMode === "form"}
                        onCheckedChange={(checked) => setField("preScreeningMode", checked ? "form" : "manual")}
                        className="mt-[2px]"
                      />
                      <span className="min-w-0 space-y-[4px]">
                        <span className="block text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">Automated Email</span>
                        <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Candidates answer a questionnaire by email.</span>
                      </span>
                    </label>

                    {form.preScreeningMode === "form" ? (
                      <div className="border-l border-[var(--fx-border)] px-[16px] py-[16px]">
                        <RadioGroup
                          value={form.questionFormat || "cv_and_prescreen"}
                          onValueChange={(value) => setField("questionFormat", value)}
                          className="grid gap-[10px]"
                        >
                          {QUESTION_FORMAT_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              htmlFor={`question-format-${option.value}`}
                              className={`flex cursor-pointer items-start gap-[10px] rounded-[8px] border px-[12px] py-[12px] text-left transition-colors ${
                                form.questionFormat === option.value
                                  ? "border-[var(--fx-primary)] bg-[var(--fx-surface-subtle)]"
                                  : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
                              }`}
                            >
                              <RadioGroupItem
                                id={`question-format-${option.value}`}
                                value={option.value}
                                className="mt-[1px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
                              />
                              <span className="space-y-[2px]">
                                <span className="block text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">{option.label}</span>
                                <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{option.description}</span>
                              </span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    ) : (
                      <div className="hidden lg:block" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-[12px]">
                <div className="flex items-center justify-between gap-[12px]">
                  <h4 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]">Setup Standard Pre-Screening Questions</h4>
                </div>

                {form.questions.length ? (
                  <div className="space-y-[10px]">
                    {form.questions.map((question) => renderQuestionCard(question))}
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                    No questions added yet.
                  </div>
                )}

                {DEFAULT_JOB_QUESTION_SUGGESTIONS.length ? (
                  <div className="flex flex-wrap gap-[8px]">
                    {DEFAULT_JOB_QUESTION_SUGGESTIONS.filter((question) => {
                      const labelKey = normalizeQuestionKey(question.label);
                      const questionKey = normalizeQuestionKey(question.question);
                      return !form.questions.some((item) => normalizeQuestionKey(item.label) === labelKey || normalizeQuestionKey(item.question) === questionKey);
                    }).map((question) => (
                      <FxButton
                        key={question.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-[6px]"
                        onClick={() => addQuestion(question)}
                      >
                        <Plus className="size-[14px]" />
                        {question.label}
                      </FxButton>
                    ))}
                    <FxButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-[6px] text-[var(--fx-primary)] hover:bg-[var(--fx-surface-selected)] hover:text-[var(--fx-primary)]"
                      onClick={() => {
                        setIsCustomQuestionComposerOpen(true);
                        requestAnimationFrame(() => customQuestionInputRef.current?.focus?.());
                      }}
                    >
                      <Plus className="size-[14px]" />
                      Add Custom
                    </FxButton>
                  </div>
                ) : null}

                {isCustomQuestionComposerOpen ? (
                  <div className="space-y-[10px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[14px]">
                    <FxInput
                      ref={customQuestionInputRef}
                      label="Question Text"
                      value={customQuestionDraft}
                      onChange={handleCustomQuestionChange}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitCustomQuestion();
                        }
                      }}
                      placeholder="Enter a screening question"
                      size="sm"
                    />
                    {customQuestionSuggestion ? (
                      <button
                        type="button"
                        onClick={acceptCustomQuestionSuggestion}
                        className="text-[13px] leading-[20px] text-[var(--fx-primary)] hover:text-[var(--fx-primary)]"
                      >
                        Suggested: {customQuestionSuggestion}
                      </button>
                    ) : null}
                    <div className="flex items-center justify-end gap-[8px]">
                      <FxButton type="button" variant="ghost" size="sm" onClick={() => setIsCustomQuestionComposerOpen(false)}>
                        Cancel
                      </FxButton>
                      <FxButton type="button" variant="secondary" size="sm" onClick={() => commitCustomQuestion()}>
                        Add Question
                      </FxButton>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </FxTabs.Content>

          <FxTabs.Content value="benefits" className="mt-5 space-y-5">
            <div className="space-y-4">
              <p className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                Check the benefits offered in the company. The AI agent will respond to candidate queries based on the details provided here.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {BENEFITS_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3 rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                    <h5 className="text-[14px] font-medium text-[var(--fx-text)]">{group.title}</h5>
                    <div className="space-y-2">{group.items.map(renderBenefitItem)}</div>
                  </div>
                ))}
              </div>
            </div>
          </FxTabs.Content>

          <FxTabs.Content value="evaluation" className="mt-5 space-y-5">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-[16px] font-semibold text-[var(--fx-text)]">Evaluation Context</h3>
                  <p className="text-[13px] leading-5 text-[var(--fx-text-muted)]">
                    Used for Candidate Fit Score, Candidate AI Analysis, AI Screening, Candidate Recommendations, and Question Generation.
                  </p>
                </div>
                <FxAiButton
                  size="sm"
                  onClick={() => {
                    setEvaluationContextStep(0);
                    setIsEvaluationContextOpen(true);
                  }}
                >
                  Generate Context
                </FxAiButton>
              </div>
              <FxTextarea
                name="evaluationContext"
                value={form.evaluationContext}
                onChange={(event) => setField("evaluationContext", event.target.value)}
                rows={6}
                placeholder="What should the AI pay attention to when screening candidates? Keep it practical and concise."
              />
            </div>
          </FxTabs.Content>

          <FxTabs.Content value="review" className="mt-5 space-y-5">
            <div className="space-y-4">
              <p className="text-[15px] font-medium text-[var(--fx-text)]">Review your job before publishing.</p>
              <div className="space-y-1 rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                {renderReviewRow({ title: "Basic Details", step: "basic", complete: reviewBasicComplete, missing: "Required role details are still missing." })}
                {renderReviewRow({ title: "Job Description", step: "description", complete: reviewDescriptionComplete, missing: "Add a job description before publishing." })}
                {renderReviewRow({ title: "Screening Mode", step: "questionnaire", complete: reviewQuestionnaireComplete, missing: "Set at least 1 pre-screen question." })}
                {renderReviewRow({ title: "Benefits", step: "benefits", complete: reviewBenefitsComplete, missing: "Select the benefits you want candidates to see." })}
                {evaluationMissing ? renderEvaluationMissingCard() : renderReviewRow({ title: "Evaluation", step: "evaluation", complete: reviewEvaluationComplete })}
              </div>
              <FxTextarea
                name="additionalInformation"
                label="Additional Information"
                value={form.additionalInformation}
                onChange={(event) => setField("additionalInformation", event.target.value)}
                rows={5}
                placeholder="Add recruiter notes before publishing"
              />
            </div>
          </FxTabs.Content>
        </FxTabs>
      </div>

      <EvUploadJobDescriptionDialog open={isUploadJdOpen} onOpenChange={setIsUploadJdOpen} onUpload={handleUploadJdFile} />

      <FxDialog
        open={isEvaluationContextOpen}
        onOpenChange={setIsEvaluationContextOpen}
        title="Generate Context"
        description="Select the questions that apply to this role and answer them. Evality will generate the evaluation context from your selections."
        className="sm:max-w-[720px]"
      >
        <div className="space-y-4">
          {renderEvaluationPromptCard()}
          <div className="flex items-center justify-between gap-3">
            <FxButton
              type="button"
              variant="outline"
              size="sm"
              disabled={evaluationContextStep === 0}
              onClick={() => setEvaluationContextStep((current) => Math.max(0, current - 1))}
            >
              Back
            </FxButton>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--fx-text-muted)]">
                {evaluationContextStep + 1} / {EVALUATION_CONTEXT_PROMPTS.length}
              </span>
              {evaluationContextStep < EVALUATION_CONTEXT_PROMPTS.length - 1 ? (
                <FxButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEvaluationContextStep((current) => Math.min(EVALUATION_CONTEXT_PROMPTS.length - 1, current + 1))}
                >
                  Next
                </FxButton>
              ) : (
                <FxButton type="button" size="sm" onClick={applyEvaluationContextDraft}>
                  Generate Context
                </FxButton>
              )}
            </div>
          </div>
        </div>
      </FxDialog>

      <FxConfirmDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
        title="Discard changes?"
        description="You have unsaved changes in the sheet. Closing now will discard them."
        tone="danger"
        confirmLabel="Discard Changes"
        onConfirm={discardAndClose}
      />
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvJobCreateSheet };
/* - - - - - - - - - - - - - - - - */
