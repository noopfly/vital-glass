import { useMemo, useState, type ReactNode } from "react";
import {
  ActivitySquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ImageOff,
  MapPin,
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
    imageSrc: rtKruskurvjaAugsdalaImage,
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
    datamedUrl: "https://www.datamed.lv",
  },
];

const sectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

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
    <div className="min-w-0 px-3 py-3.5">
      <div className="mb-2 flex items-center gap-1.5">
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

  const activeStudy = orderedStudies[activeIndex];

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
      <section className="flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-[6px] border border-[rgba(220,228,236,0.96)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
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

        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-text-dark">
            {activeStudy.title}
          </h3>

          <div className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-[11px] font-medium text-heading">
            <CalendarDays size={12} strokeWidth={1.8} />
            {formatLatvianDate(activeStudy.date)}
          </div>
        </div>

        <div
          className={`mb-3 rounded-[5px] border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] ${
            conclusionPanelStyles[activeStudy.status]
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-[hsl(214,26%,86%)] bg-white text-[hsl(218,30%,34%)]">
              <FileText size={12} strokeWidth={1.8} />
            </div>

            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-heading">
              Slēdziens
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-full border px-2 py-1 text-center text-[8.5px] font-semibold leading-none ${statusStyles[activeStudy.status]}`}
            >
              {activeStudy.status}
            </span>

            <p className="line-clamp-3 text-[11px] leading-[1.45] tracking-[-0.02em] text-text-dark">
              {activeStudy.conclusion}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[5px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)]">
          <div className="relative flex h-[155px] shrink-0 items-center justify-center overflow-hidden p-3">
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[4px] border border-[hsl(214,22%,88%)] bg-white/95 text-[hsl(216,22%,38%)] shadow-[0_6px_14px_rgba(29,53,87,0.08)] transition hover:bg-white"
              aria-label="Iepriekšējais izmeklējums"
            >
              <ChevronLeft size={18} />
            </button>

            {activeStudy.imageSrc ? (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex h-full w-full items-center justify-center"
                aria-label="Atvērt attēlu pilnekrānā"
              >
                <img
                  src={activeStudy.imageSrc}
                  alt={activeStudy.title}
                  className="block max-h-[128px] w-full rounded-[3px] object-contain"
                />
              </button>
            ) : (
              <div className="mx-9 flex h-full w-full min-w-0 items-center justify-center rounded-[3px] px-3 py-3">
                <div className="flex min-w-0 max-w-[230px] flex-col items-center text-center">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-[3px] border border-[hsl(214,24%,84%)] bg-white text-[hsl(214,18%,58%)]">
                    <ImageOff size={19} />
                  </div>

                  <p className="text-[13px] font-semibold leading-tight text-text-dark">
                    Attēli šobrīd nav pieejami
                  </p>

                  <a
                    href={activeStudy.datamedUrl ?? "https://www.datamed.lv"}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex h-7 items-center justify-center gap-1.5 rounded-[4px] border border-[hsl(216,34%,66%)] bg-white px-3 text-[9px] font-semibold text-[hsl(219,42%,24%)] shadow-[0_5px_12px_rgba(29,53,87,0.06)] transition hover:bg-[hsl(214,30%,98%)]"
                  >
                    <ExternalLink size={11} strokeWidth={1.9} />
                    Atvērt DATAMED
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[4px] border border-[hsl(214,22%,88%)] bg-white/95 text-[hsl(216,22%,38%)] shadow-[0_6px_14px_rgba(29,53,87,0.08)] transition hover:bg-white"
              aria-label="Nākamais izmeklējums"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid min-h-[82px] grid-cols-[0.78fr_1.44fr_0.78fr] border-t border-[hsl(214,22%,88%)] bg-white">
            <div className="relative">
              <InfoColumn
                icon={<CalendarDays size={12} strokeWidth={1.8} />}
                label="Datums"
                value={formatLatvianDate(activeStudy.date)}
              />

              <div className="absolute right-0 top-5 h-[42px] w-px bg-[hsl(214,22%,88%)]" />
            </div>

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
                className="absolute left-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] border border-[hsl(214,24%,86%)] bg-white text-[hsl(216,22%,38%)] shadow-[0_12px_24px_rgba(29,53,87,0.12)]"
                aria-label="Iepriekšējais izmeklējums"
              >
                <ChevronLeft size={24} />
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
                className="absolute right-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] border border-[hsl(214,24%,86%)] bg-white text-[hsl(216,22%,38%)] shadow-[0_12px_24px_rgba(29,53,87,0.12)]"
                aria-label="Nākamais izmeklējums"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default MedicalImagingViewer;