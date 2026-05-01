import { useState } from "react";
import {
  Activity,
  Droplets,
  FlaskConical,
  Heart,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Area,
  AreaChart,
} from "recharts";

type Status = "normal" | "warning" | "critical";

interface LabResult {
  id: string;
  name: string;
  icon: React.ReactNode;
  normalRange: string;
  normalMin: number;
  normalMax: number;
  value: number;
  unit: string;
  change: string;
  changePositive: boolean;
  status: Status;
  history: { month: string; value: number }[];
}

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
  "flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(210,219,228,0.96)] bg-[hsl(214,22%,97%)] text-[hsl(220,36%,18%)]";
const labResults: LabResult[] = [
  {
    id: "bp",
    name: "Asinsspiediens",
    icon: <Activity size={20} />,
    normalRange: "90-120 / 60-80",
    normalMin: 90,
    normalMax: 120,
    value: 135,
    unit: "mmHg",
    change: "+0.8%",
    changePositive: false,
    status: "warning",
    history: [
      { month: "Jan", value: 118 },
      { month: "Feb", value: 115 },
      { month: "Mar", value: 120 },
      { month: "Apr", value: 122 },
      { month: "Mai", value: 119 },
      { month: "Jun", value: 121 },
      { month: "Jul", value: 123 },
      { month: "Aug", value: 135 },
    ],
  },
  {
    id: "glucose",
    name: "Glikoze",
    icon: <Droplets size={20} />,
    normalRange: "70-100",
    normalMin: 70,
    normalMax: 100,
    value: 95,
    unit: "mg/dL",
    change: "-2.1%",
    changePositive: true,
    status: "normal",
    history: [
      { month: "Jan", value: 110 },
      { month: "Feb", value: 105 },
      { month: "Mar", value: 108 },
      { month: "Apr", value: 100 },
      { month: "Mai", value: 98 },
      { month: "Jun", value: 102 },
      { month: "Jul", value: 97 },
      { month: "Aug", value: 95 },
    ],
  },
  {
    id: "cholesterol",
    name: "Holesterīns",
    icon: <FlaskConical size={20} />,
    normalRange: "<200",
    normalMin: 0,
    normalMax: 200,
    value: 192,
    unit: "mg/dL",
    change: "+1.1%",
    changePositive: false,
    status: "normal",
    history: [
      { month: "Jan", value: 210 },
      { month: "Feb", value: 205 },
      { month: "Mar", value: 200 },
      { month: "Apr", value: 198 },
      { month: "Mai", value: 195 },
      { month: "Jun", value: 197 },
      { month: "Jul", value: 194 },
      { month: "Aug", value: 192 },
    ],
  },
  {
    id: "hemoglobin",
    name: "Hemoglobīns",
    icon: <Heart size={20} />,
    normalRange: "13.5-17.5",
    normalMin: 13.5,
    normalMax: 17.5,
    value: 14.2,
    unit: "g/dL",
    change: "+0.7%",
    changePositive: true,
    status: "normal",
    history: [
      { month: "Jan", value: 13.8 },
      { month: "Feb", value: 14.0 },
      { month: "Mar", value: 13.5 },
      { month: "Apr", value: 13.9 },
      { month: "Mai", value: 14.1 },
      { month: "Jun", value: 14.0 },
      { month: "Jul", value: 14.3 },
      { month: "Aug", value: 14.2 },
    ],
  },
];

function getPointStatus(value: number, min: number, max: number): Status {
  if (value >= min && value <= max) return "normal";
  const rangeDiff = max - min;
  if (value < min - rangeDiff * 0.3 || value > max + rangeDiff * 0.3) return "critical";
  return "warning";
}

function getSegmentColor(v1: number, v2: number, min: number, max: number): string {
  const s1 = getPointStatus(v1, min, max);
  const s2 = getPointStatus(v2, min, max);
  if (s1 === "critical" || s2 === "critical") return statusColors.critical;
  if (s1 === "warning" || s2 === "warning") return statusColors.warning;
  return statusColors.normal;
}

