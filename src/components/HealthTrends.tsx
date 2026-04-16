import { useState } from "react";
import { Activity, Droplets, FlaskConical, Heart, TrendingUp, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  iconBgClass: string;
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

const labResults: LabResult[] = [
  {
    id: "bp",
    name: "Asinsspiediens",
    icon: <Activity size={20} />,
    normalRange: "90–120 / 60–80",
    normalMin: 90,
    normalMax: 120,
    value: 124,
    unit: "mmHg",
    change: "+0.8%",
    changePositive: false,
    status: "warning",
    iconBgClass: "bg-[hsl(var(--icon-bg-red))]",
    history: [
      { month: "Jan", value: 118 },
      { month: "Feb", value: 115 },
      { month: "Mar", value: 120 },
      { month: "Apr", value: 122 },
      { month: "Mai", value: 119 },
      { month: "Jūn", value: 121 },
      { month: "Jūl", value: 123 },
      { month: "Aug", value: 124 },
    ],
  },
  {
    id: "glucose",
    name: "Glikoze",
    icon: <Droplets size={20} />,
    normalRange: "70–100",
    normalMin: 70,
    normalMax: 100,
    value: 95,
    unit: "mg/dL",
    change: "-2.1%",
    changePositive: true,
    status: "normal",
    iconBgClass: "bg-[hsl(var(--icon-bg-blue))]",
    history: [
      { month: "Jan", value: 110 },
      { month: "Feb", value: 105 },
      { month: "Mar", value: 108 },
      { month: "Apr", value: 100 },
      { month: "Mai", value: 98 },
      { month: "Jūn", value: 102 },
      { month: "Jūl", value: 97 },
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
    iconBgClass: "bg-[hsl(var(--icon-bg-green))]",
    history: [
      { month: "Jan", value: 210 },
      { month: "Feb", value: 205 },
      { month: "Mar", value: 200 },
      { month: "Apr", value: 198 },
      { month: "Mai", value: 195 },
      { month: "Jūn", value: 197 },
      { month: "Jūl", value: 194 },
      { month: "Aug", value: 192 },
    ],
  },
  {
    id: "hemoglobin",
    name: "Hemoglobīns",
    icon: <Heart size={20} />,
    normalRange: "13.5–17.5",
    normalMin: 13.5,
    normalMax: 17.5,
    value: 14.2,
    unit: "g/dL",
    change: "+0.7%",
    changePositive: true,
    status: "normal",
    iconBgClass: "bg-[hsl(var(--icon-bg-pink))]",
    history: [
      { month: "Jan", value: 13.8 },
      { month: "Feb", value: 14.0 },
      { month: "Mar", value: 13.5 },
      { month: "Apr", value: 13.9 },
      { month: "Mai", value: 14.1 },
      { month: "Jūn", value: 14.0 },
      { month: "Jūl", value: 14.3 },
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

const MiniSparkline = ({ data, status }: { data: { month: string; value: number }[]; status: Status }) => {
  const color = statusColors[status];
  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
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
          vērtība: <span className="font-bold text-text-dark">{payload[0].value} {unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DetailPanel = ({ result, onClose }: { result: LabResult; onClose: () => void }) => {
  const statusLabel = result.status === "normal" ? "Normāls" : result.status === "warning" ? "Ārpus normas" : "Kritisks";
  
  return (
    <div className="glass-card rounded-2xl p-6 mb-2 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${result.iconBgClass} ${statusTextClass[result.status]}`}>
            {result.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-dark">{result.name}</h3>
            <p className="text-sm text-heading">Normāls diapazons: {result.normalRange} {result.unit}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-heading hover:text-text-dark transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-8 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-heading font-semibold">Pašreizējā vērtība</p>
          <p className="text-3xl font-bold text-text-dark">
            {result.id === "bp" ? "124/79" : result.value} <span className="text-sm font-normal text-heading">{result.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-heading font-semibold">Izmaiņas</p>
          <p className={`text-lg font-bold ${result.changePositive ? "text-status-normal" : "text-status-warning"}`}>
            {result.change}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-heading font-semibold">Statuss</p>
          <p className={`text-lg font-bold ${statusTextClass[result.status]}`}>{statusLabel}</p>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wider text-primary font-bold mb-3">Vēsture (pēdējie 8 mēneši)</p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.history} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 14%, 50%)", fontSize: 12 }} domain={["auto", "auto"]} />
            {result.normalMin > 0 && (
              <ReferenceLine y={result.normalMin} stroke="hsl(152, 60%, 45%)" strokeDasharray="4 4" strokeOpacity={0.5} />
            )}
            <ReferenceLine y={result.normalMax} stroke="hsl(152, 60%, 45%)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Tooltip content={<CustomTooltip unit={result.unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={statusColors[result.status]}
              strokeWidth={2.5}
              dot={(props: any) => {
                const pointStatus = getPointStatus(props.payload.value, result.normalMin, result.normalMax);
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

      <div className="flex gap-2 mt-4">
        {result.history.map((h) => {
          const pStatus = getPointStatus(h.value, result.normalMin, result.normalMax);
          return (
            <div
              key={h.month}
              className="flex-1 glass-card-solid rounded-lg py-2 px-1 text-center"
            >
              <p className="text-xs text-heading font-medium">{h.month}</p>
              <p className={`text-sm font-bold ${statusTextClass[pStatus]}`}>{h.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HealthTrends = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedResult = labResults.find((r) => r.id === expandedId);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--icon-bg-blue))] flex items-center justify-center text-primary">
          <TrendingUp size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-dark">Veselības tendences</h2>
          <p className="text-sm text-heading">Laboratorijas rezultāti un vitālie rādītāji</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDotClass.normal}`} />
            <span className="text-heading">Normāls</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDotClass.warning}`} />
            <span className="text-heading">Ārpus normas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDotClass.critical}`} />
            <span className="text-heading">Kritisks</span>
          </span>
        </div>
        <p className="text-xs italic text-heading">Noklikšķiniet, lai skatītu detaļas</p>
      </div>

      {expandedResult && (
        <DetailPanel result={expandedResult} onClose={() => setExpandedId(null)} />
      )}

      <div className="space-y-2">
        {labResults.map((result) => (
          <button
            key={result.id}
            onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
            className={`w-full glass-card-solid rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md cursor-pointer text-left ${
              expandedId === result.id ? "ring-2 ring-primary/30" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.iconBgClass} ${statusTextClass[result.status]}`}>
              {result.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-dark text-sm">{result.name}</p>
                <span className={`w-2 h-2 rounded-full ${statusDotClass[result.status]}`} />
              </div>
              <p className="text-xs text-heading">Norma: {result.normalRange}</p>
            </div>
            <MiniSparkline data={result.history} status={result.status} />
            <div className="text-right min-w-[80px]">
              <p className="text-xl font-bold text-text-dark">
                {result.id === "bp" ? "124/79" : result.value}{" "}
                <span className="text-xs font-normal text-heading">{result.unit}</span>
              </p>
              <p className={`text-xs font-medium ${result.changePositive ? "text-status-normal" : "text-status-warning"}`}>
                {result.changePositive ? "↘" : "↗"} {result.change}
              </p>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="text-heading ml-1">
              <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <p className="text-xs text-heading mt-4">Atjaunināts: Aug 2024</p>
    </div>
  );
};

export default HealthTrends;
