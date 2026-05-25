import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivitySquare,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  FileText,
  ImageOff,
  MapPin,
  UserRound,
} from "lucide-react";

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
  conclusionDetails?: string[];
  imageSrc?: string;
  datamedUrl?: string;
}

const studies: ImagingStudy[] = [
  {
    id: "1",
    type: "MRI",
    title: "MRI - galvas zona",
    bodyPart: "Galvas zona",
    date: "2026-03-04",
    status: "Izmaiņas",
    doctor: "Dr. Krūmiņa",
    hospitalLocation: "Paula Stradiņa klīniskā universitātes slimnīca",
    conclusion:
      "Konstatētas strukturālas izmaiņas, kas jāvērtē klīniskā kontekstā.",
    conclusionDetails: [
      "Aprakstītas strukturālas izmaiņas bez akūtu komplikāciju pazīmēm.",
      "Ieteicama korelācija ar klīnisko ainu un salīdzinājums ar iepriekšējiem izmeklējumiem.",
    ],
    datamedUrl: "https://www.datamed.lv",
  },
  {
    id: "2",
    type: "X-RAY",
    title: "RT - krūškurvja augšdaļa",
    bodyPart: "Krūškurvja augšdaļa",
    date: "2026-04-14",
    status: "Patoloģiskas izmaiņas",
    doctor: "Dr. Kalniņš",
    hospitalLocation: "Rīgas Austrumu klīniskā universitātes slimnīca",
    conclusion:
      "Rentgenoloģiski redzamas patoloģiskas izmaiņas plaušu parenhīmā.",
    conclusionDetails: [
      "Redzamas perēkļveida infiltratīvas ēnas labās plaušas augšdaļā.",
      "Ieteicama dinamiska kontrole un salīdzinājums ar iepriekšējiem attēliem.",
    ],
    datamedUrl: "https://www.datamed.lv",
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
    conclusionDetails: [
      "Kaulu struktūras un locītavas sprauga saglabāta, svaigas traumatiskas pārmaiņas netiek konstatētas.",
    ],
    datamedUrl: "https://www.datamed.lv",
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
    conclusionDetails: [
      "Brīvs šķidrums vēdera dobumā netiek vizualizēts, orgāni bez būtiskām fokālām atradnēm.",
    ],
    datamedUrl: "https://www.datamed.lv",
  },
];

const sectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const navButtonClass =
  "group flex h-full min-w-0 items-center gap-1.5 px-3 text-[7px] font-semibold uppercase tracking-[0.1em] text-[hsl(216,24%,42%)] transition hover:bg-white hover:text-[hsl(219,42%,24%)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[hsl(216,34%,76%)]";

const navIconClass =
  "flex h-7 w-7 shrink-0 items-center justify-center text-[hsl(216,22%,38%)] transition group-hover:text-[hsl(219,42%,24%)]";

const fullscreenArrowButtonClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(214,24%,86%)] bg-[rgba(255,255,255,0.9)] text-[hsl(216,22%,38%)] shadow-[0_10px_24px_rgba(29,53,87,0.12)] backdrop-blur-sm transition hover:border-[hsl(216,28%,74%)] hover:bg-white hover:text-[hsl(219,42%,24%)] focus:outline-none focus:ring-2 focus:ring-[hsl(216,34%,76%)] focus:ring-offset-2";

const statusStyles: Record<ImagingStatus, string> = {
  Norma:
    "border-[hsl(152,34%,78%)] bg-[hsl(152,34%,94%)] text-[hsl(152,42%,34%)]",
  Izmaiņas:
    "border-[hsl(38,58%,78%)] bg-[hsl(40,64%,94%)] text-[hsl(34,58%,38%)]",
  "Patoloģiskas izmaiņas":
    "border-[hsl(0,58%,84%)] bg-[hsl(0,56%,96%)] text-[hsl(0,54%,52%)]",
};

const conclusionPanelStyles: Record<ImagingStatus, string> = {
  Norma:
    "border-[hsl(152,34%,78%)] bg-[linear-gradient(180deg,hsl(152,42%,97%),hsl(152,38%,95%))]",
  Izmaiņas:
    "border-[hsl(38,58%,78%)] bg-[linear-gradient(180deg,hsl(40,76%,97%),hsl(40,64%,95%))]",
  "Patoloģiskas izmaiņas":
    "border-[hsl(0,58%,84%)] bg-[linear-gradient(180deg,hsl(0,72%,98%),hsl(0,58%,96%))]",
};

const conclusionBulletStyles: Record<ImagingStatus, string> = {
  Norma: "bg-[hsl(152,42%,34%)]",
  Izmaiņas: "bg-[hsl(34,58%,38%)]",
  "Patoloģiskas izmaiņas": "bg-[hsl(0,54%,52%)]",
};

