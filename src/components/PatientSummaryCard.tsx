import { Activity } from "lucide-react";

interface PatientSummaryCardProps {
  summary: string;
  updatedAt: string;
}

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]";
const PatientSummaryCard = ({
  summary,
  updatedAt,
}: PatientSummaryCardProps) => {
  return (
    <section className="w-full rounded-2xl border border-white/75 bg-[linear-gradient(180deg,hsla(0,0%,100%,0.72),hsla(205,38%,97%,0.58))] px-6 py-5 shadow-[0_10px_24px_hsl(var(--glass-shadow))] backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className={sectionIconClass}>
  <Activity size={18} className="text-current" />
</div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(210,60%,45%)]">
              Pacienta kopsavilkums
            </p>

            <p className="text-sm leading-6 text-text-dark">
              {summary}
            </p>
          </div>

          <p className="text-xs text-[hsl(214,18%,62%)]">
            Atjaunināts: {updatedAt}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PatientSummaryCard;
