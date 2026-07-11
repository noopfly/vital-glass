import { useMemo, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Maximize2,
  TriangleAlert,
  X,
} from "lucide-react";

import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { CenteredOverlay } from "@/components/ui/centered-overlay";

type ImagingType = "X-RAY" | "CT" | "MRI" | "USG";
type ImagingStatus = "Norma" | "Izmaiņas" | "Patoloģiskas izmaiņas";

interface ImagingStudy {
  id: string;
  type: ImagingType;
  title: string;
  bodyPart: string;
  date: string;
  status: ImagingStatus;
  doctor: string;
  hospitalLocation: string;
  conclusion: string;
  pdfUrl?: string;
  imageSrc?: string;
  datamedUrl?: string;
}

const documentBaseUrl = `${import.meta.env.BASE_URL}documents/`;

export const imagingStudies: ImagingStudy[] = [
  {
    id: "1",
    type: "MRI",
    title: "MRI — galvas zona",
    bodyPart: "Galvas zona",
    date: "2026-03-04",
    status: "Izmaiņas",
    doctor: "Dr. Krūmiņa",
    hospitalLocation: "Paula Stradiņa klīniskā universitātes slimnīca",
    conclusion:
      "Konstatētas strukturālas izmaiņas, kas jāvērtē klīniskā kontekstā. Ieteicams salīdzināt ar iepriekšējiem izmeklējumiem un izvērtēt kopā ar pacienta simptomiem.",
    pdfUrl: `${documentBaseUrl}mri-galvas-zona-2026-03-04.pdf`,
    datamedUrl: "https://www.datamed.lv",
  },
  {
    id: "2",
    type: "X-RAY",
    title: "RT — krūškurvja augšdaļa",
    bodyPart: "Krūškurvja augšdaļa",
    date: "2026-04-14",
    status: "Patoloģiskas izmaiņas",
    doctor: "Dr. Kalniņš",
    hospitalLocation: "Rīgas Austrumu klīniskā universitātes slimnīca",
    conclusion:
      "Rentgenoloģiski redzamas patoloģiskas izmaiņas plaušu parenhīmā. Nepieciešama dinamiska kontrole un klīniska izvērtēšana.",
    datamedUrl: "https://www.datamed.lv",
  },
  {
    id: "3",
    type: "CT",
    title: "CT — kreisais celis",
    bodyPart: "Kreisais celis",
    date: "2026-02-19",
    status: "Norma",
    doctor: "Dr. Ozoliņš",
    hospitalLocation: "Ziemeļkurzemes reģionālā slimnīca",
    conclusion: "Attēldiagnostiskā aina bez būtiskām novirzēm no normas.",
    pdfUrl: `${documentBaseUrl}ct-kreisais-celis-2026-02-19.html`,
    datamedUrl: "https://www.datamed.lv",
  },
  {
    id: "4",
    type: "USG",
    title: "USG — vēdera dobums",
    bodyPart: "Vēdera dobums",
    date: "2026-01-27",
    status: "Norma",
    doctor: "Dr. Lācis",
    hospitalLocation: "Daugavpils reģionālā slimnīca",
    conclusion: "Ultrasonogrāfiski patoloģiskas izmaiņas nav aprakstītas.",
    pdfUrl: `${documentBaseUrl}usg-vedera-dobums-2026-01-27.html`,
    datamedUrl: "https://www.datamed.lv",
  },
];

const statusConfig: Record<
  ImagingStatus,
  {
    Icon: typeof CircleCheck;
    textClass: string;
    badgeClass: string;
  }
> = {
  Norma: {
    Icon: CircleCheck,
    textClass: "text-status-normal",
    badgeClass: "border-[hsl(152,34%,78%)] bg-[hsl(152,42%,97%)]",
  },
  Izmaiņas: {
    Icon: CircleAlert,
    textClass: "text-status-warning",
    badgeClass: "border-[hsl(40,58%,78%)] bg-[hsl(40,76%,97%)]",
  },
  "Patoloģiskas izmaiņas": {
    Icon: TriangleAlert,
    textClass: "text-status-critical",
    badgeClass: "border-[hsl(0,58%,84%)] bg-[hsl(0,72%,98%)]",
  },
};

const fullscreenArrowButtonClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(214,24%,86%)] bg-[rgba(255,255,255,0.94)] text-heading shadow-[0_10px_24px_rgba(29,53,87,0.12)] transition hover:border-[hsl(216,28%,74%)] hover:bg-white hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2";

