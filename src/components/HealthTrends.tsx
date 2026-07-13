import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  Droplets,
  FlaskConical,
  Heart,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { DashboardListFooter } from "@/components/DashboardListFooter";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Status = "normal" | "warning" | "critical";
type ReferenceType = "between" | "max" | "min";

interface LabHistoryPoint {
  date: string;
  shortLabel: string;
  fullLabel: string;
  value: number;
}

interface LabResult {
  id: string;
  name: string;
  icon: ReactNode;
  normalRange: string;
  referenceType: ReferenceType;
  normalMin?: number;
  normalMax?: number;
  value: number;
  displayValue?: string;
  unit: string;
  decimals: number;
  change: string;
  changePositive: boolean;
  status: Status;
  history: LabHistoryPoint[];
}

type RawLabResult = Omit<LabResult, "status">;

const defaultVisibleLabCount = 4;

const statusColors: Record<Status, string> = {
  normal: "hsl(152, 60%, 45%)",
  warning: "hsl(40, 90%, 50%)",
  critical: "hsl(0, 72%, 55%)",
};

const statusDotClass: Record<Status, string> = {
  normal: "bg-status-normal",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
};

const statusTextClass: Record<Status, string> = {
  normal: "text-status-normal",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

const statusLabel: Record<Status, string> = {
  normal: "Normā",
  warning: "Ārpus normas",
  critical: "Kritisks",
};

function formatShortHistoryDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
    .format(parseHistoryDate(date))
    .replace(",", "");
}

