import { useMemo, useState } from "react";
import {
  ActivitySquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import rtKruskurvjaAugsdalaImage from "@/assets/rt-kruskurvja-augsdala.png";

type ImagingType = "X-RAY" | "CT" | "MRI" | "USG";
type ImagingStatus = "Norma" | "Izmainas" | "Patologiskas izmainas";

interface ImagingStudy {
  id: string;
  type: ImagingType;
  title: string;
  bodyPart: string;
  date: string;
  status: ImagingStatus;
  doctor: string;
  hospitalLocation: string;
  imageSrc?: string;
}

const studies: ImagingStudy[] = [
  {
    id: "1",
    type: "X-RAY",
    title: "RT - kruskurvja augsdala",
    bodyPart: "Kruskurvja augsdala",
    date: "2026-04-14",
    status: "Patologiskas izmainas",
    doctor: "Dr. Kalniņš",
    hospitalLocation: "Rīgas Austrumu klīniskā universitātes slimnīca",
    imageSrc: rtKruskurvjaAugsdalaImage,
  },
  {
    id: "2",
    type: "MRI",
    title: "MRI - galvas zona",
    bodyPart: "Galvas zona",
    date: "2026-03-04",
    status: "Izmainas",
    doctor: "Dr. Krūmiņa",
    hospitalLocation: "Paula Stradiņa klīniskā universitātes slimnīca",
  },
  {
    id: "3",
    type: "CT",
    title: "CT - kreisais celis",
    bodyPart: "Kreisais celis",
    date: "2026-02-19",
    status: "Norma",
    doctor: "Dr. Ozoliņš",
    hospitalLocation: "Ziemeļkurzemes reģionālā slimnīca",
  },
  {
    id: "4",
    type: "USG",
    title: "USG - vēdera dobums",
    bodyPart: "Vēdera dobums",
    date: "2026-01-27",
    status: "Norma",
    doctor: "Dr. Lācis",
    hospitalLocation: "Daugavpils reģionālā slimnīca",
  },
];

const typeAccentClass: Record<ImagingType, string> = {
  "X-RAY": "text-[hsl(198,74%,54%)]",
  CT: "text-[hsl(184,62%,48%)]",
  MRI: "text-[hsl(194,78%,54%)]",
  USG: "text-[hsl(220,84%,66%)]",
};

const statusStyles: Record<ImagingStatus, string> = {
  Norma:
    "border-white/50 bg-[linear-gradient(180deg,hsla(145,55%,94%,0.82),hsla(145,45%,90%,0.58))] text-[hsl(145,45%,38%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.75)]",
  Izmainas:
    "border-white/50 bg-[linear-gradient(180deg,hsla(36,100%,94%,0.84),hsla(36,92%,90%,0.6))] text-[hsl(33,85%,45%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.75)]",
  "Patologiskas izmainas":
    "border-white/50 bg-[linear-gradient(180deg,hsla(0,90%,95%,0.86),hsla(0,84%,91%,0.62))] text-[hsl(0,72%,56%)] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.78)]",
};

const sectionIconClass =
  "flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsla(190,82%,84%,0.5)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(191,100%,97%,0.95)_48%,hsla(193,84%,91%,0.88))] text-[hsl(190,62%,48%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.2),0_12px_28px_hsla(191,82%,78%,0.22)]";

const metaIconClass =
  "text-[hsl(210,60%,45%)]";

const navButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(214,22%,86%)] bg-white text-[hsl(214,20%,42%)] shadow-[0_10px_24px_rgba(148,163,184,0.22)] transition hover:bg-white hover:text-text-dark disabled:cursor-not-allowed disabled:opacity-35";

function formatLatvianDate(isoDate: string) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
}