export function formatLatvianDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}.${month}.${date.getFullYear()}.`;
}

const MedicalImagingViewer = () => {
  const orderedStudies = useMemo(() => imagingStudies, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const activeStudy = orderedStudies[activeIndex];
  const status = statusConfig[activeStudy.status];
  const StatusIcon = status.Icon;
  const isPdfDocument = activeStudy.pdfUrl?.toLowerCase().endsWith(".pdf") ?? false;

  const goNext = () => {
    setActiveIndex((current) =>
      current === orderedStudies.length - 1 ? 0 : current + 1,
    );
  };

  const goPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? orderedStudies.length - 1 : current - 1,
    );
  };

  const openDocument = () => {
    if (!activeStudy.pdfUrl) {
      return;
    }

    if (isPdfDocument) {
      window.open(activeStudy.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsDocumentOpen(true);
  };

  return (
    <>
      <section className="clinical-panel flex !h-auto w-full flex-col self-start">
        <DashboardCardHeader
          title="Attēldiagnostika"
          infoLabel="Informācija par attēldiagnostiku"
          infoDescription="RT, CT, MRI un ultrasonogrāfijas izmeklējumu pārskats."
        />

        <div className="flex min-h-0 flex-col">
          <section aria-label="Izmeklējuma slēdziens" className="overflow-hidden rounded-[8px] border border-[hsl(214,22%,88%)] bg-white">
            <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-[hsl(214,22%,90%)] px-4 py-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-dark">
                  {activeStudy.title}
                </h3>
              </div>
              <time
                dateTime={activeStudy.date}
                className="pt-0.5 text-sm font-semibold tabular-nums text-text-dark"
              >
                {formatLatvianDate(activeStudy.date)}
              </time>
            </header>

            <div className="relative px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-1.5 pr-8">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-heading">Slēdziens</h4>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[11px] font-normal leading-4 ${status.textClass} ${status.badgeClass}`}>
                    <StatusIcon size={12} strokeWidth={2.1} aria-hidden="true" />
                    {activeStudy.status}
                  </span>
                </div>
              </div>
              {activeStudy.pdfUrl ? (
                <button
                  type="button"
                  onClick={openDocument}
                  className="absolute right-2 top-1 inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-text-dark transition-colors duration-200 hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
                  aria-label="Atvērt pilno slēdzienu"
                  title="Atvērt pilno slēdzienu"
                >
                  <Maximize2 size={12} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}

              <p className="mt-1 pr-8 text-xs leading-4 text-text-dark">{activeStudy.conclusion}</p>
            </div>

            <dl className="grid border-t border-[hsl(214,22%,90%)] bg-[hsl(214,20%,98%)] sm:grid-cols-2">
              <div className="min-w-0 px-4 py-2 sm:border-r sm:border-[hsl(214,22%,90%)]">
                <dt className="text-xs font-semibold text-heading">Iestāde</dt>
                <dd className="mt-1 text-xs leading-4 text-text-dark">{activeStudy.hospitalLocation}</dd>
              </div>
              <div className="min-w-0 border-t border-[hsl(214,22%,90%)] px-4 py-2 sm:border-t-0">
                <dt className="text-xs font-semibold text-heading">Ārsts</dt>
                <dd className="mt-1 text-xs leading-4 text-text-dark">{activeStudy.doctor}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-3" aria-label="Attēls">
            {activeStudy.imageSrc ? (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex min-h-36 flex-1 items-center justify-center rounded-[8px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] px-6 transition-colors hover:bg-[hsl(214,25%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
                aria-label="Atvērt attēlu pilnekrānā"
              >
                <img
                  src={activeStudy.imageSrc}
                  alt={`${activeStudy.title}, ${formatLatvianDate(activeStudy.date)}`}
                  className="block max-h-[160px] w-full object-contain"
                />
              </button>
            ) : (
                <div
                  className="flex min-h-36 items-center justify-center rounded-[8px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)]"
                  role="status"
                  aria-label="Attēls tiek ielādēts"
                >
                  <LoaderCircle
                    size={22}
                    strokeWidth={1.8}
                    className="animate-spin text-heading motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Attēls tiek ielādēts</span>
                </div>
            )}
          </section>

          <nav
            aria-label="Attēldiagnostikas izmeklējumu navigācija"
            className="mt-3 grid min-h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center overflow-hidden rounded-[8px] border border-[hsl(214,22%,88%)] bg-[hsl(214,38%,97%)]"
          >
            <button
              type="button"
              onClick={goPrevious}
              className="inline-flex min-h-11 items-center gap-1.5 px-4 text-left text-sm font-semibold text-text-dark transition-colors hover:bg-[hsl(214,38%,95%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
              aria-label="Iepriekšējais izmeklējums"
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
              Iepriekšējais
            </button>
            <p className="px-3 text-xs tabular-nums text-heading" aria-live="polite">
              {activeIndex + 1} no {orderedStudies.length}
            </p>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-11 items-center justify-end gap-1.5 px-4 text-right text-sm font-semibold text-text-dark transition-colors hover:bg-[hsl(214,38%,95%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
              aria-label="Nākamais izmeklējums"
            >
              Nākamais
              <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>

      {isDocumentOpen && activeStudy.pdfUrl && !isPdfDocument ? (
        <CenteredOverlay
          onClose={() => setIsDocumentOpen(false)}
          overlayClassName="bg-[hsla(218,30%,12%,0.72)] backdrop-blur-md"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="imaging-document-title"
            className="relative mx-auto flex h-[92vh] w-full max-w-[96vw] flex-col rounded-[8px] border border-[hsl(214,24%,86%)] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
          >
            <header className="flex shrink-0 items-start justify-between gap-5 border-b border-[hsl(214,24%,86%)] px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 id="imaging-document-title" className="text-xl font-semibold tracking-[-0.035em] text-text-dark">
                    {activeStudy.title}
                  </h3>
                  <p className="text-xs leading-4 tabular-nums text-heading">
                    {formatLatvianDate(activeStudy.date)} · {activeStudy.doctor}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={activeStudy.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-[6px] px-3 text-sm font-semibold text-text-dark transition-colors hover:bg-[hsl(214,30%,98%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                >
                  <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="hidden sm:inline">Atvērt jaunā cilnē</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsDocumentOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[6px] text-heading transition-colors hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                  aria-label="Aizvērt dokumentu"
                >
                  <X size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 bg-[hsl(214,35%,98%)] p-3 sm:p-4">
              <div className="h-full overflow-hidden rounded-[6px] border border-[hsl(214,24%,86%)] bg-white">
                <iframe
                  src={activeStudy.pdfUrl}
                  title={`Pilns slēdziens — ${activeStudy.title}`}
                  className="h-full w-full"
                />
              </div>
            </div>
          </section>
        </CenteredOverlay>
      ) : null}

      {isFullscreen && activeStudy.imageSrc ? (
        <CenteredOverlay
          onClose={() => setIsFullscreen(false)}
          overlayClassName="bg-[hsla(218,30%,12%,0.72)] backdrop-blur-md"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="imaging-fullscreen-title"
            className="relative mx-auto w-full max-w-5xl rounded-[8px] border border-[hsl(214,24%,86%)] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
          >
            <header className="mb-5 flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-heading">
                  {activeStudy.type}
                </p>
                <h3 id="imaging-fullscreen-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-text-dark">
                  {activeStudy.title}
                </h3>
                <p className="mt-1 text-sm tabular-nums text-heading">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex h-10 items-center rounded-[6px] px-3 text-sm font-semibold text-text-dark transition-colors hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
              >
                Aizvērt
              </button>
            </header>

            <div className="relative flex h-[76vh] items-center justify-center overflow-hidden rounded-[6px] border border-[hsl(214,24%,86%)] bg-[hsl(214,35%,98%)] p-5">
              <button
                type="button"
                onClick={goPrevious}
                className={`${fullscreenArrowButtonClass} left-5`}
                aria-label="Iepriekšējais izmeklējums"
              >
                <ChevronLeft size={22} strokeWidth={2.1} aria-hidden="true" />
              </button>
              <img
                src={activeStudy.imageSrc}
                alt={`${activeStudy.title}, ${formatLatvianDate(activeStudy.date)}`}
                className="block h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={goNext}
                className={`${fullscreenArrowButtonClass} right-5`}
                aria-label="Nākamais izmeklējums"
              >
                <ChevronRight size={22} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </div>
          </section>
        </CenteredOverlay>
      ) : null}
    </>
  );
};

export default MedicalImagingViewer;
