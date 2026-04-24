import { useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Dna,
    FlaskConical,
    HeartPulse,
    ScanSearch,
    X,
} from "lucide-react";
import humanBody from "@/assets/human-body.png";
import { CenteredOverlay } from "@/components/ui/centered-overlay";

type Category = "stacionars" | "radiologija" | "laboratorija" | "iedzimtas";

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

const CATEGORY_CONFIG: Record<
    Category,
    {
        color: string;
        badge: string;
        Icon: React.ComponentType<{
            className?: string;
            style?: React.CSSProperties;
        }>;
    }
> = {
    stacionars: {
        color: "hsl(0 74% 60%)",
        badge: "Stacionāra atradnes",
        Icon: HeartPulse,
    },
    radiologija: {
        color: "hsl(38 90% 54%)",
        badge: "Radioloģiskas atradnes",
        Icon: ScanSearch,
    },
    laboratorija: {
        color: "hsl(198 78% 52%)",
        badge: "Laboratoriskas novirzes",
        Icon: FlaskConical,
    },
    iedzimtas: {
        color: "hsl(156 52% 46%)",
        badge: "Iedzimtas slimības",
        Icon: Dna,
    },
};

const ORGANS: OrganData[] = [
    {
        id: "plausas",
        label: "Plaušas",
        hotX: 43,
        hotY: 30,
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
        hotX: 52,
        hotY: 34,
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
        hotX: 44,
        hotY: 42,
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
        hotX: 56,
        hotY: 44,
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
                category: "laboratorija",
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

function getFindingCountLabel(count: number) {
    if (count === 1) return "1 atradne";
    return `${count} atradnes`;
}

function getProblemCountLabel(count: number) {
    if (count === 1) return "1 problēma";
    return `${count} problēmas`;
}

function getUniqueCategories(problems: OrganProblem[]): Category[] {
    return [...new Set(problems.map((problem) => problem.category))];
}

function getCategoryCounts(problems: OrganProblem[]) {
    return problems.reduce((acc, problem) => {
        acc[problem.category] = (acc[problem.category] ?? 0) + 1;
        return acc;
    }, {} as Record<Category, number>);
}

function CategoryLegend() {
    return (
        <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.Icon;

                return (
                    <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[10px] font-medium text-[hsl(222,20%,24%)]"
                        style={{ borderColor: `${cfg.color}35` }}
                    >
                        <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                        {cfg.badge}
                    </span>
                );
            })}
        </div>
    );
}

function OrganRing({
    categories,
    size = 34,
    strokeWidth = 4,
}: {
    categories: Category[];
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const segmentCount = categories.length;
    const gapFraction = segmentCount > 1 ? 0.045 : 0;
    const segmentFraction = 1 / segmentCount - gapFraction;

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0 h-full w-full -rotate-90"
            aria-hidden
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
                    />
                );
            })}
        </svg>
    );
}