function ImagingPlaceholder({
  type,
  compact = false,
}: {
  type: ImagingType;
  compact?: boolean;
}) {
  const strokeWidth = compact ? 1.15 : 1.35;

  if (type === "CT") {
    return (
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[hsl(186,42%,84%)]"
        fill="none"
      >
        <rect
          x="138"
          y="28"
          width="44"
          height="42"
          rx="8"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx="160"
          cy="88"
          rx="36"
          ry="18"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx="160"
          cy="88"
          rx="14"
          ry="7"
          stroke="currentColor"
          strokeDasharray="3 4"
          strokeWidth={strokeWidth}
        />
        <rect
          x="138"
          y="106"
          width="44"
          height="48"
          rx="8"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  if (type === "MRI") {
    return (
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[hsl(199,46%,85%)]"
        fill="none"
      >
        <circle
          cx="160"
          cy="88"
          r="56"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="160"
          cy="88"
          r="34"
          stroke="currentColor"
          strokeDasharray="3 4"
          strokeWidth={strokeWidth}
        />
        <path
          d="M105 118c24-20 86-20 110 0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <path
          d="M118 72c18-14 66-14 84 0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  if (type === "USG") {
    return (
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[hsl(223,56%,87%)]"
        fill="none"
      >
        <circle
          cx="135"
          cy="70"
          r="32"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="188"
          cy="78"
          r="20"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx="168"
          cy="122"
          rx="36"
          ry="18"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full w-full text-[hsl(214,24%,86%)]"
      fill="none"
    >
      <ellipse
        cx="160"
        cy="88"
        rx="56"
        ry="70"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <ellipse
        cx="160"
        cy="88"
        rx="34"
        ry="42"
        stroke="currentColor"
        strokeDasharray="3 4"
        strokeWidth={strokeWidth}
      />
      <ellipse
        cx="142"
        cy="92"
        rx="18"
        ry="26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <ellipse
        cx="178"
        cy="92"
        rx="18"
        ry="26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M126 58c10-12 58-12 68 0"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

const MedicalImagingViewer = () => {
  const orderedStudies = useMemo(
    () =>
      [...studies].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeStudy = orderedStudies[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < orderedStudies.length - 1;

  const goPrev = () => {
    if (canGoPrev) setActiveIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (canGoNext) setActiveIndex((prev) => prev + 1);
  };

  return (
    <>
      <section className="flex w-full flex-col rounded-[1.5rem] border border-white/75 bg-[linear-gradient(180deg,hsla(0,0%,100%,0.96),hsla(195,42%,99%,0.84))] p-4 shadow-[0_10px_24px_hsl(var(--glass-shadow))] backdrop-blur-xl md:p-5">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className={sectionIconClass}>
              <ActivitySquare size={20} />
            </div>

            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
                Attēldiagnostika
              </p>
              <p className="text-xs text-heading">
                RTG, CT un citu izmeklējumu pārskats
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative overflow-hidden rounded-[1rem] border border-[hsl(210,24%,90%)] bg-[linear-gradient(180deg,hsla(0,0%,100%,0.84),hsla(205,34%,97%,0.76))] p-4 shadow-[inset_0_1px_0_hsla(0,0%,100%,0.8)] md:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-[13px] font-semibold ${typeAccentClass[activeStudy.type]}`}
                >
                  {activeStudy.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[hsl(214,16%,68%)]">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[hsl(214,22%,88%)] bg-white px-3 py-2 text-xs text-[hsl(214,20%,45%)] shadow-[0_8px_18px_rgba(148,163,184,0.16)] transition hover:bg-[hsl(210,20%,98%)]"
                aria-label="Atvērt pilnekrānā"
              >
                <Search size={13} />
                <span>Skatīt pilnekrānā</span>
              </button>
            </div>

            <div className="relative rounded-[1rem] bg-[linear-gradient(180deg,hsla(0,0%,100%,0.78),hsla(208,34%,97%,0.92))] px-2 py-3 md:px-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={`${navButtonClass} absolute left-1 top-1/2 z-20 -translate-y-1/2 md:left-2`}
                aria-label="Iepriekšējais attēls"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="mx-auto w-full max-w-[520px]">
                {activeStudy.imageSrc ? (
                  <img
                    src={activeStudy.imageSrc}
                    alt={activeStudy.title}
                    className="block w-full rounded-[0.9rem] object-contain"
                  />
                ) : (
                  <div className="h-[240px] w-full">
                    <ImagingPlaceholder type={activeStudy.type} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className={`${navButtonClass} absolute right-1 top-1/2 z-20 -translate-y-1/2 md:right-2`}
                aria-label="Nākamais attēls"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-x-8 gap-y-4 border-t border-[hsl(210,20%,91%)] pt-4 sm:grid-cols-[auto_minmax(0,1fr)]">
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[hsl(214,16%,68%)]">
                    <CalendarDays size={11} className={metaIconClass} />
                    Datums
                  </div>
                  <p className="text-[13px] font-semibold text-[hsl(214,18%,36%)]">
                    {formatLatvianDate(activeStudy.date)}
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[hsl(214,16%,68%)]">
                    <Sparkles size={11} className={metaIconClass} />
                    Statuss
                  </div>
                  <span
                    className={`inline-flex rounded-sm border px-3 py-1.5 text-[10px] font-medium leading-none ${statusStyles[activeStudy.status]}`}
                  >
                    {activeStudy.status}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[hsl(214,16%,68%)]">
                  <MapPin size={11} className={metaIconClass} />
                  Iestāde
                </div>
                <p className="max-w-[34ch] text-[12px] font-semibold leading-4 text-[hsl(214,18%,36%)]">
                  {activeStudy.hospitalLocation}
                </p>
                <p className="mt-1 text-[11px] text-[hsl(214,18%,36%)]">
                  {activeStudy.doctor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isFullscreen && (
        <CenteredOverlay
          onClose={() => setIsFullscreen(false)}
          overlayClassName="bg-[hsla(218,30%,12%,0.72)] backdrop-blur-md"
        >
          <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-white/20 bg-[linear-gradient(180deg,hsla(0,0%,100%,0.92),hsla(204,36%,97%,0.86))] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.12em] ${typeAccentClass[activeStudy.type]}`}
                >
                  {activeStudy.type}
                </p>
                <h3 className="text-lg font-semibold text-text-dark">
                  {activeStudy.title}
                </h3>
                <p className="mt-1 text-sm text-[hsl(214,16%,60%)]">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-full border border-[hsl(214,22%,88%)] bg-white px-3 py-1.5 text-sm font-medium text-text-dark transition hover:bg-[hsl(210,20%,98%)]"
              >
                Aizvērt
              </button>
            </div>

            <div className="relative isolate flex h-[78vh] items-center justify-center overflow-visible rounded-[1rem] border border-[hsl(212,22%,90%)] bg-[linear-gradient(180deg,hsla(0,0%,100%,0.72),hsla(210,34%,96%,0.9))]">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={`${navButtonClass} absolute left-3 top-1/2 z-40 -translate-y-1/2 md:left-4`}
                aria-label="Iepriekšējais attēls pilnekrānā"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-8 md:px-8 md:py-10">
                {activeStudy.imageSrc ? (
                  <img
                    src={activeStudy.imageSrc}
                    alt={activeStudy.title}
                    className="block h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-[66vh] w-[96%] max-w-[1100px]">
                    <ImagingPlaceholder type={activeStudy.type} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className={`${navButtonClass} absolute right-3 top-1/2 z-40 -translate-y-1/2 md:right-4`}
                aria-label="Nākamais attēls pilnekrānā"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicalImagingViewer;