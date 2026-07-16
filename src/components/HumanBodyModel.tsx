import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ComponentType } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Dna,
  FlaskConical,
  HeartPulse,
  ScanSearch,
  X,
} from "lucide-react";

import humanBody from "@/assets/human-body.png";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { CenteredOverlay } from "@/components/ui/centered-overlay";

type Category =
  | "stacionars"
  | "radiologija"
  | "laboratorija"
  | "iedzimtas"
  | "hroniskas";

interface OrganProblem {
  id: string;
  title: string;
  shortSummary: string;
  category: Category;
  details: { label: string; value: string }[];
  recommendations: string[];
}

interface OrganData {
  id: string;
  label: string;
  hotX: number;
  hotY: number;
  problems: OrganProblem[];
}

interface PersistentCalloutLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConnectorBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ConnectorPoint {
  x: number;
  y: number;
}

const CATEGORY_CONFIG: Record<
  Category,
  {
    color: string;
    tint: string;
    badge: string;
    Icon: ComponentType<{
      className?: string;
      style?: CSSProperties;
    }>;
  }
> = {
  stacionars: {
    color: "hsl(358 44% 45%)",
    tint: "hsl(358 72% 97%)",
    badge: "Stacionāra atradnes",
    Icon: HeartPulse,
  },
  radiologija: {
    color: "hsl(271 40% 46%)",
    tint: "hsl(272 65% 96%)",
    badge: "Radioloģiskas atradnes",
    Icon: ScanSearch,
  },
  laboratorija: {
    color: "hsl(154 30% 38%)",
    tint: "hsl(154 46% 96%)",
    badge: "Laboratoriskas novirzes",
    Icon: FlaskConical,
  },
  iedzimtas: {
    color: "hsl(209 34% 42%)",
    tint: "hsl(209 58% 96%)",
    badge: "Iedzimtas slimības",
    Icon: Dna,
  },
  hroniskas: {
    color: "hsl(37 58% 40%)",
    tint: "hsl(42 66% 95%)",
    badge: "Hroniskas slimības",
    Icon: Activity,
  },
};

const CATEGORY_PRIORITY: Record<Category, number> = {
  stacionars: 0,
  laboratorija: 1,
  radiologija: 2,
  iedzimtas: 3,
  hroniskas: 4,
};

const ORGANS: OrganData[] = [
  {
    id: "plausas",
    label: "Plaušas",
    hotX: 43,
    hotY: 31,
    problems: [
      {
        id: "p1",
        title: "Solitārs mezgliņš kreisajā plaušā",
        shortSummary: "CT: mezgliņš kreisajā plaušā (8 mm)",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Datortomogrāfija (CT)" },
          { label: "Atradne", value: "Solitārs mezgliņš kreisajā plaušā, 8 mm" },
          { label: "Datums", value: "04.02.2025" },
          { label: "Ārsts", value: "Dr. I. Liepiņa, radioloģe" },
          { label: "LUNG-RADS", value: "3. kategorija" },
        ],
        recommendations: [
          "Atkārtota CT pēc 3 mēnešiem",
          "Nav aizdomu par laundabigu procesu",
          "Smēķēšanas pārtraukšanas konsultācija",
        ],
      },
      {
        id: "p2",
        title: "Hroniskas intersticiālas izmaiņas",
        shortSummary: "Nelielas fibrotiskas izmaiņas abās plaušās",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Krūškurvja CT" },
          { label: "Atradne", value: "Nelielas perifēras fibrotiskas izmaiņas" },
          { label: "Datums", value: "04.02.2025" },
          { label: "Salīdzinājums", value: "Stabilas, salīdzinot ar iepriekšējo" },
        ],
        recommendations: [
          "Pulmonologa kontrole 6 mēnešu laikā",
          "Atkārtota radioloģiska kontrole dinamikā",
        ],
      },
    ],
  },
  {
    id: "sirds",
    label: "Sirds",
    hotX: 54,
    hotY: 35,
    problems: [
      {
        id: "c1",
        title: "Akuts STEMI",
        shortSummary: "Miokarda infarkts — izraksts 12.03.2025",
        category: "stacionars",
        details: [
          { label: "Diagnoze", value: "Akūts ST-elevācijas miokarda infarkts (STEMI)" },
          { label: "Hospitalizācija", value: "05.03. – 12.03.2025" },
          { label: "Procedūra", value: "Perkutāna koronāra intervence (PCI)" },
          { label: "Stents", value: "DES stents LAD artērijā" },
          { label: "EF pēc PCI", value: "45% (viegls samazinājums)" },
        ],
        recommendations: [
          "Aspirīns 100 mg 1x/d ilgstoši",
          "Klopidogrels 75 mg 1x/d – 12 mēneši",
          "Atorvastatins 40 mg 1x/d",
          "Kardiorehabilitācija – 8 nedēļas",
        ],
      },
      {
        id: "c2",
        title: "Pēcinfarkta kreisā kambara disfunkcija",
        shortSummary: "EF samazinājums pēc PCI",
        category: "stacionars",
        details: [
          { label: "Echo", value: "EF 45%" },
          { label: "Funkcija", value: "Viegls sistoliskās funkcijas samazinājums" },
          { label: "Kontrole", value: "Plānota pēc 3 mēnešiem" },
        ],
        recommendations: [
          "Turpināt kardiologa uzraudzību",
          "Atkārtota ehokardiogrāfija pēc 3 mēnešiem",
        ],
      },
      {
        id: "c3",
        title: "Troponīna pieaugums akūtā fāzē",
        shortSummary: "Laboratoriski apstiprināts miokarda bojājums",
        category: "laboratorija",
        details: [
          { label: "Troponīns I", value: "Izteikti paaugstināts akūtā periodā" },
          { label: "Saistība", value: "Saskan ar STEMI klīnisko ainu" },
          { label: "Periods", value: "Hospitalizācijas laikā" },
        ],
        recommendations: [
          "Turpināt sekundāro profilaksi",
          "Kontrolēt lipīdus un glikēmiju",
        ],
      },
    ],
  },
  {
    id: "aknas",
    label: "Aknas",
    hotX: 46,
    hotY: 44,
    problems: [
      {
        id: "l1",
        title: "ALAT / ASAT paaugstinājums",
        shortSummary: "ALT: 78 U/L · AST: 65 U/L",
        category: "laboratorija",
        details: [
          { label: "ALT", value: "78 U/L (norma: 7–56 U/L) ?" },
          { label: "AST", value: "65 U/L (norma: 10–40 U/L) ?" },
          { label: "GGT", value: "42 U/L (norma)" },
          { label: "Bilirubīns", value: "18 µmol/L (norma)" },
          { label: "Analīžu datums", value: "01.04.2025" },
        ],
        recommendations: [
          "Atkārtotas aknu analīzes pēc 2 nedēļām",
          "Ieteicams vēdera dobuma USG",
          "Izvērtēt medikamentu hepatotoksicitāti",
        ],
      },
      {
        id: "l2",
        title: "Steatozes pazīmes USG",
        shortSummary: "USG: taukainas aknas bez fokāliem veidojumiem",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Vēdera dobuma USG" },
          { label: "Atradne", value: "Difūzas steatozes pazīmes" },
          { label: "Fokālie veidojumi", value: "Netiek aprakstīti" },
          { label: "Datums", value: "03.04.2025" },
        ],
        recommendations: [
          "Dzīvesveida korekcija un svara kontrole",
          "Atkārtot aknu rādītājus dinamikā",
        ],
      },
    ],
  },
  {
    id: "nieres",
    label: "Nieres",
    hotX: 58,
    hotY: 47,
    problems: [
      {
        id: "k1",
        title: "Policistiska nieru slimība (PKD1)",
        shortSummary: "Apstiprināta ģenētiska diagnoze",
        category: "iedzimtas",
        details: [
          { label: "Diagnoze", value: "Autosomāli dominanta policistiska nieru slimība" },
          { label: "Gēns", value: "PKD1 mutācija (apstiprināta 2020. gadā)" },
          { label: "GFR", value: "62 mL/min/1.73m² (CKD 2. stadija)" },
          { label: "Nieru izmērs", value: "Labā: 14,2 cm · Kreisā: 13,8 cm" },
          { label: "Cistas", value: "Multipla, lielākā 3,2 cm" },
        ],
        recommendations: [
          "USG + asinsanalīzes ik 6 mēnešus",
          "Asinsspiediena kontrole <130/80",
          "Ģenētiska konsultācija ģimenei",
          "Ūdens uzņemšana ≥2.5 L/dienā",
        ],
      },
      {
        id: "k2",
        title: "Hroniska nieru slimība, 2. stadija",
        shortSummary: "GFR samazinājums, nepieciešama kontrole",
        category: "hroniskas",
        details: [
          { label: "GFR", value: "62 mL/min/1.73m²" },
          { label: "CKD stadija", value: "2. stadija" },
          { label: "Albuminūrija", value: "Nav būtiska" },
        ],
        recommendations: [
          "Kontrolēt nieru funkciju dinamikā",
          "Izvairīties no nefrotoksiskiem medikamentiem",
        ],
      },
      {
        id: "k3",
        title: "Multipla nieru cista USG",
        shortSummary: "Attēldiagnostiski redzamas daudzas cistas abās nierēs",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Nieru ultrasonogrāfija" },
          { label: "Atradne", value: "Multipla cista abās nierēs" },
          { label: "Lielākā cista", value: "3.2 cm" },
        ],
        recommendations: [
          "Atkārtot attēldiagnostiku pēc nefrologa norādes",
          "Novērot nieru izmērus un cistu dinamiku",
        ],
      },
    ],
  },
];