const MiniSparkline = ({
  data,
  status,
}: {
  data: { month: string; value: number }[];
  status: Status;
}) => {
  const color = statusColors[status];

  return (
    <div className="mx-auto h-11 w-[118px]">
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
  unit: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-solid rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold text-text-dark">{label}</p>
        <p className="text-heading">
          vērtība:{" "}
          <span className="font-bold text-text-dark">
            {payload[0].value} {unit}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

interface ChartDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload: {
    value: number;
  };
}

const DetailPanel = ({ result, onClose }: { result: LabResult; onClose: () => void }) => {
  const statusLabel =
    result.status === "normal"
      ? "Norma"
      : result.status === "warning"
        ? "Ārpus normas"
        : "Kritisks";

  const allValues = result.history.map((h) => h.value);
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const yMin = Math.min(dataMin, result.normalMin) * 0.95;
  const yMax = Math.max(dataMax, result.normalMax) * 1.05;

  return (
    <CenteredOverlay onClose={onClose} overlayClassName="bg-[hsl(210,40%,20%/0.3)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[16px] border border-[hsl(210,20%,92%)] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${statusIconBg[result.status]} ${statusTextClass[result.status]}`}
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
            className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-muted text-heading transition-colors hover:text-text-dark"
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
              {result.id === "bp" ? "135/94" : result.value}{" "}
              <span className="text-sm font-normal text-heading">{result.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-heading">
              Izmaiņas
            </p>
            <p
              className={`flex items-center gap-1 text-lg font-bold ${result.changePositive ? "text-status-normal" : "text-status-warning"
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
            <p className={`text-lg font-bold ${statusTextClass[result.status]}`}>{statusLabel}</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-heading">
          Vēsture (pēdējie 8 mēneši)
        </p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={result.history.map((h, i) => ({
                ...h,
                ...Object.fromEntries(
                  result.history.map((_, j) => {
                    if (j > 0 && (j - 1 === i || j === i)) return [`seg${j}`, h.value];
                    return [`seg${j}`, undefined];
                  }),
                ),
              }))}
              margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
            >
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
                domain={[yMin, yMax]}
              />
              <ReferenceArea
                y1={result.normalMin}
                y2={result.normalMax}
                fill="url(#normalRangeGrad)"
                stroke="hsl(152, 60%, 45%)"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />
              <Tooltip content={<CustomTooltip unit={result.unit} />} />
              {result.history.map((_, segIdx) => {
                if (segIdx === 0) return null;
                const segColor = getSegmentColor(
                  result.history[segIdx - 1].value,
                  result.history[segIdx].value,
                  result.normalMin,
                  result.normalMax,
                );
                return (
                  <Line
                    key={`seg${segIdx}`}
                    type="monotone"
                    dataKey={`seg${segIdx}`}
                    stroke={segColor}
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
                  const pointStatus = getPointStatus(
                    props.payload.value,
                    result.normalMin,
                    result.normalMax,
                  );
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
          {result.history.map((h) => (
            <div
              key={h.month}
              className="glass-card-solid flex-1 rounded-[12px] px-1 py-2 text-center"
            >
              <p className="text-xs font-medium text-heading">{h.month}</p>
              <p className="text-sm font-bold text-text-dark">{h.value}</p>
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
}: {
  results: LabResult[];
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onToggleExpanded(result.id)}
          className={`grid w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-all duration-200 md:grid-cols-[auto_minmax(0,1fr)_132px_88px_auto] ${expandedId === result.id
            ? "glass-card-solid ring-2 ring-primary/30"
            : "glass-card-solid hover:shadow-md"
            }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${statusIconBg[result.status]} ${statusTextClass[result.status]}`}
          >
            {result.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-text-dark">{result.name}</p>
            </div>
            <p className="text-[10px] text-heading">Norma: {result.normalRange}</p>
          </div>

          <div className="flex justify-center md:justify-center">
            <MiniSparkline data={result.history} status={result.status} />
          </div>

          <div className="min-w-[72px] text-left md:text-right">
            <p className="text-[1.35rem] font-bold leading-none text-text-dark">
              {result.id === "bp" ? "135/94" : result.value}{" "}
              <span className="text-[10px] font-normal text-heading">{result.unit}</span>
            </p>
            <p
              className={`mt-1 flex items-center gap-0.5 text-[10px] font-medium md:justify-end ${result.changePositive ? "text-status-normal" : "text-status-warning"
                }`}
            >
              {result.changePositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {result.change}
            </p>
          </div>

          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="ml-1 text-heading">
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
          ? "flex h-full flex-col overflow-hidden rounded-[16px] border border-[rgba(220,228,236,0.96)] bg-white p-6 shadow-[0_8px_18px_rgba(29,53,87,0.05)]"
          : "flex flex-col"
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <div className={sectionIconClass}>
          <TrendingUp size={18} className="text-current" />
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
            Klīniskie rādītāji
          </p>
          <p className="text-xs text-heading">
            Laboratorijas rezultātu pārskats un izmaiņas laikā
          </p>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <div className="ml-2 flex gap-2.5 text-[9px] font-medium uppercase tracking-wider text-heading">
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.normal}`} />
            <span className="text-heading">Norma</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.warning}`} />
            <span className="text-heading">Ārpus normas</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${statusDotClass.critical}`} />
            <span className="text-heading">Kritisks</span>
          </span>
        </div>
        <p className="mr-2 text-[9px] italic text-heading">
          Noklikšķiniet, lai skatītu sīkāk
        </p>
      </div>

      <TrendsList
        results={results}
        expandedId={expandedId}
        onToggleExpanded={onToggleExpanded}
      />

      <div className="mt-auto flex items-center justify-between gap-4 pt-3">
        <p className="text-xs text-[hsl(214,18%,62%)]">Atjaunināts: 04.08.2025.</p>
        {showOpenAll && onOpenAll && labResults.length > 3 && (
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

  const expandedResult = labResults.find((r) => r.id === expandedId);
  const expandedFullResult = labResults.find((r) => r.id === expandedFullId);

  return (
    <>
      {expandedResult && (
        <DetailPanel result={expandedResult} onClose={() => setExpandedId(null)} />
      )}

      {expandedFullResult && (
        <DetailPanel result={expandedFullResult} onClose={() => setExpandedFullId(null)} />
      )}

      <HealthTrendsContent
        results={labResults.slice(0, 3)}
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
          <div className="relative mx-auto w-full overflow-hidden rounded-[16px] border border-[hsl(210,20%,90%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <button
              type="button"
              onClick={() => setIsAllLabsOpen(false)}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
              aria-label="Aizvert"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[84vh] overflow-y-auto px-6 py-6 md:px-8">
              <HealthTrendsContent
                results={labResults}
                expandedId={expandedFullId}
                onToggleExpanded={(id) => setExpandedFullId(expandedFullId === id ? null : id)}
              />
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default HealthTrends;
