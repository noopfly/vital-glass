import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleHelp,
  FileText,
  Info,
  PencilLine,
  Save,
  Send,
  ShieldAlert,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  incompleteSourceReports,
  type IncompleteSourceReport,
} from "@/lib/source-documents";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { cn } from "@/lib/utils";

type ParsedValue = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  warning?: string;
};

const initialValues: ParsedValue[] = [
  {
    id: "facility",
    label: "Iestāde",
    value: "Centrālā laboratorija",
    warning: "Iestādes nosaukums dokumentā nav pilnībā salasāms.",
  },
  {
    id: "document-date",
    label: "Dokumenta datums",
    value: "14.06.2026",
  },
  {
    id: "patient",
    label: "Pacients",
    value: "Jānis Bērziņš",
    warning: "Vārds un uzvārds atpazīts ar zemu pārliecību.",
  },
  {
    id: "potassium",
    label: "Kālijs (K)",
    value: "6.4 mmol/L",
    hint: "Atsauces vērtība: 3.5–5.1",
    warning: "Mērvienība dokumentā ir neskaidra; pārbaudiet pret avotu.",
  },
  {
    id: "leukocytes",
    label: "Leikocīti (WBC)",
    value: "2.1 ×10⁹/L",
    hint: "Atsauces vērtība: 4.0–10.0",
    warning: "Rezultāts ir nolasīts ar zemu pārliecību.",
  },
  {
    id: "hemoglobin",
    label: "Hemoglobīns (HGB)",
    value: "134 g/L",
    hint: "Atsauces vērtība: 130–170",
  },
];

const unrecognizedValues: ParsedValue[] = [
  {
    id: "facility",
    label: "Iestāde",
    value: "",
    warning: "Iestādi neizdevās droši nolasīt no dokumenta.",
  },
  {
    id: "document-date",
    label: "Dokumenta datums",
    value: "",
    warning: "Dokumenta datums nav atpazīts.",
  },
  {
    id: "patient",
    label: "Pacients",
    value: "",
    warning: "Pacienta dati nav atpazīti.",
  },
];

const exclusionReasons = [
  "Nepareizs pacients",
  "Dokuments ir dublikāts",
  "Attēls vai PDF ir nesalasāms",
  "Nepareizs vai neatbilstošs dokuments",
  "Cits",
] as const;

const initialNotes = "Rezultāti pārbaudīti. Ieteicams konsultēties ar ārstu.";

export type ReviewStatus =
  | "needs-review"
  | "in-review"
  | "confirmed"
  | "not-used"
  | "waiting-for-support"
  | "resolved-by-support";

const reviewStatusConfig: Record<ReviewStatus, { label: string; className: string }> = {
  "needs-review": { label: "Jāpārskata", className: "text-[hsl(28,72%,28%)]" },
  "in-review": { label: "Pārskatīšanā", className: "text-[hsl(214,45%,40%)]" },
  confirmed: { label: "Apstiprināts", className: "text-[hsl(151,38%,27%)]" },
  "not-used": { label: "Neizmantots", className: "text-[hsl(0,58%,38%)]" },
  "waiting-for-support": { label: "Gaida tehniskā atbalsta atbildi", className: "text-[hsl(28,72%,28%)]" },
  "resolved-by-support": { label: "Atrisināts tehniskajā atbalstā", className: "text-[hsl(151,38%,27%)]" },
};

type ReportDraft = {
  values: ParsedValue[];
  notes: string;
};

const reportDrafts = new Map<string, ReportDraft>();

type IncompleteSourceReportEditorProps = {
  report: IncompleteSourceReport;
  onBack: () => void;
  onReviewStateChange?: (state: { status: ReviewStatus; confidence?: string }) => void;
  variant?: "page" | "dialog";
};