const FEATURED_PROBLEM_IDS: Record<string, string> = {
  plausas: "p1",
  sirds: "c1",
  aknas: "l1",
  nieres: "k2",
};

const PERSISTENT_CALLOUT_LAYOUTS: Record<string, PersistentCalloutLayout> = {
  plausas: { x: -152, y: -78, width: 144, height: 52 },
  sirds: { x: 24, y: -76, width: 144, height: 52 },
  aknas: { x: -152, y: 64, width: 144, height: 52 },
  nieres: { x: 16, y: 80, width: 144, height: 52 },
};

function getFindingCountLabel(count: number) {
  return count === 1 ? "1 atradne" : `${count} atradnes`;
}

function getProblemCountLabel(count: number) {
  return count === 1 ? "1 problēma" : `${count} problēmas`;
}

function getUniqueCategories(problems: OrganProblem[]): Category[] {
  return [...new Set(problems.map((problem) => problem.category))].sort(
    (a, b) => CATEGORY_PRIORITY[a] - CATEGORY_PRIORITY[b]
  );
}

function getPrimaryCategory(problems: OrganProblem[]) {
  return getUniqueCategories(problems)[0] ?? "laboratorija";
}

function getFeaturedProblem(organ: OrganData) {
  const featuredId = FEATURED_PROBLEM_IDS[organ.id];

  if (!featuredId) return null;

  return organ.problems.find((problem) => problem.id === featuredId) ?? null;
}

function OrganRing({
  categories,
  size = 30,
  strokeWidth = 2.8,
}: {
  categories: Category[];
  size?: number;
  strokeWidth?: number;
}) {
  if (categories.length === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentCount = categories.length;
  const gapFraction = segmentCount > 1 ? 0.045 : 0;
  const segmentFraction = Math.max(1 / segmentCount - gapFraction, 0.01);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 h-full w-full -rotate-90"
      aria-hidden="true"
    >
      {categories.map((category, index) => {
        const startFraction = index / segmentCount + gapFraction / 2;
        const dashLength = circumference * segmentFraction;
        const gapLength = circumference - dashLength;

        return (
          <circle
            key={`${category}-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={CATEGORY_CONFIG[category].color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${gapLength}`}
            strokeDashoffset={-circumference * startFraction}
            strokeLinecap="round"
            opacity="0.86"
          />
        );
      })}
    </svg>
  );
}

function buildConnectorPath(points: ConnectorPoint[]) {
  if (points.length === 0) return "";

  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;

      const previous = points[index - 1];

      if (point.y === previous.y) {
        return `H ${point.x}`;
      }

      if (point.x === previous.x) {
        return `V ${point.y}`;
      }

      return `L ${point.x} ${point.y}`;
    })
    .join(" ");
}

