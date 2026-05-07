import { useMemo, useState, type ReactNode } from "react";
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
  month: string;
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

const visibleLabCount = 3;

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

const statusIconBg: Record<Status, string> = {
  normal: "bg-[hsl(152,34%,94%)]",
  warning: "bg-[hsl(40,56%,94%)]",
  critical: "bg-[hsl(0,56%,96%)]",
};

const sectionIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

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
      { month: "Jan", value: 118 },
      { month: "Feb", value: 115 },
      { month: "Mar", value: 120 },
      { month: "Apr", value: 122 },
      { month: "Mai", value: 119 },
      { month: "Jūn", value: 121 },
      { month: "Jūl", value: 123 },
      { month: "Aug", value: 135 },
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
      { month: "Jan", value: 5.2 },
      { month: "Feb", value: 5.4 },
      { month: "Mar", value: 5.3 },
      { month: "Apr", value: 5.6 },
      { month: "Mai", value: 5.5 },
      { month: "Jūn", value: 5.7 },
      { month: "Jūl", value: 5.6 },
      { month: "Aug", value: 5.8 },
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
      { month: "Jan", value: 5.8 },
      { month: "Feb", value: 5.7 },
      { month: "Mar", value: 5.6 },
      { month: "Apr", value: 5.5 },
      { month: "Mai", value: 5.6 },
      { month: "Jūn", value: 5.5 },
      { month: "Jūl", value: 5.4 },
      { month: "Aug", value: 5.4 },
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
      { month: "Jan", value: 138 },
      { month: "Feb", value: 140 },
      { month: "Mar", value: 135 },
      { month: "Apr", value: 139 },
      { month: "Mai", value: 141 },
      { month: "Jūn", value: 140 },
      { month: "Jūl", value: 143 },
      { month: "Aug", value: 142 },
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
      { month: "Jan", value: 2.8 },
      { month: "Feb", value: 2.9 },
      { month: "Mar", value: 3.0 },
      { month: "Apr", value: 3.1 },
      { month: "Mai", value: 3.2 },
      { month: "Jūn", value: 3.1 },
      { month: "Jūl", value: 3.3 },
      { month: "Aug", value: 3.4 },
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
      { month: "Jan", value: 1.1 },
      { month: "Feb", value: 1.2 },
      { month: "Mar", value: 1.2 },
      { month: "Apr", value: 1.3 },
      { month: "Mai", value: 1.3 },
      { month: "Jūn", value: 1.4 },
      { month: "Jūl", value: 1.4 },
      { month: "Aug", value: 1.4 },
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
      { month: "Jan", value: 1.5 },
      { month: "Feb", value: 1.6 },
      { month: "Mar", value: 1.7 },
      { month: "Apr", value: 1.8 },
      { month: "Mai", value: 1.7 },
      { month: "Jūn", value: 1.8 },
      { month: "Jūl", value: 1.8 },
      { month: "Aug", value: 1.9 },
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
      { month: "Jan", value: 4.9 },
      { month: "Feb", value: 5.0 },
      { month: "Mar", value: 5.1 },
      { month: "Apr", value: 5.0 },
      { month: "Mai", value: 5.2 },
      { month: "Jūn", value: 5.1 },
      { month: "Jūl", value: 5.3 },
      { month: "Aug", value: 5.4 },
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
  compact,
}: {
  data: LabHistoryPoint[];
  status: Status;
  compact?: boolean;
}) => {
  const color = statusColors[status];

  return (
    <div className={compact ? "mx-auto h-9 w-[96px]" : "mx-auto h-11 w-[118px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${status})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  result: LabResult;
}

const CustomTooltip = ({ active, payload, label, result }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card-solid rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-text-dark">{label}</p>
      <p className="text-heading">
        vērtība:{" "}
        <span className="font-bold text-text-dark">
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

const DetailPanel = ({
  result,
  onClose,
}: {
  result: LabResult;
  onClose: () => void;
}) => {
  const statusLabel =
    result.status === "normal"
      ? "Norma"
      : result.status === "warning"
        ? "Ārpus normas"
        : "Kritisks";

  const chartBounds = getChartBounds(result);
  const referenceArea = getReferenceAreaBounds(result, chartBounds);
  const detailChartData = result.history.map((point, pointIndex) => ({
    ...point,
    ...Object.fromEntries(
      result.history.map((_, segmentIndex) => {
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
      overlayClassName="bg-[hsl(210,40%,20%/0.3)] backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-xl animate-in rounded-[14px] border border-[hsl(210,20%,92%)] bg-white p-6 shadow-xl zoom-in-95 fade-in duration-200">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${statusIconBg[result.status]} ${statusTextClass[result.status]}`}
            >
              {result.icon}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-dark">{result.name}</h3>
              <p className="text-sm text-heading">
                Normas robežas: {result.normalRange} {result.unit}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-muted text-heading transition-colors hover:text-text-dark"
            aria-label="Aizvērt"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-6 flex gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-heading">
              Pašreizējā vērtība
            </p>
            <p className="text-3xl font-bold text-text-dark">
              {result.displayValue ?? formatResultValue(result, result.value)}{" "}
              <span className="text-sm font-normal text-heading">{result.unit}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-heading">
              Izmaiņas
            </p>
            <p
              className={`flex items-center gap-1 text-lg font-bold ${
                result.changePositive ? "text-status-normal" : "text-status-warning"
              }`}
            >
              {result.changePositive ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
              {result.change}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-heading">
              Statuss
            </p>
            <p className={`text-lg font-bold ${statusTextClass[result.status]}`}>
              {statusLabel}
            </p>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-heading">
          Vēsture (pēdējie 8 mēneši)
        </p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={detailChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="normalRangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }}
                tickFormatter={(value: number) => formatNumber(value, result.decimals)}
                domain={[chartBounds.yMin, chartBounds.yMax]}
                tickCount={chartBounds.tickCount}
                width={40}
              />

              <ReferenceArea
                y1={referenceArea.y1}
                y2={referenceArea.y2}
                fill="url(#normalRangeGrad)"
                stroke="hsl(152, 60%, 45%)"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />

              <Tooltip content={<CustomTooltip result={result} />} />

              {result.history.map((_, segmentIndex) => {
                if (segmentIndex === 0) return null;

                const segmentColor = getSegmentColor(
                  result.history[segmentIndex - 1].value,
                  result.history[segmentIndex].value,
                  result,
                );

                return (
                  <Line
                    key={`seg${segmentIndex}`}
                    type="monotone"
                    dataKey={`seg${segmentIndex}`}
                    stroke={segmentColor}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                  />
                );
              })}

              <Line
                type="monotone"
                dataKey="value"
                stroke="transparent"
                strokeWidth={0}
                dot={(props: ChartDotProps) => {
                  const pointStatus = getPointStatus(props.payload.value, result);

                  return (
                    <circle
                      key={props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill={statusColors[pointStatus]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex gap-2">
          {result.history.map((point) => (
            <div
              key={point.month}
              className="glass-card-solid flex-1 rounded-[10px] px-1 py-2 text-center"
            >
              <p className="text-xs font-medium text-heading">{point.month}</p>
              <p className="text-sm font-bold text-text-dark">
                {formatResultValue(result, point.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CenteredOverlay>
  );
};

function TrendsList({
  results,
  expandedId,
  onToggleExpanded,
  compact,
}: {
  results: LabResult[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onToggleExpanded(result.id)}
          className={`grid w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left transition-all duration-200 md:grid-cols-[auto_minmax(0,1fr)_110px_82px_auto] ${
            compact ? "py-2" : "py-3"
          } ${
            expandedId === result.id
              ? "glass-card-solid ring-2 ring-primary/30"
              : "glass-card-solid hover:shadow-md"
          }`}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-[10px] ${statusIconBg[result.status]} ${statusTextClass[result.status]} ${
              compact ? "h-8 w-8" : "h-9 w-9"
            }`}
          >
            {result.icon}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-text-dark">
              {result.name}
            </p>
            <p className="truncate text-[10px] text-heading">
              Norma: {result.normalRange} {result.unit}
            </p>
          </div>

          <div className={compact ? "hidden justify-center md:flex" : "flex justify-center"}>
            <MiniSparkline data={result.history} status={result.status} compact={compact} />
          </div>

          <div className="min-w-[72px] text-left md:text-right">
            <p
              className={`font-bold leading-none text-text-dark ${
                compact ? "text-[1.12rem]" : "text-[1.35rem]"
              }`}
            >
              {result.displayValue ?? formatResultValue(result, result.value)}{" "}
              <span className="text-[10px] font-normal text-heading">{result.unit}</span>
            </p>

            <p
              className={`mt-1 flex items-center gap-0.5 text-[10px] font-medium md:justify-end ${
                result.changePositive ? "text-status-normal" : "text-status-warning"
              }`}
            >
              {result.changePositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {result.change}
            </p>
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
    </div>
  );
}

function HealthTrendsContent({
  results,
  expandedId,
  onToggleExpanded,
  onOpenAll,
  showOpenAll,
  compact,
}: {
  results: LabResult[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onOpenAll?: () => void;
  showOpenAll?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex h-full w-full flex-col overflow-hidden rounded-[12px] border border-[rgba(220,228,236,0.96)] bg-white p-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]"
          : "flex flex-col"
      }
    >
      <div className={compact ? "mb-4 flex shrink-0 items-center gap-3" : "mb-6 flex items-center gap-3"}>
        <div className={sectionIconClass}>
          <TrendingUp size={18} className="text-current" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
            Klīniskie rādītāji
          </p>
          <p className="truncate text-xs text-heading">
            Laboratorijas rezultātu pārskats un izmaiņas laikā
          </p>
        </div>
      </div>

      <div
        className={
          compact
            ? "mb-2 flex shrink-0 items-center justify-between gap-3"
            : "mb-2 flex items-center justify-between gap-3"
        }
      >
        <div className="ml-2 flex min-w-0 gap-2.5 text-[9px] font-medium uppercase tracking-wider text-heading">
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.normal}`} />
            <span>Norma</span>
          </span>

          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.warning}`} />
            <span>Ārpus normas</span>
          </span>

          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.critical}`} />
            <span>Kritisks</span>
          </span>
        </div>

        <p className="mr-2 hidden shrink-0 text-[9px] italic text-heading md:block">
          Noklikšķiniet, lai skatītu sīkāk
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <TrendsList
          results={results}
          expandedId={expandedId}
          onToggleExpanded={onToggleExpanded}
          compact={compact}
        />
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between gap-4 border-t border-[hsl(214,22%,88%)] pt-3">
        <p className="text-xs text-[hsl(214,18%,62%)]">Atjaunināts: 04.08.2025.</p>

        {showOpenAll && onOpenAll && labResults.length > visibleLabCount && (
          <button
            type="button"
            onClick={onOpenAll}
            className="inline-flex items-center text-xs font-semibold text-[hsl(220,36%,18%)] transition hover:opacity-70"
          >
            Skatīt visus rādītājus →
          </button>
        )}
      </div>
    </div>
  );
}

const HealthTrends = () => {
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

  return (
    <>
      {expandedResult && (
        <DetailPanel result={expandedResult} onClose={() => setExpandedId(null)} />
      )}

      {expandedFullResult && (
        <DetailPanel result={expandedFullResult} onClose={() => setExpandedFullId(null)} />
      )}

      <HealthTrendsContent
        results={sortedResults.slice(0, visibleLabCount)}
        expandedId={expandedId}
        onToggleExpanded={(id) => setExpandedId(expandedId === id ? null : id)}
        onOpenAll={() => setIsAllLabsOpen(true)}
        showOpenAll
        compact
      />

      {isAllLabsOpen && (
        <CenteredOverlay
          onClose={() => setIsAllLabsOpen(false)}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-3xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[14px] border border-[hsl(210,20%,90%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <button
              type="button"
              onClick={() => setIsAllLabsOpen(false)}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
              aria-label="Aizvērt"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[84vh] overflow-y-auto px-6 py-6 md:px-8">
              <HealthTrendsContent
                results={sortedResults}
                expandedId={expandedFullId}
                onToggleExpanded={(id) =>
                  setExpandedFullId(expandedFullId === id ? null : id)
                }
              />
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default HealthTrends;