function formatLatvianDate(isoDate: string) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
}

function InfoColumn({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[hsl(214,24%,86%)] bg-white text-[hsl(216,24%,38%)]">
          {icon}
        </div>

        <p className="min-w-0 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[hsl(216,15%,62%)]">
          {label}
        </p>
      </div>

      <p className="min-w-0 text-left text-[10.5px] font-semibold leading-[1.22] tracking-[-0.01em] text-[hsl(219,36%,18%)]">
        {value}
      </p>
    </div>
  );
}

const MedicalImagingViewer = () => {
  const orderedStudies = useMemo(() => studies, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConclusionExpanded, setIsConclusionExpanded] = useState(false);

  const activeStudy = orderedStudies[activeIndex];

  useEffect(() => {
    setIsConclusionExpanded(false);
  }, [activeIndex]);

  const goNext = () => {
    setActiveIndex((prev) =>
      prev >= orderedStudies.length - 1 ? 0 : prev + 1,
    );
  };

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev <= 0 ? orderedStudies.length - 1 : prev - 1,
    );
  };

  return (
    <>
      <section className="flex h-full min-h-[420px] w-full flex-col overflow-visible rounded-[6px] border border-[rgba(220,228,236,0.96)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="mb-4 flex shrink-0 items-center gap-3">
          <div className={sectionIconClass}>
            <ActivitySquare size={18} className="text-current" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
              Attēldiagnostika
            </p>
            <p className="truncate text-xs text-heading">
              RTG, CT un citu izmeklējumu pārskats
            </p>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_10px_24px_rgba(29,53,87,0.05)]">
          <div className="border-b border-[hsl(214,22%,88%)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-text-dark">
                {activeStudy.title}
              </h3>

              <div className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-[11px] font-medium text-heading">
                <CalendarDays size={12} strokeWidth={1.8} />
                {formatLatvianDate(activeStudy.date)}
              </div>
            </div>
          </div>

          <div
            className={`mx-4 mt-4 rounded-[5px] border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] ${
              conclusionPanelStyles[activeStudy.status]
            }`}
          >
            <button
              type="button"
              onClick={() => setIsConclusionExpanded((current) => !current)}
              className="flex w-full items-center gap-2 text-left"
              aria-expanded={isConclusionExpanded}
              aria-label="Pārslēgt slēdziena detaļas"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[hsl(214,26%,86%)] bg-white text-[hsl(218,30%,34%)]">
                <FileText size={12} strokeWidth={1.8} />
              </div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-heading">
                Slēdziens
              </p>

              <span
                className={`ml-1 inline-flex shrink-0 items-center justify-center rounded-full border px-2 py-1 text-center text-[8.5px] font-semibold leading-none ${statusStyles[activeStudy.status]}`}
              >
                {activeStudy.status}
              </span>

              <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[hsl(218,30%,34%)] transition hover:bg-white/60">
                {isConclusionExpanded ? (
                  <ChevronUp size={14} strokeWidth={2} />
                ) : (
                  <ChevronDown size={14} strokeWidth={2} />
                )}
              </span>
            </button>

            <p className="mt-3 text-[11px] leading-[1.45] tracking-[-0.02em] text-text-dark">
              {activeStudy.conclusion}
            </p>

            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isConclusionExpanded
                  ? "mt-3 max-h-[180px] border-t border-white/60 pt-3 opacity-100"
                  : "mt-0 max-h-0 border-t-0 pt-0 opacity-0"
              }`}
            >
              {activeStudy.conclusionDetails?.length ? (
                <ul className="space-y-1.5">
                  {activeStudy.conclusionDetails.map((detail, index) => (
                    <li
                      key={`${activeStudy.id}-conclusion-${index}`}
                      className="flex items-start gap-2 text-[10px] leading-[1.45] text-[hsl(216,20%,34%)]"
                    >
                      <span
                        className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${conclusionBulletStyles[activeStudy.status]}`}
                      />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="mx-4 mb-4 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)]">
            <div className="grid min-h-[82px] grid-cols-2 border-b border-[hsl(214,22%,88%)] bg-white">
              <div className="relative">
                <InfoColumn
                  icon={<MapPin size={13} strokeWidth={1.8} />}
                  label="Iestāde"
                  value={activeStudy.hospitalLocation}
                />

                <div className="absolute right-0 top-5 h-[42px] w-px bg-[hsl(214,22%,88%)]" />
              </div>

              <div>
                <InfoColumn
                  icon={<UserRound size={13} strokeWidth={1.8} />}
                  label="Ārsts"
                  value={activeStudy.doctor}
                />
              </div>
            </div>

            <div
              className={`relative shrink-0 overflow-hidden p-3 ${
                activeStudy.imageSrc
                  ? "flex h-[155px] items-center justify-center"
                  : "flex h-[102px] items-center justify-center"
              }`}
            >
              {activeStudy.imageSrc ? (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="flex h-full w-full items-center justify-center px-9"
                  aria-label="Atvērt attēlu pilnekrānā"
                >
                  <img
                    src={activeStudy.imageSrc}
                    alt={activeStudy.title}
                    className="block max-h-[128px] w-full rounded-[3px] object-contain"
                  />
                </button>
              ) : (
                <div className="mx-7 flex h-full w-full min-w-0 items-center justify-center rounded-[3px] px-2 py-1.5">
                  <div className="flex min-w-0 max-w-[240px] flex-col items-center text-center">
                    <p className="text-[10.5px] leading-tight text-[hsl(214,18%,44%)]">
                      Attēli šobrīd nav pieejami
                    </p>

                    <a
                      href={activeStudy.datamedUrl ?? "https://www.datamed.lv"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] border border-[hsl(216,34%,66%)] bg-white px-3.5 text-[9.5px] font-semibold text-[hsl(219,42%,24%)] shadow-[0_5px_12px_rgba(29,53,87,0.06)] transition hover:bg-[hsl(214,30%,98%)]"
                    >
                      <ExternalLink size={10} strokeWidth={1.9} />
                      Atvērt DATAMED
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="grid h-[56px] shrink-0 grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] border-t border-[hsl(214,22%,88%)] bg-white">
              <button
                type="button"
                onClick={goPrev}
                className={`${navButtonClass} justify-start`}
                aria-label="Iepriekšējais izmeklējums"
              >
                <span className={navIconClass}>
                  <ChevronLeft size={15} strokeWidth={2.15} />
                </span>

                <span className="hidden min-[430px]:inline truncate">
                  Iepriekšējais
                </span>
              </button>

              <div className="flex min-w-0 items-center justify-center border-x border-[hsl(214,22%,88%)] px-1 text-[10.5px] font-semibold text-[hsl(219,36%,22%)]">
                {activeIndex + 1} no {orderedStudies.length}
              </div>

              <button
                type="button"
                onClick={goNext}
                className={`${navButtonClass} justify-end`}
                aria-label="Nākamais izmeklējums"
              >
                <span className="hidden min-[430px]:inline truncate">
                  Nākamais
                </span>

                <span className={navIconClass}>
                  <ChevronRight size={15} strokeWidth={2.15} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {isFullscreen && (
        <CenteredOverlay
          onClose={() => setIsFullscreen(false)}
          overlayClassName="bg-[hsla(218,30%,12%,0.72)] backdrop-blur-md"
        >
          <div className="relative mx-auto w-full max-w-5xl rounded-[6px] border border-[hsl(214,24%,86%)] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-heading">
                  {activeStudy.type}
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-dark">
                  {activeStudy.title}
                </h3>

                <p className="mt-1 text-sm text-heading">
                  {formatLatvianDate(activeStudy.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-[4px] border border-[hsl(214,24%,86%)] bg-white px-4 py-2 text-sm font-semibold text-[hsl(219,42%,20%)] transition hover:bg-[hsl(214,30%,98%)]"
              >
                Aizvērt
              </button>
            </div>

            <div className="relative flex h-[76vh] items-center justify-center overflow-hidden rounded-[5px] border border-[hsl(214,24%,86%)] bg-[hsl(214,35%,98%)] p-5">
              <button
                type="button"
                onClick={goPrev}
                className={`${fullscreenArrowButtonClass} left-5`}
                aria-label="Iepriekšējais izmeklējums"
              >
                <ChevronLeft size={22} strokeWidth={2.1} />
              </button>

              {activeStudy.imageSrc ? (
                <img
                  src={activeStudy.imageSrc}
                  alt={activeStudy.title}
                  className="block h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[3px] bg-white/60">
                  <div className="flex max-w-sm flex-col items-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[3px] border border-[hsl(214,26%,84%)] bg-white text-[hsl(214,18%,58%)]">
                      <ImageOff size={30} />
                    </div>

                    <p className="text-xl font-semibold text-text-dark">
                      Attēli šobrīd nav pieejami
                    </p>

                    <a
                      href={activeStudy.datamedUrl ?? "https://www.datamed.lv"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-[4px] border border-[hsl(216,34%,66%)] bg-white px-4 text-sm font-semibold text-[hsl(219,42%,24%)] shadow-[0_5px_12px_rgba(29,53,87,0.06)] transition hover:bg-[hsl(214,30%,98%)]"
                    >
                      <ExternalLink size={15} strokeWidth={1.9} />
                      Atvērt DATAMED
                    </a>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={goNext}
                className={`${fullscreenArrowButtonClass} right-5`}
                aria-label="Nākamais izmeklējums"
              >
                <ChevronRight size={22} strokeWidth={2.1} />
              </button>
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicalImagingViewer;