function buildSharpConnector({
  layout,
  calloutOnRight,
}: {
  layout: PersistentCalloutLayout;
  calloutOnRight: boolean;
}) {
  const startPoint: ConnectorPoint = { x: 0, y: 0 };

  const elbowLift = 22;

  const calloutIsAboveMarker = layout.y + layout.height < 0;
  const calloutIsBelowMarker = layout.y > 20;

  let targetPoint: ConnectorPoint;
  let rawPoints: ConnectorPoint[];

  if (calloutIsAboveMarker) {
    // Top cards: circle center -> up -> across -> into the side edge of the card.
    targetPoint = {
      x: calloutOnRight ? layout.x : layout.x + layout.width,
      y: layout.y + layout.height * 0.58,
    };

    const elbowY = Math.min(-elbowLift, targetPoint.y + 6);

    rawPoints = [
      startPoint,
      {
        x: startPoint.x,
        y: elbowY,
      },
      {
        x: targetPoint.x,
        y: elbowY,
      },
      targetPoint,
    ];
  } else if (calloutIsBelowMarker) {
    // Lower cards: circle center -> across -> down/up -> directly into top edge of card.
    targetPoint = {
      x: calloutOnRight
        ? layout.x + layout.width * 0.38
        : layout.x + layout.width * 0.72,
      y: layout.y,
    };

    rawPoints = [
      startPoint,
      {
        x: targetPoint.x,
        y: startPoint.y,
      },
      targetPoint,
    ];
  } else {
    // Side cards: circle center -> directly into side edge of card.
    const calloutCenterY = layout.y + layout.height / 2;

    targetPoint = {
      x: calloutOnRight ? layout.x : layout.x + layout.width,
      y: calloutCenterY,
    };

    const elbowX = calloutOnRight
      ? Math.max(18, targetPoint.x - 20)
      : Math.min(-18, targetPoint.x + 20);

    rawPoints = [
      startPoint,
      {
        x: elbowX,
        y: startPoint.y,
      },
      {
        x: elbowX,
        y: targetPoint.y,
      },
      targetPoint,
    ];
  }

  const pad = 7;

  const left = Math.min(...rawPoints.map((point) => point.x)) - pad;
  const top = Math.min(...rawPoints.map((point) => point.y)) - pad;
  const right = Math.max(...rawPoints.map((point) => point.x)) + pad;
  const bottom = Math.max(...rawPoints.map((point) => point.y)) + pad;

  const bounds: ConnectorBounds = {
    left,
    top,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
  };

  const points = rawPoints.map((point) => ({
    x: point.x - bounds.left,
    y: point.y - bounds.top,
  }));

  const start = points[0];
  const target = points[points.length - 1];

  return {
    bounds,
    startX: start.x,
    startY: start.y,
    targetX: target.x,
    targetY: target.y,
    path: buildConnectorPath(points),
  };
}
function DiagnosisCallout({
  organ,
  problem,
  layout,
  onClick,
  onHoverStart,
  onHoverEnd,
}: {
  organ: OrganData;
  problem: OrganProblem;
  layout: PersistentCalloutLayout;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const categoryCfg = CATEGORY_CONFIG[problem.category];

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${layout.x}px`,
        top: `${layout.y}px`,
        width: `${layout.width}px`,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div
        className="relative overflow-hidden rounded-md border border-[hsl(214,22%,88%)] border-l-[3px] bg-white text-left transition-colors duration-200 hover:bg-[hsl(214,20%,98%)]"
        style={{ borderLeftColor: categoryCfg.color }}
      >
        <button
          type="button"
          onClick={onClick}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          className="relative flex w-full items-start px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
          style={{
            minHeight: `${layout.height}px`,
          }}
          aria-label={`${organ.label}: ${problem.title}. Atvērt detalizētu informāciju.`}
        >
          <div className="flex w-full items-start">
            <span className="min-w-0 flex-1">
              <span className="block whitespace-normal break-words text-xs font-semibold leading-4 text-[hsl(220,42%,16%)]">
                {problem.title}
              </span>
            </span>
          </div>
        </button>

      </div>
    </div>
  );
}

function OrganHotspot({
  organ,
  isActive,
  isExpanded,
  onClick,
  onHoverStart,
  onHoverEnd,
}: {
  organ: OrganData;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const categories = getUniqueCategories(organ.problems);
  const primaryCategory = getPrimaryCategory(organ.problems);
  const primaryColor = CATEGORY_CONFIG[primaryCategory].color;
  const featuredProblem = getFeaturedProblem(organ);
  const persistentCalloutLayout = PERSISTENT_CALLOUT_LAYOUTS[organ.id];

  const hasCallout = Boolean(featuredProblem && persistentCalloutLayout);
  const markerSize = hasCallout ? 28 : 24;
  const strokeWidth = hasCallout ? 2.4 : 2;

  const calloutOnRight = persistentCalloutLayout
    ? persistentCalloutLayout.x > 0
    : true;

  const connector = persistentCalloutLayout
    ? buildSharpConnector({
        layout: persistentCalloutLayout,
        calloutOnRight,
      })
    : null;

  const categoryCfg = featuredProblem ? CATEGORY_CONFIG[featuredProblem.category] : null;

  return (
    <div
      className="absolute h-0 w-0"
      style={{
        left: `${organ.hotX}%`,
        top: `${organ.hotY}%`,
        zIndex: isExpanded ? 90 : isActive ? 80 : 20,
      }}
    >
      {featuredProblem && persistentCalloutLayout && connector && categoryCfg && (
        <>
          <svg
            className="pointer-events-none absolute z-20 overflow-visible"
            style={{
              left: `${connector.bounds.left}px`,
              top: `${connector.bounds.top}px`,
              width: `${connector.bounds.width}px`,
              height: `${connector.bounds.height}px`,
            }}
            viewBox={`0 0 ${connector.bounds.width} ${connector.bounds.height}`}
            aria-hidden="true"
          >
            <path
              d={connector.path}
              fill="none"
              stroke={categoryCfg.color}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.82"
            />
          </svg>

          <DiagnosisCallout
            organ={organ}
            problem={featuredProblem}
            layout={persistentCalloutLayout}
            onClick={onClick}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
          />
        </>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={`${organ.label}, ${getProblemCountLabel(
          organ.problems.length
        )}. Atvērt detalizētu informāciju.`}
        aria-pressed={isActive}
        className="group absolute left-0 top-0 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
      >
        <span
          className="absolute inset-[-4px] rounded-full transition-colors duration-200"
          style={{
            backgroundColor: primaryColor,
            opacity: isActive ? 0.16 : hasCallout ? 0.08 : 0.06,
          }}
        />

        <span
          className="relative block transition-transform duration-200 group-hover:scale-105"
          style={{ width: markerSize, height: markerSize }}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
        >
          <OrganRing categories={categories} size={markerSize} strokeWidth={strokeWidth} />

          <span
            className="absolute flex items-center justify-center rounded-full border bg-white"
            style={{
              inset: hasCallout ? 4 : 3.5,
              borderColor: `${primaryColor}24`,
              boxShadow: isActive ? `0 0 0 3px ${primaryColor}18` : "none",
            }}
          >
            <span
              className="text-xs font-semibold leading-none text-[hsl(220,42%,16%)]"
            >
              {organ.problems.length}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

function ProblemAccordion({
  problem,
  onOpen,
}: {
  problem: OrganProblem;
  onOpen: () => void;
}) {
  const categoryCfg = CATEGORY_CONFIG[problem.category];
  const Icon = categoryCfg.Icon;
  const open = false;

  return (
    <div className="border-b border-[hsl(214,22%,90%)] last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="grid min-h-16 w-full grid-cols-[4px_minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 text-left transition-colors duration-200 hover:bg-[hsl(214,20%,99%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)] md:grid-cols-[4px_minmax(0,1fr)_minmax(220px,0.8fr)_auto] md:gap-x-5"
      >
        <span
          className="row-span-3 h-full min-h-12 w-1 rounded-full md:row-span-2"
          style={{ backgroundColor: categoryCfg.color }}
          aria-hidden="true"
        />
        <div className="contents">
          <div className="contents">
            <p className="col-start-2 row-start-1 text-sm font-semibold leading-5 text-[hsl(222,28%,20%)] md:col-start-2">
              {problem.title}
            </p>

            <span
              className="col-start-2 row-start-2 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold md:col-start-3 md:row-start-1"
              style={{
                backgroundColor: `${categoryCfg.color}10`,
                color: categoryCfg.color,
                borderColor: `${categoryCfg.color}32`,
              }}
            >
              <Icon className="h-3 w-3" />
              {categoryCfg.badge}
            </span>
          </div>

          <p className="col-start-2 row-start-3 text-sm leading-5 text-[hsl(214,14%,52%)] md:col-start-2 md:row-start-2">
            {problem.shortSummary}
          </p>
        </div>

        <span className="col-start-3 row-start-1 self-center text-[hsl(214,14%,52%)] md:col-start-4 md:row-start-1">
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div className="border-t border-[hsl(214,22%,90%)] bg-[hsl(214,20%,98%)]">
          <div>
            <p className="border-b border-[hsl(214,22%,90%)] px-4 py-2.5 text-xs font-semibold text-[hsl(214,14%,58%)]">
              Detalizēta informācija
            </p>

            <div className="grid border-t border-[hsl(214,22%,90%)] sm:grid-cols-2">
              {problem.details.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="min-w-0 border-b border-[hsl(214,22%,90%)] px-4 py-3 sm:border-r sm:[&:nth-child(2n)]:border-r-0"
                >
                  <span className="block text-xs font-semibold leading-4 text-[hsl(214,14%,56%)]">
                    {item.label}:
                  </span>
                  <span className="mt-1 block break-words text-sm leading-5 text-[hsl(222,20%,24%)] tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[hsl(214,22%,90%)] bg-white">
            <p className="border-b border-[hsl(214,22%,90%)] px-4 py-2.5 text-xs font-semibold text-[hsl(214,14%,58%)]">
              Ieteikumi
            </p>

            <ul className="space-y-2.5 px-4 py-4">
              {problem.recommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-3 text-sm leading-5 text-[hsl(222,20%,24%)]"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryCfg.color }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function OrganModal({
  organ,
  onClose,
  onSelectProblem,
}: {
  organ: OrganData;
  onClose: () => void;
  onSelectProblem: (problem: OrganProblem) => void;
}) {
  const categories = getUniqueCategories(organ.problems);
  const primaryColor = CATEGORY_CONFIG[categories[0] ?? "laboratorija"].color;

  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(15,23,42,0.28)]"
      contentClassName="max-w-5xl"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="organ-detail-title"
        className="mx-auto max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-lg border border-[hsl(214,22%,88%)] bg-white"
      >
        <header className="relative flex items-start justify-between gap-4 border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-md text-[hsl(215,14%,55%)] transition-colors duration-200 hover:bg-[hsl(214,20%,96%)] hover:text-[hsl(215,22%,28%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
            aria-label="Aizvērt"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-start gap-3">
              <div className="relative mt-0.5 h-10 w-10 shrink-0">
                <OrganRing categories={categories} size={38} strokeWidth={4} />

                <div
                  className="absolute inset-[5px] flex items-center justify-center rounded-full border bg-white"
                  style={{ borderColor: "hsl(210 18% 88%)" }}
                >
                  <span className="text-xs font-semibold text-[hsl(222,28%,20%)]">
                    {organ.problems.length}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 id="organ-detail-title" className="text-2xl font-semibold tracking-[-0.035em] text-[hsl(222,28%,20%)]">
                    {organ.label}
                  </h3>

                  <span
                    className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                      borderColor: `${primaryColor}32`,
                    }}
                  >
                    {getFindingCountLabel(organ.problems.length)}
                  </span>
                </div>
              </div>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          <div className="hidden grid-cols-[4px_minmax(0,1fr)_minmax(220px,0.8fr)_auto] gap-x-5 rounded-t-lg border border-b-0 border-[hsl(214,22%,88%)] bg-[hsl(214,20%,96%)] px-4 py-2.5 text-xs font-semibold text-[hsl(214,14%,52%)] md:grid">
            <span aria-hidden="true" />
            <span>Atradne</span>
            <span>Avots</span>
            <span className="sr-only">Darbība</span>
          </div>
          <div className="clinical-list rounded-t-none">
            {organ.problems.map((problem) => (
              <ProblemAccordion
                key={problem.id}
                problem={problem}
                onOpen={() => onSelectProblem(problem)}
              />
            ))}
          </div>
        </div>
      </section>
    </CenteredOverlay>
  );
}

function DiagnosisDetailModal({
  organ,
  problem,
  onClose,
  onBack,
}: {
  organ: OrganData;
  problem: OrganProblem;
  onClose: () => void;
  onBack: () => void;
}) {
  const categoryCfg = CATEGORY_CONFIG[problem.category];
  const Icon = categoryCfg.Icon;

  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(15,23,42,0.32)]"
      contentClassName="max-w-4xl"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnosis-detail-title"
        className="mx-auto max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-lg border border-[hsl(214,22%,88%)] bg-white"
      >
        <header className="relative border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6">
          <div className="pr-12">
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-[hsl(215,14%,48%)] transition-colors duration-200 hover:text-[hsl(222,28%,20%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {organ.label}
            </button>

            <div className="flex min-w-0 items-start gap-3">
              <span
                className="mt-0.5 h-12 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: categoryCfg.color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="diagnosis-detail-title"
                    className="text-2xl font-semibold leading-tight tracking-[-0.035em] text-[hsl(222,28%,20%)]"
                  >
                    {problem.title}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${categoryCfg.color}10`,
                      borderColor: `${categoryCfg.color}32`,
                      color: categoryCfg.color,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {categoryCfg.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-[hsl(214,14%,52%)]">
                  {problem.shortSummary}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-md text-[hsl(215,14%,55%)] transition-colors duration-200 hover:bg-[hsl(214,20%,96%)] hover:text-[hsl(215,22%,28%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] sm:right-6"
            aria-label="Aizvērt diagnozes detalizēto skatu"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <section aria-labelledby="diagnosis-details-heading" className="overflow-hidden rounded-lg border border-[hsl(214,22%,88%)]">
            <h4
              id="diagnosis-details-heading"
              className="border-b border-[hsl(214,22%,90%)] bg-[hsl(214,20%,96%)] px-4 py-3 text-sm font-semibold text-[hsl(222,28%,20%)]"
            >
              Klīniskā informācija
            </h4>
            <dl className="grid sm:grid-cols-2">
              {problem.details.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="min-w-0 border-b border-[hsl(214,22%,90%)] px-4 py-3 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0"
                >
                  <dt className="text-xs font-semibold leading-4 text-[hsl(214,14%,52%)]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 whitespace-normal break-words text-sm leading-5 text-[hsl(222,20%,24%)] tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="diagnosis-recommendations-heading" className="mt-5 overflow-hidden rounded-lg border border-[hsl(214,22%,88%)]">
            <h4
              id="diagnosis-recommendations-heading"
              className="border-b border-[hsl(214,22%,90%)] bg-[hsl(214,20%,96%)] px-4 py-3 text-sm font-semibold text-[hsl(222,28%,20%)]"
            >
              Ieteikumi
            </h4>
            <ul className="space-y-2.5 px-4 py-4">
              {problem.recommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-3 text-sm leading-5 text-[hsl(222,20%,24%)]"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryCfg.color }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </CenteredOverlay>
  );
}

export default function HumanBodyModel() {
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [expandedOrganId, setExpandedOrganId] = useState<string | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<{
    organ: OrganData;
    problem: OrganProblem;
  } | null>(null);

  const activeOrgan = useMemo(
    () => ORGANS.find((organ) => organ.id === selectedOrganId) ?? null,
    [selectedOrganId]
  );

  return (
    <>
      <div className="clinical-panel relative flex h-full w-full flex-col">
        <DashboardCardHeader
          title="Ķermeņa pārskats"
          infoLabel="Informācija par ķermeņa pārskatu"
          infoDescription="Nospiediet uz orgāna vai diagnozes, lai skatītu detalizētu informāciju par atradnēm."
        />

        <div className="relative mt-1 flex h-[390px] w-full items-center justify-center overflow-visible border-y border-[hsl(214,22%,90%)] px-2 py-2">
          <img
            src={humanBody}
            alt="Cilvēka ķermeņa modelis"
            className="relative z-0 h-[340px] w-full max-w-full select-none object-contain object-center opacity-95"
            style={{
              filter: "saturate(0.92)",
            }}
            width={1400}
            height={2200}
            draggable={false}
          />
        

          {ORGANS.map((organ) => (
            <OrganHotspot
              key={organ.id}
              organ={organ}
              isActive={selectedOrganId === organ.id}
              isExpanded={expandedOrganId === organ.id}
              onClick={() => setSelectedOrganId(organ.id)}
              onHoverStart={() => setExpandedOrganId(organ.id)}
              onHoverEnd={() =>
                setExpandedOrganId((current) => (current === organ.id ? null : current))
              }
            />
          ))}
        </div>
      </div>
      

      {activeOrgan && (
        <OrganModal
          organ={activeOrgan}
          onClose={() => setSelectedOrganId(null)}
          onSelectProblem={(problem) => {
            setSelectedOrganId(null);
            setSelectedDiagnosis({ organ: activeOrgan, problem });
          }}
        />
      )}

      {selectedDiagnosis && (
        <DiagnosisDetailModal
          organ={selectedDiagnosis.organ}
          problem={selectedDiagnosis.problem}
          onClose={() => setSelectedDiagnosis(null)}
          onBack={() => {
            setSelectedOrganId(selectedDiagnosis.organ.id);
            setSelectedDiagnosis(null);
          }}
        />
      )}
    </>
  );
}