function formatFullHistoryDate(date: string) {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function parseHistoryDate(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

function formatAdaptiveShortHistoryDate(date: string, includeYear: boolean) {
  if (!includeYear) {
    return formatShortHistoryDate(date);
  }

  const shortYear = String(parseHistoryDate(date).getUTCFullYear()).slice(-2);
  return `${formatShortHistoryDate(date)} '${shortYear}`;
}

function createHistoryPoint(date: string, value: number): LabHistoryPoint {
  return {
    date,
    shortLabel: formatShortHistoryDate(date),
    fullLabel: formatFullHistoryDate(date),
    value,
  };
}

const rawLabResults: RawLabResult[] = [
  {
    id: "bp",
    name: "Asinsspiediens",
    icon: <Activity size={20} />,
    normalRange: "90-120 / 60-80",
    referenceType: "between",
    normalMin: 90,
    normalMax: 120,
    value: 135,
    displayValue: "135/94",
    unit: "mmHg",
    decimals: 0,
    change: "+0.8%",
    changePositive: false,
    history: [
      createHistoryPoint("2023-02-25", 118),
      createHistoryPoint("2025-03-25", 120),
      createHistoryPoint("2025-05-13", 122),
      createHistoryPoint("2026-04-05", 135),
    ],
  },
  {
    id: "glucose",
    name: "Glikoze",
    icon: <Droplets size={20} />,
    normalRange: "3.9-5.5",
    referenceType: "between",
    normalMin: 3.9,
    normalMax: 5.5,
    value: 5.8,
    unit: "mmol/L",
    decimals: 1,
    change: "+2.1%",
    changePositive: false,
    history: [
      createHistoryPoint("2026-01-14", 5.2),
      createHistoryPoint("2026-02-10", 5.4),
      createHistoryPoint("2026-02-24", 5.3),
      createHistoryPoint("2026-03-18", 5.3),
      createHistoryPoint("2026-04-16", 5.6),
      createHistoryPoint("2026-05-20", 5.5),
      createHistoryPoint("2026-06-17", 5.7),
      createHistoryPoint("2026-07-03", 5.8),
    ],
  },
  {
    id: "hba1c",
    name: "HbA1c",
    icon: <Droplets size={20} />,
    normalRange: "4.0-5.6",
    referenceType: "between",
    normalMin: 4.0,
    normalMax: 5.6,
    value: 5.4,
    unit: "%",
    decimals: 1,
    change: "-1.2%",
    changePositive: true,
    history: [
      createHistoryPoint("2026-01-14", 5.8),
      createHistoryPoint("2026-02-10", 5.7),
      createHistoryPoint("2026-02-24", 5.7),
      createHistoryPoint("2026-03-18", 5.6),
      createHistoryPoint("2026-04-16", 5.5),
      createHistoryPoint("2026-05-20", 5.6),
      createHistoryPoint("2026-06-17", 5.5),
      createHistoryPoint("2026-07-03", 5.4),
    ],
  },
  {
    id: "hemoglobin",
    name: "Hemoglobīns",
    icon: <Heart size={20} />,
    normalRange: "135-175",
    referenceType: "between",
    normalMin: 135,
    normalMax: 175,
    value: 142,
    unit: "g/L",
    decimals: 0,
    change: "+0.7%",
    changePositive: true,
    history: [
      createHistoryPoint("2026-01-14", 138),
      createHistoryPoint("2026-02-10", 140),
      createHistoryPoint("2026-02-24", 137),
      createHistoryPoint("2026-03-18", 135),
      createHistoryPoint("2026-04-16", 139),
      createHistoryPoint("2026-05-20", 141),
      createHistoryPoint("2026-06-17", 140),
      createHistoryPoint("2026-07-03", 142),
    ],
  },
  {
    id: "ldl",
    name: "ZBL holesterīns",
    icon: <FlaskConical size={20} />,
    normalRange: "<3.0",
    referenceType: "max",
    normalMax: 3.0,
    value: 3.4,
    unit: "mmol/L",
    decimals: 1,
    change: "+3.4%",
    changePositive: false,
    history: [
      createHistoryPoint("2026-01-14", 2.8),
      createHistoryPoint("2026-02-10", 2.9),
      createHistoryPoint("2026-02-24", 3.0),
      createHistoryPoint("2026-03-18", 3.0),
      createHistoryPoint("2026-04-16", 3.1),
      createHistoryPoint("2026-05-20", 3.2),
      createHistoryPoint("2026-06-17", 3.1),
      createHistoryPoint("2026-07-03", 3.4),
    ],
  },
  {
    id: "hdl",
    name: "ABL holesterīns",
    icon: <FlaskConical size={20} />,
    normalRange: ">1.0",
    referenceType: "min",
    normalMin: 1.0,
    value: 1.4,
    unit: "mmol/L",
    decimals: 1,
    change: "+2.1%",
    changePositive: true,
    history: [
      createHistoryPoint("2026-01-14", 1.1),
      createHistoryPoint("2026-02-10", 1.2),
      createHistoryPoint("2026-02-24", 1.2),
      createHistoryPoint("2026-03-18", 1.2),
      createHistoryPoint("2026-04-16", 1.3),
      createHistoryPoint("2026-05-20", 1.3),
      createHistoryPoint("2026-06-17", 1.4),
      createHistoryPoint("2026-07-03", 1.4),
    ],
  },
  {
    id: "triglycerides",
    name: "Triglicerīdi",
    icon: <FlaskConical size={20} />,
    normalRange: "<1.7",
    referenceType: "max",
    normalMax: 1.7,
    value: 1.9,
    unit: "mmol/L",
    decimals: 1,
    change: "+4.8%",
    changePositive: false,
    history: [
      createHistoryPoint("2026-01-14", 1.5),
      createHistoryPoint("2026-02-10", 1.6),
      createHistoryPoint("2026-02-24", 1.7),
      createHistoryPoint("2026-03-18", 1.7),
      createHistoryPoint("2026-04-16", 1.8),
      createHistoryPoint("2026-05-20", 1.7),
      createHistoryPoint("2026-06-17", 1.8),
      createHistoryPoint("2026-07-03", 1.9),
    ],
  },
  {
    id: "total_cholesterol",
    name: "Kopējais holesterīns",
    icon: <FlaskConical size={20} />,
    normalRange: "<5.0",
    referenceType: "max",
    normalMax: 5.0,
    value: 5.4,
    unit: "mmol/L",
    decimals: 1,
    change: "+2.0%",
    changePositive: false,
    history: [
      createHistoryPoint("2026-01-14", 4.9),
      createHistoryPoint("2026-02-10", 5.0),
      createHistoryPoint("2026-02-24", 5.0),
      createHistoryPoint("2026-03-18", 5.1),
      createHistoryPoint("2026-04-16", 5.0),
      createHistoryPoint("2026-05-20", 5.2),
      createHistoryPoint("2026-06-17", 5.1),
      createHistoryPoint("2026-07-03", 5.4),
    ],
  },
];

function formatNumber(value: number, decimals: number) {
  return value
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

function formatResultValue(result: LabResult, value: number) {
  return formatNumber(value, result.decimals);
}

function isValueInRange(
  result: Pick<LabResult, "referenceType" | "normalMin" | "normalMax">,
  value: number,
) {
  if (result.referenceType === "between") {
    return value >= (result.normalMin ?? value) && value <= (result.normalMax ?? value);
  }

  if (result.referenceType === "max") {
    return value <= (result.normalMax ?? value);
  }

  return value >= (result.normalMin ?? value);
}

function getPointStatus(
  value: number,
  result: Pick<LabResult, "referenceType" | "normalMin" | "normalMax">,
): Status {
  if (isValueInRange(result, value)) return "normal";

  if (result.referenceType === "between") {
    const min = result.normalMin ?? value;
    const max = result.normalMax ?? value;
    const rangeDiff = max - min || max || 1;

    if (value < min - rangeDiff * 0.3 || value > max + rangeDiff * 0.3) {
      return "critical";
    }

    return "warning";
  }

  if (result.referenceType === "max") {
    const max = result.normalMax ?? value;
    return value - max > max * 0.3 ? "critical" : "warning";
  }

  const min = result.normalMin ?? value;
  return min - value > min * 0.3 ? "critical" : "warning";
}

function getDeviationScore(result: LabResult) {
  if (isValueInRange(result, result.value)) return 0;

  if (result.referenceType === "between") {
    if (result.value < (result.normalMin ?? result.value)) {
      return ((result.normalMin ?? result.value) - result.value) / (result.normalMin || 1);
    }

    return (result.value - (result.normalMax ?? result.value)) / (result.normalMax || 1);
  }

  if (result.referenceType === "max") {
    return (result.value - (result.normalMax ?? result.value)) / (result.normalMax || 1);
  }

  return ((result.normalMin ?? result.value) - result.value) / (result.normalMin || 1);
}

const statusPriority: Record<Status, number> = {
  critical: 0,
  warning: 1,
  normal: 2,
};

const labResults: LabResult[] = rawLabResults.map((result) => ({
  ...result,
  status: getPointStatus(result.value, result),
}));

function getDetailHistory(
  history: LabHistoryPoint[],
  referenceDate: Date = new Date(),
  visiblePointCount = 6,
) {
  const referenceTimestamp = referenceDate.getTime();
  const sortedHistory = [...history].sort(
    (left, right) => parseHistoryDate(left.date).getTime() - parseHistoryDate(right.date).getTime(),
  );
  const availableHistory = sortedHistory.filter(
    (point) => parseHistoryDate(point.date).getTime() <= referenceTimestamp,
  );

  const clampedHistory = availableHistory.length > 0 ? availableHistory : sortedHistory;

  return clampedHistory.slice(-Math.min(visiblePointCount, clampedHistory.length));
}

function getDisplayHistory(history: LabHistoryPoint[]) {
  if (history.length === 0) return history;

  const shortLabelCounts = history.reduce<Record<string, number>>((counts, point) => {
    const shortLabel = formatShortHistoryDate(point.date);
    counts[shortLabel] = (counts[shortLabel] ?? 0) + 1;
    return counts;
  }, {});

  return history.map((point) => {
    const baseLabel = formatShortHistoryDate(point.date);

    return {
      ...point,
      shortLabel: formatAdaptiveShortHistoryDate(
        point.date,
        (shortLabelCounts[baseLabel] ?? 0) > 1,
      ),
    };
  });
}

function getHistorySummary(history: LabHistoryPoint[]) {
  if (history.length === 0) return "";

  const measurementLabel = history.length === 1 ? "mērījums" : "mērījumi";
  const years = Array.from(
    new Set(history.map((point) => parseHistoryDate(point.date).getUTCFullYear())),
  );

  if (history.length === 1) {
    return `1 ${measurementLabel} • ${years[0]}`;
  }

  if (years.length === 1) {
    return `${history.length} ${measurementLabel} • ${years[0]}`;
  }

  return `${history.length} ${measurementLabel} • ${years[0]}-${years[years.length - 1]}`;
}

function getHistoryDateRangeLabel(history: LabHistoryPoint[]) {
  if (history.length === 0) return "";

  const sortedHistory = [...history].sort(
    (left, right) => parseHistoryDate(left.date).getTime() - parseHistoryDate(right.date).getTime(),
  );
  const firstPoint = sortedHistory[0];
  const lastPoint = sortedHistory[sortedHistory.length - 1];

  if (!firstPoint || !lastPoint) return "";

  if (firstPoint.date === lastPoint.date) {
    return formatFullHistoryDate(firstPoint.date);
  }

  return `${formatFullHistoryDate(firstPoint.date)} - ${formatFullHistoryDate(lastPoint.date)}`;
}

function getSelectedRangeDateLabel(history: LabHistoryPoint[], range: DetailRange) {
  if (range === "all") return getHistoryDateRangeLabel(history);

  const sorted = [...history].sort(
    (left, right) => parseHistoryDate(left.date).getTime() - parseHistoryDate(right.date).getTime(),
  );
  const lastPoint = sorted[sorted.length - 1];

  if (!lastPoint) return "";

  const endDate = parseHistoryDate(lastPoint.date);
  const months = detailRangeOptions.find((option) => option.key === range)?.months ?? 24;
  const startDate = new Date(endDate);
  startDate.setUTCMonth(startDate.getUTCMonth() - months);

  return `${formatFullHistoryDate(startDate.toISOString().slice(0, 10))} - ${formatFullHistoryDate(lastPoint.date)}`;
}

function getDeviationScoreForValue(
  value: number,
  result: Pick<LabResult, "referenceType" | "normalMin" | "normalMax">,
) {
  if (isValueInRange(result, value)) return 0;

  if (result.referenceType === "between") {
    if (value < (result.normalMin ?? value)) {
      return ((result.normalMin ?? value) - value) / (result.normalMin || 1);
    }

    return (value - (result.normalMax ?? value)) / (result.normalMax || 1);
  }

  if (result.referenceType === "max") {
    return (value - (result.normalMax ?? value)) / (result.normalMax || 1);
  }

  return ((result.normalMin ?? value) - value) / (result.normalMin || 1);
}

function getSegmentColor(
  previousValue: number,
  nextValue: number,
  result: Pick<LabResult, "referenceType" | "normalMin" | "normalMax">,
) {
  const previousStatus = getPointStatus(previousValue, result);
  const nextStatus = getPointStatus(nextValue, result);

  if (previousStatus === "critical" || nextStatus === "critical") {
    return statusColors.critical;
  }

  if (previousStatus === "warning" || nextStatus === "warning") {
    return statusColors.warning;
  }

  return statusColors.normal;
}

function getReferenceBounds(result: LabResult) {
  if (result.referenceType === "between") {
    return [result.normalMin ?? result.value, result.normalMax ?? result.value];
  }

  if (result.referenceType === "max") {
    return [result.normalMax ?? result.value];
  }

  return [result.normalMin ?? result.value];
}

function getChartStep(result: LabResult, spread: number, maxValue: number) {
  if (result.decimals === 0) {
    if (maxValue >= 100) return 10;
    if (maxValue >= 20) return 5;
    return 1;
  }

  if (spread <= 1) return 0.1;
  if (spread <= 3) return 0.2;
  return 0.5;
}

function roundDown(value: number, step: number) {
  return Math.floor(value / step) * step;
}

function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function getChartBounds(result: LabResult) {
  const values = result.history.map((item) => item.value);
  const referenceValues = getReferenceBounds(result);
  const baseMin = Math.min(...values, ...referenceValues);
  const baseMax = Math.max(...values, ...referenceValues);
  const spread = Math.max(baseMax - baseMin, result.decimals === 0 ? 2 : 0.4);
  const step = getChartStep(result, spread, baseMax);
  const padding = Math.max(step, spread * 0.18);
  const yMin = Math.max(0, roundDown(baseMin - padding, step));
  const yMax = roundUp(baseMax + padding, step);
  const tickCount = Math.max(4, Math.min(6, Math.round((yMax - yMin) / step) + 1));

  return { yMin, yMax, tickCount };
}

function getReferenceAreaBounds(
  result: LabResult,
  chartBounds: { yMin: number; yMax: number },
) {
  if (result.referenceType === "between") {
    return {
      y1: result.normalMin ?? chartBounds.yMin,
      y2: result.normalMax ?? chartBounds.yMax,
    };
  }

  if (result.referenceType === "max") {
    return {
      y1: chartBounds.yMin,
      y2: result.normalMax ?? chartBounds.yMax,
    };
  }

  return {
    y1: result.normalMin ?? chartBounds.yMin,
    y2: chartBounds.yMax,
  };
}

const MiniSparkline = ({
  data,
  status,
  id,
  compact,
}: {
  data: LabHistoryPoint[];
  status: Status;
  id: string;
  compact?: boolean;
}) => {
  const color = statusColors[status];
  const gradientId = `trend-gradient-${id}`;

  return (
    <div
      className={
        compact
          ? "hidden h-8 w-[124px] shrink-0 md:mr-2 md:block"
          : "hidden h-9 w-[132px] shrink-0 md:mr-2 lg:block"
      }
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 3, right: 1, left: 1, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <Area
            type="linear"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload?: LabHistoryPoint }[];
  label?: string;
  result: LabResult;
}

const CustomTooltip = ({ active, payload, label, result }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const fullDateLabel = payload[0].payload?.fullLabel ?? label;

  return (
    <div className="glass-card-solid rounded-[6px] px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-text-dark">{fullDateLabel}</p>
      <p className="text-heading">
        Vērtība:{" "}
        <span className="font-semibold text-text-dark">
          {formatResultValue(result, payload[0].value)} {result.unit}
        </span>
      </p>
    </div>
  );
};

interface ChartDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload: {
    value: number;
  };
}

type DetailRange = "6m" | "1y" | "2y" | "all";

const detailRangeOptions: Array<{ key: DetailRange; label: string; months?: number }> = [
  { key: "6m", label: "6 mēn.", months: 6 },
  { key: "1y", label: "1 gads", months: 12 },
  { key: "2y", label: "2 gadi", months: 24 },
  { key: "all", label: "Visi" },
];

function getHistoryForRange(history: LabHistoryPoint[], range: DetailRange) {
  const sorted = [...history].sort(
    (left, right) => parseHistoryDate(left.date).getTime() - parseHistoryDate(right.date).getTime(),
  );

  if (range === "all" || sorted.length === 0) return sorted;

  const latest = parseHistoryDate(sorted[sorted.length - 1].date);
  const months = detailRangeOptions.find((option) => option.key === range)?.months ?? 24;
  const cutoff = new Date(latest);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);

  const filtered = sorted.filter((point) => parseHistoryDate(point.date) >= cutoff);
  return filtered.length > 0 ? filtered : sorted.slice(-1);
}

const DetailPanel = ({
  result,
  onClose,
}: {
  result: LabResult;
  onClose: () => void;
}) => {
  const [selectedRange, setSelectedRange] = useState<DetailRange>("2y");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  const detailHistory = useMemo(
    () => getDisplayHistory(getHistoryForRange(result.history, selectedRange)),
    [result.history, selectedRange],
  );

  const latestDetailPoint = detailHistory[detailHistory.length - 1];
  const previousDetailPoint = detailHistory[detailHistory.length - 2];
  const detailValue = latestDetailPoint?.value ?? result.value;
  const detailStatus = getPointStatus(detailValue, result);
  const detailResult: LabResult = {
    ...result,
    value: detailValue,
    status: detailStatus,
    history: detailHistory,
  };
  const detailChange =
    previousDetailPoint && previousDetailPoint.value !== 0
      ? ((detailValue - previousDetailPoint.value) / Math.abs(previousDetailPoint.value)) * 100
      : null;
  const detailChangePositive =
    previousDetailPoint !== undefined
      ? getDeviationScoreForValue(detailValue, result) <=
        getDeviationScoreForValue(previousDetailPoint.value, result)
      : result.changePositive;
  const detailChangeLabel =
    detailChange === null
      ? result.change
      : `${detailChange >= 0 ? "+" : ""}${formatNumber(detailChange, 1)}%`;
  const detailDisplayValue =
    detailValue === result.value
      ? (result.displayValue ?? formatResultValue(result, detailValue))
      : formatResultValue(result, detailValue);
  const statusLabel =
    detailStatus === "normal"
      ? "Norma"
      : detailStatus === "warning"
        ? "Ārpus normas"
        : "Kritisks";
  const detailDateRangeLabel = getSelectedRangeDateLabel(result.history, selectedRange);
  const chartBounds = getChartBounds(detailResult);
  const referenceArea = getReferenceAreaBounds(detailResult, chartBounds);
  const detailChartData = detailHistory.map((point, pointIndex) => ({
    ...point,
    ...Object.fromEntries(
      detailHistory.map((_, segmentIndex) => {
        if (
          segmentIndex > 0 &&
          (segmentIndex - 1 === pointIndex || segmentIndex === pointIndex)
        ) {
          return [`seg${segmentIndex}`, point.value];
        }

        return [`seg${segmentIndex}`, undefined];
      }),
    ),
  }));

  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-result-detail-title"
        className="mx-auto max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
      >
        <header className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`mt-1 h-10 w-1 shrink-0 rounded-full ${statusDotClass[detailResult.status]}`} aria-hidden="true" />
            <div className="min-w-0">
              <h3 id="lab-result-detail-title" className="text-2xl font-semibold tracking-[-0.035em] text-text-dark">
                {result.name}
              </h3>
              <p className="mt-1 text-sm leading-5 text-heading">
                Norma: {result.normalRange} {result.unit}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,18%,42%)] transition-colors hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
            aria-label="Aizvērt"
          >
            <X size={25} strokeWidth={1.8} />
          </button>
        </header>

        <div className="grid border-b border-[hsl(214,22%,90%)] sm:grid-cols-3">
          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Pašreizējā vērtība
            </p>
            <p className="mt-1.5 flex flex-wrap items-end gap-1.5 text-3xl font-semibold leading-tight tracking-[-0.07em] text-text-dark">
              <span>{detailDisplayValue}</span>
              <span className="mb-1 text-sm font-normal tracking-normal text-heading">
                {result.unit}
              </span>
            </p>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Izmaiņas
            </p>
            <p
              className={`mt-2 flex items-center gap-1.5 text-xl font-semibold leading-tight tracking-[-0.04em] ${
                detailChangePositive ? "text-status-normal" : "text-status-warning"
              }`}
            >
              {detailChangePositive ? (
                <TrendingDown size={23} strokeWidth={2.1} />
              ) : (
                <TrendingUp size={23} strokeWidth={2.1} />
              )}
              {detailChangeLabel}
            </p>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Statuss
            </p>
            <p
              className={`mt-2 text-xl font-semibold leading-tight tracking-[-0.04em] ${statusTextClass[detailResult.status]}`}
            >
              {statusLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h4 className="text-sm font-semibold text-text-dark">
            Rezultātu dinamika{detailDateRangeLabel ? ` (${detailDateRangeLabel})` : ""}
          </h4>

          <div className="grid grid-cols-4 rounded-[8px] bg-[hsl(210,24%,96%)] p-1" role="group" aria-label="Laika periods">
            {detailRangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedRange(option.key)}
                aria-pressed={selectedRange === option.key}
                className={`min-w-[60px] rounded-[6px] px-2 py-1.5 text-xs font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(216,82%,55%)] focus-visible:ring-offset-1 sm:min-w-[72px] ${
                  selectedRange === option.key
                    ? "bg-white text-text-dark shadow-sm"
                    : "text-heading hover:text-text-dark"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <p className="mb-1 text-xs text-heading">{result.unit}</p>
          <div className="h-[230px] sm:h-[275px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={detailChartData}
                margin={{ top: 20, right: 18, bottom: 10, left: 0 }}
              >
                <defs>
                  <linearGradient id="normalRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="shortLabel"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={42}
                  height={42}
                  tickMargin={12}
                  tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }}
                  tickFormatter={(value: number) => formatNumber(value, result.decimals)}
                  domain={[chartBounds.yMin, chartBounds.yMax]}
                  tickCount={chartBounds.tickCount}
                  width={52}
                />

                <ReferenceArea
                  y1={referenceArea.y1}
                  y2={referenceArea.y2}
                  fill="url(#normalRangeGrad)"
                  stroke="hsl(152, 60%, 45%)"
                  strokeOpacity={0.18}
                  strokeDasharray="4 4"
                />

                <Tooltip content={<CustomTooltip result={result} />} />

                {detailHistory.map((_, segmentIndex) => {
                  if (segmentIndex === 0) return null;

                  const segmentColor = getSegmentColor(
                    detailHistory[segmentIndex - 1].value,
                    detailHistory[segmentIndex].value,
                    result,
                  );

                  return (
                    <Line
                      key={`seg${segmentIndex}`}
                      type="linear"
                      dataKey={`seg${segmentIndex}`}
                      stroke={segmentColor}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                  );
                })}

                <Line
                  type="linear"
                  dataKey="value"
                  stroke="transparent"
                  strokeWidth={0}
                  isAnimationActive={false}
                  dot={(props: ChartDotProps) => {
                    const pointStatus = getPointStatus(props.payload.value, result);
                    const isLatest = props.index === detailHistory.length - 1;

                    return (
                      <g key={props.index}>
                        {isLatest ? (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={10}
                            fill="white"
                            stroke={statusColors[pointStatus]}
                            strokeOpacity={0.25}
                            strokeWidth={5}
                          />
                        ) : null}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={5.5}
                          fill={statusColors[pointStatus]}
                          stroke="white"
                          strokeWidth={2}
                        />
                      </g>
                    );
                  }}
                  activeDot={{ r: 7, strokeWidth: 3, stroke: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </CenteredOverlay>
  );
};

function TrendsList({
  results,
  expandedId,
  onToggleExpanded,
  onOpenAll,
  remainingCount = 0,
  compact,
}: {
  results: LabResult[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onOpenAll?: () => void;
  remainingCount?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "clinical-list"
          : "divide-y divide-[hsl(214,22%,90%)] bg-white"
      }
    >
      {results.map((result) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onToggleExpanded(result.id)}
          className={`grid w-full cursor-pointer items-center gap-x-4 gap-y-1 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)] md:gap-x-5 md:grid-cols-[4px_minmax(120px,1fr)_124px_minmax(116px,auto)_auto] ${
            compact
              ? "px-4 py-3"
              : "px-4 py-3.5"
          } ${
            expandedId === result.id
              ? "bg-[hsl(214,20%,98%)]"
              : "bg-white hover:bg-[hsl(214,20%,99%)]"
          }`}
        >
          <div
            className={`h-9 w-1 rounded-full ${statusDotClass[result.status]}`}
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="whitespace-normal break-words text-xs font-semibold text-text-dark">
              {result.name}
            </p>
            <p className="mt-0.5 whitespace-normal break-words text-xs leading-4 text-heading">
              {statusLabel[result.status]} · norma {result.normalRange} {result.unit}
            </p>
          </div>

          <MiniSparkline
            data={result.history}
            status={result.status}
            id={result.id}
            compact={compact}
          />

          <div className="min-w-[70px] text-left md:pl-2 md:text-right">
            <div
              className={`flex items-baseline gap-1 whitespace-nowrap font-semibold text-text-dark md:justify-end ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              <span>{result.displayValue ?? formatResultValue(result, result.value)}</span>
              <span
                className={`font-normal text-heading ${
                  compact ? "text-sm" : "text-sm"
                }`}
              >
                {result.unit}
              </span>
              <span
                className={`ml-1 inline-flex items-center gap-0.5 font-semibold ${
                  compact ? "text-xs" : "text-sm"
                } ${result.changePositive ? "text-status-normal" : "text-status-warning"}`}
              >
                {result.changePositive ? <TrendingDown size={compact ? 12 : 14} /> : <TrendingUp size={compact ? 12 : 14} />}
                {result.change}
              </span>
            </div>
          </div>

          <svg
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            className="ml-1 text-heading"
          >
            <path
              d="M1 1L7 7L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
      {onOpenAll && remainingCount > 0 ? (
        <DashboardListFooter
          label={`Vēl ${remainingCount} rādītāji`}
          onClick={onOpenAll}
          ariaLabel={`Skatīt vēl ${remainingCount} laboratorijas rādītājus`}
        />
      ) : null}
    </div>
  );
}

