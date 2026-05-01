import { useMemo, useState } from "react";
import {
  ActivitySquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import rtKruskurvjaAugsdalaImage from "@/assets/rt-kruskurvja-augsdala.png";

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
  imageSrc?: string;
}

const studies: ImagingStudy[] = [
  {
    id: "1",
    type: "X-RAY",
    title: "RT - krūškurvja augšdaļa",
    bodyPart: "Krūškurvja augšdaļa",
    date: "2026-04-14",
    status: "Patoloģiskas izmaiņas",
    doctor: "Dr. Kalniņš",
    hospitalLocation: "Rīgas Austrumu klīniskā universitātes slimnīca",
    conclusion: "Rentgenoloģiski redzamas patoloģiskas izmaiņas plaušu parenhīmā.",
    imageSrc: rtKruskurvjaAugsdalaImage,
  },
  {
    id: "2",
    type: "MRI",
    title: "MRI - galvas zona",
    bodyPart: "Galvas zona",
    date: "2026-03-04",
    status: "Izmaiņas",
    doctor: "Dr. Krūmiņa",
    hospitalLocation: "Paula Stradiņa klīniskā universitātes slimnīca",
    conclusion: "Konstatētas strukturālas izmaiņas, kas jāvērtē klīniskā kontekstā.",
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
    conclusion: "Attēldiagnostiskā aina bez būtiskām novirzēm no normas.",
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
    conclusion: "Ultrasonogrāfiski patoloģiskas izmaiņas nav aprakstītas.",
  },
];

const statusStyles: Record<ImagingStatus, string> = {
  Norma:
    "border-[rgba(199,223,210,0.96)] bg-[hsl(152,34%,94%)] text-[hsl(152,42%,34%)]",
  "Izmaiņas":
    "border-[rgba(236,221,197,0.96)] bg-[hsl(40,56%,94%)] text-[hsl(34,52%,42%)]",
  "Patoloģiskas izmaiņas":
    "border-[rgba(239,208,208,0.96)] bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
};