function OrganHotspot({
    organ,
    isActive,
    onClick,
}: {
    organ: OrganData;
    isActive: boolean;
    onClick: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    const categories = getUniqueCategories(organ.problems);
    const categoryCounts = getCategoryCounts(organ.problems);
    const primaryColor = CATEGORY_CONFIG[categories[0]].color;
    const isHighlighted = hovered || isActive;

    return (
        <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${organ.hotX}%`, top: `${organ.hotY}%` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                onClick={onClick}
                aria-label={`${organ.label}, ${getProblemCountLabel(
                    organ.problems.length
                )}. Atvērt detalizētu informāciju.`}
                aria-pressed={isActive}
                className="group relative"
            >
                {isHighlighted && (
                    <span
                        className="absolute inset-[-10px] rounded-full animate-ping"
                        style={{
                            backgroundColor: primaryColor,
                            opacity: 0.12,
                            animationDuration: "1.8s",
                        }}
                    />
                )}

                <span
                    className="absolute inset-[-10px] rounded-full transition-all duration-200"
                    style={{
                        backgroundColor: primaryColor,
                        opacity: isHighlighted ? 0.12 : 0.06,
                        filter: "blur(8px)",
                    }}
                />

                <span className="relative block h-[34px] w-[34px] transition-transform duration-200 group-hover:scale-110">
                    <OrganRing categories={categories} size={34} strokeWidth={4} />

                    <span
                        className="absolute inset-[5px] flex items-center justify-center rounded-full border bg-white"
                        style={{
                            borderColor: "hsl(210 18% 88%)",
                            boxShadow: isHighlighted
                                ? `0 0 0 5px ${primaryColor}18`
                                : `0 0 0 3px ${primaryColor}10`,
                        }}
                    >
                        <span className="text-[10px] font-bold leading-none text-[hsl(222,28%,20%)]">
                            {organ.problems.length}
                        </span>
                    </span>
                </span>
            </button>

            {hovered && (
                <div className="pointer-events-none absolute bottom-[calc(100%+14px)] left-1/2 z-30 -translate-x-1/2">
                    <div
                        className="absolute left-1/2 top-full h-3 w-px -translate-x-1/2"
                        style={{ backgroundColor: "hsl(214 18% 74%)" }}
                    />
                    <div
                        className="absolute left-1/2 top-full h-3 w-[3px] -translate-x-1/2 blur-[2px]"
                        style={{ backgroundColor: `${primaryColor}55` }}
                    />

                    <div
                        className="w-[280px] rounded-2xl border px-4 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.16)]"
                        style={{
                            borderColor: `${primaryColor}22`,
                            backgroundColor: "rgba(255,255,255,0.98)",
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="relative mt-0.5 h-[34px] w-[34px] shrink-0">
                                <OrganRing categories={categories} size={34} strokeWidth={4} />
                                <div
                                    className="absolute inset-[5px] flex items-center justify-center rounded-full border bg-white"
                                    style={{ borderColor: "hsl(210 18% 88%)" }}
                                >
                                    <span className="text-[10px] font-bold text-[hsl(222,28%,20%)]">
                                        {organ.problems.length}
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[hsl(222,28%,20%)]">
                                    {organ.label}
                                </p>


                                <div className="mt-2 flex flex-wrap items-center gap-3">
  {getUniqueCategories(organ.problems).map((category) => {
    const cfg = CATEGORY_CONFIG[category];
    const Icon = cfg.Icon;

    return (
      <span
        key={category}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium"
        style={{ color: cfg.color }}
      >
        <Icon className="h-4 w-4" />
        <span>{cfg.badge}</span>
      </span>
    );
  })}
</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        <div className="overflow-hidden rounded-2xl border border-[hsl(210,22%,86%)] bg-[hsl(210,40%,98%)] shadow-[0_6px_18px_rgba(148,163,184,0.08)]">
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
                    {open ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
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
                                    key={index}
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
                                    key={index}
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

function OrganModal({
    organ,
    onClose,
}: {
    organ: OrganData;
    onClose: () => void;
}) {
    const categories = getUniqueCategories(organ.problems);
    const primaryColor = CATEGORY_CONFIG[categories[0]].color;

    const [openProblemIds, setOpenProblemIds] = useState<string[]>([]);

    useEffect(() => {
        setOpenProblemIds([]);
    }, [organ.id]);

    const toggleProblem = (id: string) => {
        setOpenProblemIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    return (
        <CenteredOverlay
            onClose={onClose}
            overlayClassName="bg-[rgba(241,245,249,0.72)] backdrop-blur-[6px]"
        >
            <div className="relative mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-[hsl(210,22%,88%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="max-h-[90vh] overflow-y-auto p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
                        aria-label="Aizvērt"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mb-6 flex items-start justify-between gap-4 pr-14">
                        <div className="flex items-start gap-4 min-w-0">
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

    const activeOrgan = useMemo(
        () => ORGANS.find((organ) => organ.id === selectedOrganId) ?? null,
        [selectedOrganId]
    );

    return (
        <>
            <div className="glass-card flex flex-col rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(199,58%,44%)]">
                        Ķermeņa pārskats
                    </h2>
                </div>

                <p className="mt-3 text-left text-[11px] text-[hsl(214,14%,58%)]">
                    Virziet kursoru virs orgāna, lai redzētu kopsavilkumu, vai nospiediet,
                    lai atvērtu detalizētu informāciju
                </p>

                <div className="relative mx-auto mt-4 flex w-full max-w-[760px] items-center justify-center overflow-visible rounded-[1.8rem] px-3 py-3 shadow-[inset_0_1px_0_hsla(0,0%,100%,0.75)]">
                    <img
                        src={humanBody}
                        alt="Cilvēka ķermeņa modelis"
                        className="h-auto max-h-[980px] w-full select-none object-contain object-center opacity-95 xl:max-h-[1080px]"
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
                            onClick={() => setSelectedOrganId(organ.id)}
                        />
                    ))}
                </div>
            </div>

            {activeOrgan && (
                <OrganModal
                    organ={activeOrgan}
                    onClose={() => setSelectedOrganId(null)}
                />
            )}
        </>
    );
}