function HealthTrendsContent({
  results,
  expandedId,
  onToggleExpanded,
  onOpenAll,
  remainingCount,
  showHeader = true,
  compact,
  updatedAt,
}: {
  results: LabResult[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onOpenAll?: () => void;
  remainingCount?: number;
  showHeader?: boolean;
  compact?: boolean;
  updatedAt: string;
}) {
  return (
    <div
      className={
        compact
          ? "clinical-panel flex h-full w-full flex-col"
          : "flex flex-col"
      }
    >
      {showHeader ? (
        <DashboardCardHeader
          title="Klīniskie rādītāji"
          infoLabel="Informācija par klīniskajiem rādītājiem"
          infoDescription="Laboratorijas rezultātu pārskats un izmaiņas laikā"
        />
      ) : null}

      <div
        className={
          compact
            ? "mt-3 flex-1 overflow-y-auto pr-1"
            : "min-h-0 flex-1 overflow-hidden"
        }
      >
        <TrendsList
          results={results}
          expandedId={expandedId}
          onToggleExpanded={onToggleExpanded}
          onOpenAll={onOpenAll}
          remainingCount={remainingCount}
          compact={compact}
        />
      </div>
    </div>
  );
}

const HealthTrends = ({ updatedAt }: { updatedAt: string }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedFullId, setExpandedFullId] = useState<string | null>(null);
  const [isAllLabsOpen, setIsAllLabsOpen] = useState(false);

  const sortedResults = useMemo(() => {
    return [...labResults].sort((left, right) => {
      const statusDiff = statusPriority[left.status] - statusPriority[right.status];

      if (statusDiff !== 0) return statusDiff;

      return getDeviationScore(right) - getDeviationScore(left);
    });
  }, []);

  const expandedResult = sortedResults.find((result) => result.id === expandedId);
  const expandedFullResult = sortedResults.find((result) => result.id === expandedFullId);
  const visibleResults = sortedResults.slice(0, defaultVisibleLabCount);
  const remainingResults = sortedResults.slice(defaultVisibleLabCount);

  return (
    <>
      {expandedResult && (
        <DetailPanel result={expandedResult} onClose={() => setExpandedId(null)} />
      )}

      {expandedFullResult && (
        <DetailPanel result={expandedFullResult} onClose={() => setExpandedFullId(null)} />
      )}

      <HealthTrendsContent
        results={visibleResults}
        expandedId={expandedId}
        onToggleExpanded={(id) => setExpandedId(expandedId === id ? null : id)}
        onOpenAll={() => setIsAllLabsOpen(true)}
        remainingCount={remainingResults.length}
        compact
        updatedAt={updatedAt}
      />

      {isAllLabsOpen ? (
        <CenteredOverlay
          onClose={() => setIsAllLabsOpen(false)}
          overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm"
          contentClassName="max-w-4xl"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Klīniskie rādītāji"
            className="mx-auto w-full overflow-hidden rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]"
          >
            <div className="border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6">
              <DashboardCardHeader
                title="Klīniskie rādītāji"
                infoLabel="Informācija par klīniskajiem rādītājiem"
                infoDescription="Laboratorijas rezultātu pārskats un izmaiņas laikā"
              >
                <button
                  type="button"
                  onClick={() => setIsAllLabsOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,14%,42%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
                  aria-label="Aizvērt laboratorijas rādītājus"
                >
                  <X size={18} />
                </button>
              </DashboardCardHeader>
            </div>
            <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
              <HealthTrendsContent
                results={sortedResults}
                expandedId={expandedFullId}
                onToggleExpanded={(id) =>
                  setExpandedFullId((current) => (current === id ? null : id))
                }
                showHeader={false}
                updatedAt={updatedAt}
              />
            </div>
          </section>
        </CenteredOverlay>
      ) : null}

    </>
  );
};

export default HealthTrends;
