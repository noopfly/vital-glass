import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ComponentType } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Dna,
  FlaskConical,
  HeartPulse,
  ScanSearch,
  X,
} from "lucide-react";

import humanBody from "@/assets/human-body.png";
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
          { label: "LUNG-RADS", value: "3 kategorija" },
        ],
        recommendations: [
          "Atkārtota CT pēc 3 mēnešiem",
          "Nav aizdomu par ļaundabīgu procesu",
          "Smēķēšanas pārtraukšanas konsultācija",
        ],
      },
      {
        id: "p2",
        title: "Hroniskas intersticiālas izmaiņas",
        shortSummary: "Nelielas fibrozas izmaiņas abās plaušās",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Krūškurvja CT" },
          { label: "Atradne", value: "Nelielas perifēras fibrozas izmaiņas" },
          { label: "Datums", value: "04.02.2025" },
          { label: "Salīdzinājums", value: "Stabilas salīdzinot ar iepriekšējo" },
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
        title: "Akūts STEMI",
        shortSummary: "Miokarda infarkts — izraksts 12.03.2025",
        category: "stacionars",
        details: [
          { label: "Diagnoze", value: "Akūts ST-elevācijas miokarda infarkts (STEMI)" },
          { label: "Hospitalizācija", value: "05.03 – 12.03.2025" },
          { label: "Procedūra", value: "Perkutāna koronāra intervence (PCI)" },
          { label: "Stents", value: "DES stents LAD artērijā" },
          { label: "EF pēc PCI", value: "45% (viegls samazinājums)" },
        ],
        recommendations: [
          "Aspirīns 100 mg 1x/d ilgstoši",
          "Klopidogrels 75 mg 1x/d — 12 mēneši",
          "Atorvastatīns 40 mg 1x/d",
          "Kardiorehabilitācija — 8 nedēļas",
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
        shortSummary: "ALT: 78 U/L ↑ | AST: 65 U/L ↑",
        category: "laboratorija",
        details: [
          { label: "ALT", value: "78 U/L (norma: 7–56 U/L) ↑" },
          { label: "AST", value: "65 U/L (norma: 10–40 U/L) ↑" },
          { label: "GGT", value: "42 U/L (norma)" },
          { label: "Bilirubīns", value: "18 μmol/L (norma)" },
          { label: "Analīžu datums", value: "01.04.2025" },
        ],
        recommendations: [
          "Atkārtotas aknu analīzes pēc 2 nedēļām",
          "Ieteicams USG vēdera dobuma",
          "Izvērtēt medikamentu hepatotoksicitāti",
        ],
      },
      {
        id: "l2",
        title: "Steatozes pazīmes USG",
        shortSummary: "USG: taukainas aknas bez fokāliem veidojumiem",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "USG vēdera dobuma" },
          { label: "Atradne", value: "Difūzas steatozes pazīmes" },
          { label: "Fokāli veidojumi", value: "Netiek aprakstīti" },
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
        title: "Policistiskā nieru slimība (PKD1)",
        shortSummary: "Apstiprināta ģenētiska diagnoze",
        category: "iedzimtas",
        details: [
          { label: "Diagnoze", value: "Autosomāli dominantā policistiskā nieru slimība" },
          { label: "Gēns", value: "PKD1 mutācija (apstiprināta 2020)" },
          { label: "GFR", value: "62 mL/min/1.73m² (CKD 2. stadija)" },
          { label: "Nieru izmērs", value: "Labā: 14.2 cm | Kreisā: 13.8 cm" },
          { label: "Cistas", value: "Multiplās, lielākā 3.2 cm" },
        ],
        recommendations: [
          "USG + asinsanalīzes ik 6 mēnešus",
          "Asinsspiediena kontrole <130/80",
          "Ģenētiskā konsultācija ģimenei",
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
        title: "Multiplas nieru cistas USG",
        shortSummary: "Attēldiagnostiski redzamas daudzas cistas abās nierēs",
        category: "radiologija",
        details: [
          { label: "Izmeklējums", value: "Nieru ultrasonogrāfija" },
          { label: "Atradne", value: "Multiplas cistas abās nierēs" },
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
  plausas: { x: -142, y: -72, width: 128, height: 42 },
  sirds: { x: 26, y: -74, width: 128, height: 40 },
  aknas: { x: -142, y: 56, width: 128, height: 42 },
  nieres: { x: 12, y: 76, width: 132, height: 42 },
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
  otherProblems,
  layout,
  categoryColor,
  Icon,
  expanded,
  onClick,
  onHoverStart,
  onHoverEnd,
}: {
  organ: OrganData;
  problem: OrganProblem;
  otherProblems: OrganProblem[];
  layout: PersistentCalloutLayout;
  categoryColor: string;
  Icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  expanded: boolean;
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
        className="relative overflow-hidden rounded-[7px] border bg-white text-left shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-all duration-150 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
        style={{
          borderColor: "hsl(214 24% 88%)",
          backgroundColor: "rgba(255,255,255,0.98)",
        }}
      >
        <button
          type="button"
          onClick={onClick}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          className="relative flex w-full items-center px-2 py-1.5 text-left focus-visible:outline-none"
          style={{
            height: `${layout.height}px`,
          }}
          aria-label={`${organ.label}: ${problem.title}. Atvērt detalizētu informāciju.`}
        >
          <div className="flex w-full items-center gap-1.5">
            <span
              className="flex shrink-0 items-center justify-center rounded-[5px] border"
              style={{
                width: 20,
                height: 20,
                backgroundColor: categoryCfg.tint,
                borderColor: `${categoryColor}1f`,
                color: categoryColor,
              }}
            >
              <Icon className="h-2.5 w-2.5 stroke-[1.8]" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[8.5px] font-semibold leading-[10.5px] text-[hsl(220,42%,16%)]">
                {problem.title}
              </span>
            </span>

            <ChevronRight className="h-2.5 w-2.5 shrink-0 text-[hsl(216,15%,58%)]" />
          </div>
        </button>

        {expanded && otherProblems.length > 0 && (
          <div className="border-t border-[hsl(214,24%,90%)] bg-white px-2 pb-2 pt-1.5">
            <p className="mb-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[hsl(216,16%,58%)]">
              Citas diagnozes
            </p>

            <div className="space-y-1">
              {otherProblems.map((item) => {
                const itemCfg = CATEGORY_CONFIG[item.category];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={onClick}
                    className="flex w-full items-start gap-1.5 rounded-[5px] px-1 py-1 text-left text-[8px] font-medium leading-[10.5px] text-[hsl(220,30%,24%)] hover:bg-[hsl(214,26%,97%)]"
                  >
                    <span
                      className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: itemCfg.color }}
                    />
                    <span className="line-clamp-2">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
  const markerSize = hasCallout ? 30 : 24;
  const strokeWidth = hasCallout ? 2.8 : 2.4;

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
  const Icon = categoryCfg?.Icon;

  const otherProblems = featuredProblem
    ? organ.problems.filter((item) => item.id !== featuredProblem.id)
    : [];

  return (
    <div
      className="absolute h-0 w-0"
      style={{
        left: `${organ.hotX}%`,
        top: `${organ.hotY}%`,
        zIndex: isExpanded ? 90 : isActive ? 80 : 20,
      }}
    >
      {featuredProblem && persistentCalloutLayout && connector && categoryCfg && Icon && (
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
            otherProblems={otherProblems}
            layout={persistentCalloutLayout}
            categoryColor={categoryCfg.color}
            Icon={Icon}
            expanded={isExpanded}
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
        className="group absolute left-0 top-0 z-40 -translate-x-1/2 -translate-y-1/2"
      >
        {isActive && (
          <span
            className="absolute inset-[-8px] animate-ping rounded-full"
            style={{
              backgroundColor: primaryColor,
              opacity: 0.1,
              animationDuration: "1.8s",
            }}
          />
        )}

        <span
          className="absolute inset-[-8px] rounded-full transition-all duration-200"
          style={{
            backgroundColor: primaryColor,
            opacity: isActive ? 0.1 : hasCallout ? 0.045 : 0.035,
            filter: "blur(6px)",
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
              boxShadow: isActive
                ? `0 0 0 3px ${primaryColor}16, 0 6px 14px rgba(15,23,42,0.08)`
                : "0 6px 14px rgba(15,23,42,0.07)",
            }}
          >
            <span
              className="font-bold leading-none text-[hsl(220,42%,16%)]"
              style={{ fontSize: hasCallout ? 10 : 8.5 }}
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
  open,
  onToggle,
}: {
  problem: OrganProblem;
  open: boolean;
  onToggle: () => void;
}) {
  const categoryCfg = CATEGORY_CONFIG[problem.category];
  const Icon = categoryCfg.Icon;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[hsl(210,22%,86%)] bg-[hsl(214,20%,98%)] shadow-[0_6px_18px_rgba(29,53,87,0.05)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-white/60"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-semibold text-[hsl(222,28%,20%)]">
              {problem.title}
            </p>

            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${categoryCfg.color}10`,
                color: categoryCfg.color,
              }}
            >
              <Icon className="h-3 w-3" />
              {categoryCfg.badge}
            </span>
          </div>

          <p className="mt-2 text-[12px] leading-[17px] text-[hsl(214,14%,52%)]">
            {problem.shortSummary}
          </p>
        </div>

        <span className="mt-0.5 shrink-0 text-[hsl(214,14%,52%)]">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-[hsl(210,24%,90%)] bg-white px-4 py-4">
          <div className="mb-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(214,14%,58%)]">
              Detalizēta informācija
            </p>

            <div className="space-y-2.5">
              {problem.details.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 text-[13px] leading-[18px] max-sm:grid-cols-1 max-sm:gap-y-0.5"
                >
                  <span className="font-medium text-[hsl(214,14%,56%)]">
                    {item.label}:
                  </span>
                  <span className="font-medium text-[hsl(222,20%,24%)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[hsl(210,24%,92%)] pt-4">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(214,14%,58%)]">
              Ieteikumi
            </p>

            <ul className="space-y-2">
              {problem.recommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 text-[13px] leading-[18px] text-[hsl(222,20%,24%)]"
                >
                  <span
                    className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
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

function OrganModal({ organ, onClose }: { organ: OrganData; onClose: () => void }) {
  const categories = getUniqueCategories(organ.problems);
  const primaryColor = CATEGORY_CONFIG[categories[0] ?? "laboratorija"].color;

  const [openProblemIds, setOpenProblemIds] = useState<string[]>([]);

  useEffect(() => {
    setOpenProblemIds([]);
  }, [organ.id]);

  const toggleProblem = (id: string) => {
    setOpenProblemIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(241,245,249,0.72)] backdrop-blur-[6px]"
    >
      <div className="relative mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[14px] border border-[hsl(210,22%,88%)] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
        <div className="max-h-[90vh] overflow-y-auto p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[hsl(214,20%,96%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
            aria-label="Aizvērt"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex items-start justify-between gap-4 pr-14">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative mt-0.5 h-[38px] w-[38px] shrink-0">
                <OrganRing categories={categories} size={38} strokeWidth={4} />

                <div
                  className="absolute inset-[5px] flex items-center justify-center rounded-full border bg-white"
                  style={{ borderColor: "hsl(210 18% 88%)" }}
                >
                  <span className="text-[11px] font-bold text-[hsl(222,28%,20%)]">
                    {organ.problems.length}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[22px] font-semibold text-[hsl(222,28%,20%)]">
                    {organ.label}
                  </h3>

                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  >
                    {getFindingCountLabel(organ.problems.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {organ.problems.map((problem) => (
              <ProblemAccordion
                key={problem.id}
                problem={problem}
                open={openProblemIds.includes(problem.id)}
                onToggle={() => toggleProblem(problem.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </CenteredOverlay>
  );
}

export default function HumanBodyModel() {
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [expandedOrganId, setExpandedOrganId] = useState<string | null>(null);

  const activeOrgan = useMemo(
    () => ORGANS.find((organ) => organ.id === selectedOrganId) ?? null,
    [selectedOrganId]
  );

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[6px] border border-[hsl(214,22%,88%)] bg-white p-3.5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <ScanSearch className="h-[18px] w-[18px]" />
            </div>

            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
              Ķermeņa pārskats
            </h2>
          </div>
        </div>

        <div className="relative mx-auto mt-3 flex h-[390px] w-full max-w-[360px] items-center justify-center overflow-visible rounded-[1.4rem] px-2 py-2 shadow-[inset_0_1px_0_hsla(0,0%,100%,0.75)]">
          <img
            src={humanBody}
            alt="Cilvēka ķermeņa modelis"
            className="relative z-0 h-[340px] w-auto max-w-full select-none object-contain object-center opacity-95"
            style={{
              filter:
                "drop-shadow(0 8px 24px rgba(148,163,184,0.14)) saturate(0.92)",
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

        <p className="mt-2 text-center text-[10px] leading-4 text-[hsl(214,14%,58%)]">
          Nospiediet uz orgāna vai diagnozes, lai atvērtu detalizētu informāciju
        </p>
      </div>
      

      {activeOrgan && (
        <OrganModal organ={activeOrgan} onClose={() => setSelectedOrganId(null)} />
      )}
    </>
  );
}