const sectionIconClass =
  "flex h-12 w-12 items-center justify-center rounded-[16px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const navButtonClass =
  "inline-flex h-[40px] w-[40px] items-center justify-center rounded-[14px] border border-[hsl(214,22%,88%)] bg-white text-[hsl(214,18%,40%)] shadow-[0_8px_18px_rgba(29,53,87,0.08)] transition hover:bg-[hsl(214,20%,98%)] disabled:cursor-not-allowed disabled:opacity-35";

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
        className="h-full w-full text-[hsl(212,18%,82%)]"
        fill="none"
      >
        <rect x="138" y="28" width="44" height="42" rx="8" stroke="currentColor" strokeWidth={strokeWidth} />
        <ellipse cx="160" cy="88" rx="36" ry="18" stroke="currentColor" strokeWidth={strokeWidth} />
        <ellipse cx="160" cy="88" rx="14" ry="7" stroke="currentColor" strokeDasharray="3 4" strokeWidth={strokeWidth} />
        <rect x="138" y="106" width="44" height="48" rx="8" stroke="currentColor" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "MRI") {
    return (
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[hsl(212,18%,82%)]"
        fill="none"
      >
        <circle cx="160" cy="88" r="56" stroke="currentColor" strokeWidth={strokeWidth} />
        <circle cx="160" cy="88" r="34" stroke="currentColor" strokeDasharray="3 4" strokeWidth={strokeWidth} />
        <path d="M105 118c24-20 86-20 110 0" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M118 72c18-14 66-14 84 0" stroke="currentColor" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (type === "USG") {
    return (
      <svg
        viewBox="0 0 320 180"
        className="h-full w-full text-[hsl(212,18%,82%)]"
        fill="none"
      >
        <circle cx="135" cy="70" r="32" stroke="currentColor" strokeWidth={strokeWidth} />
        <circle cx="188" cy="78" r="20" stroke="currentColor" strokeWidth={strokeWidth} />
        <ellipse cx="168" cy="122" rx="36" ry="18" stroke="currentColor" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full w-full text-[hsl(214,24%,86%)]"
      fill="none"
    >
      <ellipse cx="160" cy="88" rx="56" ry="70" stroke="currentColor" strokeWidth={strokeWidth} />
      <ellipse cx="160" cy="88" rx="34" ry="42" stroke="currentColor" strokeDasharray="3 4" strokeWidth={strokeWidth} />
      <ellipse cx="142" cy="92" rx="18" ry="26" stroke="currentColor" strokeWidth={strokeWidth} />
      <ellipse cx="178" cy="92" rx="18" ry="26" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M126 58c10-12 58-12 68 0" stroke="currentColor" strokeWidth={strokeWidth} />
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
      <section className="flex w-full flex-col rounded-[16px] border border-[hsl(214,22%,88%)] bg-white p-3.5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="mb-3 flex items-start gap-4">
          <div className="flex items-start gap-4">
            <div className={sectionIconClass}>
              <ActivitySquare size={18} />
            </div>

            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[hsl(214,18%,44%)]">
                Attēldiagnostika
              </p>
              <p className="mt-0.5 text-[11px] text-[hsl(214,14%,50%)]">
                RTG, CT un citu izmeklējumu pārskats
              </p>
            </div>
          </div>

        </div>

        <div className="rounded-[18px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,99%)] p-2.5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(222,28%,20%)]">
                {activeStudy.title}
              </h3>
              <p className="mt-0.5 text-[10px] text-[hsl(214,14%,66%)]">
                {formatLatvianDate(activeStudy.date)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-2 rounded-[12px] border border-[hsl(214,22%,88%)] bg-white px-2.5 py-2 text-[9px] font-medium text-[hsl(214,18%,44%)] shadow-[0_6px_14px_rgba(29,53,87,0.05)] transition hover:bg-[hsl(214,20%,98%)]"
              aria-label="Skatīt pilnekrānā"
            >
              <Search size={13} />
              <span>Skatīt pilnekrānā</span>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-[hsl(214,22%,90%)] bg-[hsl(214,20%,98%)]">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className={`${navButtonClass} absolute left-3 top-1/2 z-20 -translate-y-1/2`}
              aria-label="Iepriekšējais attēls"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="mx-auto flex min-h-[135px] w-full max-w-[500px] items-center justify-center px-4 py-2.5">
              {activeStudy.imageSrc ? (
                <img
                  src={activeStudy.imageSrc}
                  alt={activeStudy.title}
                  className="block max-h-[145px] w-full rounded-[10px] object-contain"
                />
              ) : (
                <div className="h-[120px] w-full max-w-[420px]">
                  <ImagingPlaceholder type={activeStudy.type} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className={`${navButtonClass} absolute right-3 top-1/2 z-20 -translate-y-1/2`}
              aria-label="Nākamais attēls"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-3 border-t border-[hsl(214,22%,88%)] pt-3">
            <div className="grid gap-3 md:grid-cols-[0.78fr_1.32fr_0.8fr]">
              <div className="border-b border-[hsl(214,22%,90%)] pb-3 md:border-b-0 md:border-r md:pr-3">
                <div className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,66%)]">
                  <CalendarDays size={14} className="text-[hsl(214,18%,44%)]" />
                  Datums
                </div>
                <p className="text-[11px] font-semibold text-[hsl(222,28%,20%)]">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>

              <div className="border-b border-[hsl(214,22%,90%)] pb-3 md:border-b-0 md:border-r md:px-3">
                <div className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,66%)]">
                  <MapPin size={14} className="text-[hsl(214,18%,44%)]" />
                  Iestāde
                </div>
                <p className="text-[11px] font-semibold leading-[1.3] text-[hsl(222,28%,20%)]">
                  {activeStudy.hospitalLocation}
                </p>
              </div>

              <div className="md:pl-3">
                <div className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,66%)]">
                  <UserRound size={14} className="text-[hsl(214,18%,44%)]" />
                  Ārsts
                </div>
                <p className="text-[11px] font-semibold text-[hsl(222,28%,20%)]">
                  {activeStudy.doctor}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2.5 border-t border-[hsl(214,22%,88%)] pt-2.5">
            <div className="mb-2 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,14%,66%)]">
              <FileText size={14} className="text-[hsl(214,18%,44%)]" />
              Slēdziens
            </div>

            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex shrink-0 rounded-full border px-3 py-1 text-[9px] font-semibold ${statusStyles[activeStudy.status]}`}
              >
                {activeStudy.status}
              </span>

              <p className="text-[10px] leading-4 text-[hsl(214,14%,42%)]">
                {activeStudy.conclusion}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isFullscreen && (
        <CenteredOverlay
          onClose={() => setIsFullscreen(false)}
          overlayClassName="bg-[hsla(218,30%,12%,0.72)] backdrop-blur-md"
        >
          <div className="relative mx-auto w-full max-w-5xl rounded-[18px] border border-[hsl(214,22%,88%)] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(214,18%,44%)]">
                  {activeStudy.type}
                </p>
                <h3 className="text-lg font-semibold text-[hsl(222,28%,20%)]">
                  {activeStudy.title}
                </h3>
                <p className="mt-1 text-sm text-[hsl(214,16%,60%)]">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-[12px] border border-[hsl(214,22%,88%)] bg-white px-3 py-1.5 text-sm font-medium text-[hsl(222,28%,20%)] transition hover:bg-[hsl(214,20%,98%)]"
              >
                Aizvērt
              </button>
            </div>

            <div className="relative isolate flex h-[78vh] items-center justify-center overflow-visible rounded-[18px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)]">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={`${navButtonClass} absolute left-3 top-1/2 z-40 -translate-y-1/2 md:left-4`}
                aria-label="Iepriekšējais attēls pilnekrānā"
              >
                <ChevronLeft size={22} />
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
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicalImagingViewer;