export function IncompleteSourceReportEditor({
  report,
  onBack,
  onReviewStateChange,
  variant = "page",
}: IncompleteSourceReportEditorProps) {
  const defaultValues =
    report.status === "unrecognized" ? unrecognizedValues : initialValues;
  const existingDraft = reportDrafts.get(report.id);
  const [values, setValues] = React.useState(() =>
    existingDraft?.values ?? defaultValues,
  );
  const [savedValues, setSavedValues] = React.useState(() =>
    existingDraft?.values ?? defaultValues,
  );
  const [notes, setNotes] = React.useState(
    existingDraft?.notes ?? initialNotes,
  );
  const [savedNotes, setSavedNotes] = React.useState(
    existingDraft?.notes ?? initialNotes,
  );
  const [notice, setNotice] = React.useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = React.useState<string | null>(null);
  const [confirmedFieldIds, setConfirmedFieldIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [excluded, setExcluded] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<ReviewStatus>("in-review");
  const [documentZoom, setDocumentZoom] = React.useState(100);
  const [documentHeight, setDocumentHeight] = React.useState(560);
  const [isExclusionDialogOpen, setIsExclusionDialogOpen] = React.useState(false);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = React.useState(false);
  const [exclusionReason, setExclusionReason] = React.useState<
    (typeof exclusionReasons)[number] | null
  >(null);
  const [otherExclusionReason, setOtherExclusionReason] = React.useState("");

  const updateValue = (id: string, value: string) => {
    setConfirmationNotice(null);
    setValues((current) =>
      current.map((item) => (item.id === id ? { ...item, value } : item)),
    );
  };

  const sendToSupport = () => {
    setConfirmationNotice(null);
    setReviewStatus("waiting-for-support");
    onReviewStateChange?.({ status: "waiting-for-support" });
    setNotice("Tehniskajam atbalstam sagatavots ziņojums ar dokumenta nolasīšanas kļūdām.");
  };

  const confirmAndInclude = () => {
    const confidence = report.status === "unrecognized" ? "50%" : report.confidence;
    setConfirmedFieldIds((current) => {
      const next = new Set(current);

      values.forEach((field, index) => {
        if (field.warning && field.value !== savedValues[index]?.value) {
          next.add(field.id);
        }
      });

      return next;
    });
    setExcluded(false);
    setReviewStatus("confirmed");
    onReviewStateChange?.({ status: "confirmed", confidence });
    setSavedValues(values);
    setSavedNotes(notes);
    reportDrafts.delete(report.id);
    setNotice(null);
    setConfirmationNotice("Dokuments apstiprināts un pievienots pacienta pārskatam.");
  };

  const excludeDocument = () => {
    const reason =
      exclusionReason === "Cits"
        ? otherExclusionReason.trim()
        : exclusionReason;

    if (!reason) {
      return;
    }

    setExcluded(true);
    setReviewStatus("not-used");
    onReviewStateChange?.({ status: "not-used" });
    setSavedValues(values);
    setSavedNotes(notes);
    reportDrafts.delete(report.id);
    setIsExclusionDialogOpen(false);
    setConfirmationNotice(null);
    setNotice(`Dokuments netiks izmantots pacienta pārskatā. Iemesls: ${reason}.`);
  };

  const hasUnsavedChanges =
    notes !== savedNotes ||
    values.some((field, index) => field.value !== savedValues[index]?.value);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setIsUnsavedChangesDialogOpen(true);
      return;
    }

    onBack();
  };

  const saveDraftAndLeave = () => {
    reportDrafts.set(report.id, { values, notes });
    setSavedValues(values);
    setSavedNotes(notes);
    setIsUnsavedChangesDialogOpen(false);
    onBack();
  };

  const discardChangesAndLeave = () => {
    reportDrafts.delete(report.id);
    setIsUnsavedChangesDialogOpen(false);
    onBack();
  };

  const status = reviewStatusConfig[reviewStatus];
  const documentZoomScale = documentZoom / 100;

  const updateDocumentHeight = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const document = event.currentTarget.contentDocument;

    if (!document) {
      return;
    }

    setDocumentHeight(
      Math.max(
        560,
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      ),
    );
  };

  return (
    <main className={cn(
      "text-[hsl(222,28%,20%)]",
      variant === "page" ? "min-h-dvh bg-[hsl(210,32%,96%)]" : "bg-white",
    )}>
      <header className="border-b border-[hsl(214,22%,88%)] bg-white">
        <div className={cn(
          "mx-auto px-4 py-3 sm:px-6",
          variant === "page" ? "max-w-[1600px] lg:px-8" : "max-w-[1500px]",
        )}>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[hsl(215,14%,45%)] transition hover:bg-[hsl(210,24%,96%)] hover:text-[hsl(222,28%,20%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Atpakaļ uz dokumentiem
          </button>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[hsl(222,28%,20%)]">{report.sourceLabel}</h1>
                <p className="text-sm text-[hsl(215,14%,52%)]">Saņemts {report.receivedDate}</p>
              </div>
            </div>

            <div className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-[hsl(38,82%,79%)] bg-[hsl(39,100%,96%)] px-3 py-2 text-sm text-[hsl(28,58%,35%)]">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Pārliecība:</span>
              <span className="font-semibold tabular-nums text-[hsl(28,72%,28%)]">{report.confidence}</span>
              <span className={cn("font-semibold", status.className)}>{status.label}</span>
            </div>
          </div>
        </div>
      </header>

      <div className={cn(
        "mx-auto px-4 py-4 sm:px-6",
        variant === "page" ? "max-w-[1600px] lg:px-8" : "max-w-[1500px]",
      )}>
        {notice && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-[hsl(151,35%,72%)] bg-[hsl(151,42%,96%)] px-4 py-3 text-sm leading-5 text-[hsl(151,38%,27%)]" role="status">
            <span className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(151,38%,36%)]" aria-label="Aizvērt paziņojumu">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
          <section className="clinical-panel self-start p-0" aria-labelledby="original-document-heading">
            <div className="border-b border-[hsl(214,22%,90%)] px-4 py-3">
              <div>
                <h2 id="original-document-heading" className="text-lg font-semibold tracking-[-0.02em] text-[hsl(222,28%,20%)]">
                  Oriģinālais dokuments
                </h2>
                <p className="mt-1 text-sm leading-5 text-[hsl(215,14%,52%)]">Salīdziniet laukus ar avota dokumentu.</p>
              </div>
            </div>
            <div className="bg-[hsl(214,22%,97%)] p-3 sm:p-4">
              <div className="relative rounded border border-[hsl(214,22%,88%)] bg-white">
                <div className={cn(documentZoom > 100 ? "overflow-auto" : "overflow-hidden")}>
                  <div
                    style={{
                      height: `${documentHeight * documentZoomScale}px`,
                      width: `${100 * documentZoomScale}%`,
                    }}
                  >
                    <iframe
                      title={`Oriģinālais dokuments: ${report.sourceLabel}`}
                      src={report.reviewUrl}
                      onLoad={updateDocumentHeight}
                      className="block border-0 bg-white"
                      style={{
                        height: `${documentHeight}px`,
                        transform: `scale(${documentZoomScale})`,
                        transformOrigin: "top left",
                        width: `${100 / documentZoomScale}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center rounded-full border border-[hsl(214,22%,84%)] bg-white p-1 shadow-[0_4px_14px_rgba(15,23,42,0.12)]">
                  <button
                    type="button"
                    onClick={() => setDocumentZoom((current) => Math.max(75, current - 25))}
                    disabled={documentZoom === 75}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[hsl(220,36%,28%)] transition hover:bg-[hsl(210,24%,96%)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                    aria-label="Samazināt oriģinālā dokumenta mērogu"
                  >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-[hsl(215,14%,52%)]" aria-live="polite">{documentZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setDocumentZoom((current) => Math.min(150, current + 25))}
                    disabled={documentZoom === 150}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[hsl(220,36%,28%)] transition hover:bg-[hsl(210,24%,96%)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                    aria-label="Palielināt oriģinālā dokumenta mērogu"
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="clinical-panel p-4 md:p-4" aria-labelledby="parsed-information-heading">
            <div className="flex items-start gap-3">
              <div>
                <h2 id="parsed-information-heading" className="text-lg font-semibold tracking-[-0.02em] text-[hsl(222,28%,20%)]">Nolasītā informācija</h2>
                <p className="mt-1 text-sm leading-5 text-[hsl(215,14%,52%)]">Labojiet vai apstipriniet atpazītos laukus.</p>
              </div>
              <CircleHelp className="ml-auto mt-1 h-4 w-4 shrink-0 text-[hsl(215,14%,52%)]" aria-label="Oranžā atzīme norāda uz lauku, ko sistēma nevarēja droši nolasīt." />
            </div>

            <div className="mt-4 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-[hsl(222,28%,20%)]">Dokumenta dati</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {values.slice(0, 3).map((field, index) => (
                    <ParsedField
                      key={field.id}
                      field={field}
                      isEdited={field.value !== savedValues[index]?.value}
                      isConfirmed={confirmedFieldIds.has(field.id)}
                      onChange={updateValue}
                    />
                  ))}
                </div>
              </section>

              {values.length > 3 && (
                <section className="border-t border-[hsl(214,22%,90%)] pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[hsl(222,28%,20%)]">Atrastie dati</h3>
                    <span className="text-xs text-[hsl(215,14%,52%)]">{values.length - 3} rādītāji</span>
                  </div>
                  <ParsedFindingsTable
                    fields={values.slice(3)}
                    savedFields={savedValues.slice(3)}
                    confirmedFieldIds={confirmedFieldIds}
                    onChange={updateValue}
                  />
                </section>
              )}

              <section className="border-t border-[hsl(214,22%,90%)] pt-5">
                <label htmlFor="document-notes" className="text-sm font-semibold text-[hsl(222,28%,20%)]">Piezīmes</label>
                <textarea id="document-notes" value={notes} onChange={(event) => { setNotes(event.target.value); setConfirmationNotice(null); }} className="mt-3 min-h-28 w-full resize-y rounded-lg border border-[hsl(214,22%,84%)] bg-white px-3 py-2.5 text-sm leading-5 text-[hsl(222,28%,20%)] outline-none transition placeholder:text-[hsl(215,14%,58%)] focus:border-[hsl(214,45%,54%)] focus:ring-2 focus:ring-[hsl(214,45%,54%)]/20" />
                <p className="mt-2 flex items-start gap-2 text-xs leading-4 text-[hsl(215,14%,52%)]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />Piezīmes tiks pievienotas kopā ar apstiprinātajiem datiem.</p>
              </section>
            </div>
          </section>

          <aside className="clinical-panel p-4 md:p-4 xl:col-span-2" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-xl font-semibold tracking-[-0.025em] text-[hsl(222,28%,20%)]">Darbības</h2>
            <p className="mt-1 w-full text-sm leading-5 text-[hsl(215,14%,52%)]">Izvēlieties, kā apstrādāt šo dokumentu.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <button type="button" onClick={confirmAndInclude} disabled={excluded} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(220,36%,24%)] px-4 py-2.5 text-sm text-white transition hover:bg-[hsl(220,36%,18%)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"><Check className="h-4 w-4" />Saglabāt izmaiņas un pievienot pārskatam</button>
              <button type="button" onClick={() => { setConfirmationNotice(null); setExclusionReason(null); setOtherExclusionReason(""); setIsExclusionDialogOpen(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(0,64%,76%)] bg-[hsl(0,75%,97%)] px-4 py-2.5 text-sm text-[hsl(0,58%,38%)] transition hover:bg-[hsl(0,75%,94%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(0,64%,50%)] focus-visible:ring-offset-2"><ShieldAlert className="h-4 w-4" />Neizmantot dokumentu</button>
              <button type="button" onClick={sendToSupport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(214,22%,84%)] bg-white px-4 py-2.5 text-sm text-[hsl(220,36%,28%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"><Send className="h-4 w-4" />Sūtīt tehniskajam atbalstam</button>
            </div>
            {confirmationNotice && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(151,35%,72%)] bg-[hsl(151,42%,96%)] px-3 py-2 text-sm leading-5 text-[hsl(151,38%,27%)]" role="status">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {confirmationNotice}
              </p>
            )}
          </aside>
        </div>
      </div>

      {isExclusionDialogOpen && (
        <CenteredOverlay onClose={() => setIsExclusionDialogOpen(false)} className="z-[130]" overlayClassName="bg-[rgba(15,23,42,0.42)] backdrop-blur-sm" contentClassName="max-w-xl">
          <section role="dialog" aria-modal="true" aria-labelledby="exclusion-dialog-title" className="rounded-lg border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.2)] sm:p-6">
            <h2 id="exclusion-dialog-title" className="text-2xl font-semibold text-[hsl(222,28%,20%)]">Kāpēc dokumentu neizmantot?</h2>
            <p className="mt-2 text-sm leading-5 text-[hsl(215,14%,52%)]">Izvēlieties iemeslu, lai dokumentu neiekļautu pacienta pārskatā.</p>

            <fieldset className="mt-5 grid gap-2" aria-label="Dokumenta neizmantošanas iemesls">
              {exclusionReasons.map((reason) => (
                <label key={reason} className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm text-[hsl(222,28%,20%)] transition hover:bg-[hsl(210,24%,96%)]", exclusionReason === reason ? "border-[hsl(214,45%,54%)] bg-[hsl(210,30%,97%)]" : "border-[hsl(214,22%,84%)] bg-white")}>
                  <input type="radio" name="exclusion-reason" value={reason} checked={exclusionReason === reason} onChange={() => setExclusionReason(reason)} className="h-4 w-4 accent-[hsl(214,45%,54%)]" />
                  <span>{reason}</span>
                </label>
              ))}
            </fieldset>

            {exclusionReason === "Cits" && (
              <div className="mt-4">
                <label htmlFor="other-exclusion-reason" className="text-sm font-semibold text-[hsl(222,28%,20%)]">Norādiet iemeslu</label>
                <textarea
                  id="other-exclusion-reason"
                  value={otherExclusionReason}
                  onChange={(event) => setOtherExclusionReason(event.target.value)}
                  placeholder="Ierakstiet iemeslu"
                  className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[hsl(214,22%,84%)] bg-white px-3 py-2.5 text-sm leading-5 text-[hsl(222,28%,20%)] outline-none transition placeholder:text-[hsl(215,14%,58%)] focus:border-[hsl(214,45%,54%)] focus:ring-2 focus:ring-[hsl(214,45%,54%)]/20"
                />
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsExclusionDialogOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[hsl(214,22%,84%)] bg-white px-4 py-2 text-sm text-[hsl(220,28%,22%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]">Atcelt</button>
              <button type="button" onClick={excludeDocument} disabled={!exclusionReason || (exclusionReason === "Cits" && !otherExclusionReason.trim())} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[hsl(0,58%,38%)] px-4 py-2 text-sm text-white transition hover:bg-[hsl(0,58%,32%)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(0,64%,50%)] focus-visible:ring-offset-2">Neizmantot dokumentu</button>
            </div>
          </section>
        </CenteredOverlay>
      )}

      {isUnsavedChangesDialogOpen && (
        <CenteredOverlay onClose={() => setIsUnsavedChangesDialogOpen(false)} className="z-[130]" overlayClassName="bg-[rgba(15,23,42,0.42)] backdrop-blur-sm" contentClassName="max-w-2xl">
          <section role="dialog" aria-modal="true" aria-labelledby="unsaved-changes-dialog-title" className="rounded-2xl border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mx-auto max-w-xl text-center">
              <h2 id="unsaved-changes-dialog-title" className="text-2xl font-semibold tracking-[-0.03em] text-[hsl(220,42%,23%)] sm:text-3xl">Jums ir nesaglabātas izmaiņas</h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-6 text-[hsl(215,14%,52%)]">Pirms atgriešanās pie dokumentiem saglabājiet melnrakstu vai atmetiet veiktās izmaiņas.</p>
            </div>

            <div className="mt-8 grid gap-3 border-t border-[hsl(214,22%,88%)] pt-5 sm:grid-cols-3">
              <button type="button" onClick={() => setIsUnsavedChangesDialogOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(214,22%,84%)] bg-white px-4 py-2.5 text-sm font-semibold text-[hsl(220,36%,28%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]">
                <PencilLine className="h-4 w-4" aria-hidden="true" />
                Turpināt rediģēšanu
              </button>
              <button type="button" onClick={discardChangesAndLeave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(0,64%,76%)] bg-[hsl(0,75%,97%)] px-4 py-2.5 text-sm font-semibold text-[hsl(0,58%,38%)] transition hover:bg-[hsl(0,75%,94%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(0,64%,50%)]">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Atmest izmaiņas
              </button>
              <button type="button" onClick={saveDraftAndLeave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(220,52%,26%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[hsl(220,52%,21%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2">
                <Save className="h-4 w-4" aria-hidden="true" />
                Saglabāt melnrakstu
              </button>
            </div>
          </section>
        </CenteredOverlay>
      )}
    </main>
  );
}

export default function SourceReportReviewPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const report = incompleteSourceReports.find((item) => item.id === reportId);

  if (!report) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[hsl(210,32%,96%)] p-6">
        <section className="max-w-md rounded-lg border border-[hsl(214,22%,88%)] bg-white p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-[hsl(215,14%,52%)]" />
          <h1 className="mt-4 text-xl font-semibold text-[hsl(222,28%,20%)]">Ziņojums nav atrasts</h1>
          <Link to="/clinical-dashboard" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[hsl(220,36%,24%)] px-4 text-sm text-white transition hover:bg-[hsl(220,36%,18%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2">Atgriezties pārskatā</Link>
        </section>
      </main>
    );
  }

  return <IncompleteSourceReportEditor report={report} onBack={() => navigate(-1)} />;
}

function ParsedFindingsTable({
  fields,
  savedFields,
  confirmedFieldIds,
  onChange,
}: {
  fields: ParsedValue[];
  savedFields: ParsedValue[];
  confirmedFieldIds: Set<string>;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-[hsl(214,22%,88%)] bg-white">
      <table className="min-w-[620px] w-full border-collapse text-sm">
        <thead className="bg-[hsl(214,22%,98%)] text-left text-xs text-[hsl(215,14%,52%)]">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold">Rādītājs</th>
            <th scope="col" className="px-3 py-3 font-semibold">Rezultāts</th>
            <th scope="col" className="px-3 py-3 font-semibold">Atsauces vērtība</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            const isEdited = field.value !== savedFields[index]?.value;
            const requiresReview = Boolean(field.warning) && !confirmedFieldIds.has(field.id);

            return (
              <tr
                key={field.id}
                className={cn(
                  "align-top",
                  isEdited
                    ? "bg-[hsl(210,32%,97%)]"
                    : requiresReview && "bg-[hsl(39,100%,97%)]",
                  index !== fields.length - 1 && "border-b border-[hsl(214,22%,90%)]",
                )}
                title={requiresReview ? field.warning : undefined}
              >
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[hsl(222,28%,20%)]">{field.label}</span>
                    {isEdited ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(205,68%,76%)] bg-[hsl(205,72%,96%)] px-2 py-0.5 text-xs font-semibold text-[hsl(208,58%,34%)]">
                        <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                        Labots
                      </span>
                    ) : requiresReview ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(38,82%,79%)] bg-[hsl(39,100%,95%)] px-2 py-0.5 text-xs font-semibold text-[hsl(28,58%,35%)]">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        Jāpārskata
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    aria-label={`${field.label} rezultāts`}
                    value={field.value}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    className={cn(
                      "min-h-11 w-full rounded-md border bg-white px-3 text-sm text-[hsl(222,28%,20%)] outline-none transition focus:ring-2 focus:ring-[hsl(214,45%,54%)]/20",
                      isEdited
                        ? "border-[hsl(205,68%,62%)] focus:border-[hsl(208,58%,34%)]"
                        : requiresReview
                          ? "border-[hsl(38,72%,68%)] focus:border-[hsl(33,82%,43%)]"
                          : "border-[hsl(214,22%,84%)] focus:border-[hsl(214,45%,54%)]",
                    )}
                  />
                  {isEdited && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[hsl(208,58%,34%)]">
                      <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                      Labojums nav saglabāts
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 text-[hsl(215,14%,52%)]">
                  {field.hint?.replace("Atsauces vērtība: ", "") ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ParsedField({
  field,
  isEdited,
  isConfirmed,
  onChange,
}: {
  field: ParsedValue;
  isEdited: boolean;
  isConfirmed: boolean;
  onChange: (id: string, value: string) => void;
}) {
  const requiresReview = Boolean(field.warning) && !isConfirmed;

  return (
    <div className={cn("rounded-lg border p-3", isEdited ? "border-[hsl(205,68%,76%)] bg-[hsl(210,32%,97%)]" : requiresReview ? "border-[hsl(38,82%,74%)] bg-[hsl(39,100%,97%)]" : "border-[hsl(214,22%,88%)] bg-white")}>
      <label htmlFor={field.id} className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(222,28%,20%)]">
        {!isEdited && requiresReview && <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(33,82%,43%)]" aria-label="Jāpārskata" />}
        {field.label}
      </label>
      <input id={field.id} value={field.value} onChange={(event) => onChange(field.id, event.target.value)} className={cn("mt-2 min-h-11 w-full rounded-md border bg-white px-3 text-sm text-[hsl(222,28%,20%)] outline-none transition focus:ring-2 focus:ring-[hsl(214,45%,54%)]/20", isEdited ? "border-[hsl(205,68%,62%)] focus:border-[hsl(208,58%,34%)]" : requiresReview ? "border-[hsl(38,72%,68%)] focus:border-[hsl(33,82%,43%)]" : "border-[hsl(214,22%,84%)] focus:border-[hsl(214,45%,54%)]")} />
      {isEdited ? <p className="mt-2 flex items-center gap-1.5 text-xs leading-4 text-[hsl(208,58%,34%)]"><PencilLine className="h-3.5 w-3.5" aria-hidden="true" />Labojums nav saglabāts.</p> : requiresReview ? <p className="mt-2 text-xs leading-4 text-[hsl(28,58%,35%)]">{field.warning}</p> : field.hint ? <p className="mt-2 text-xs leading-4 text-[hsl(215,14%,52%)]">{field.hint}</p> : null}
    </div>
  );
}
