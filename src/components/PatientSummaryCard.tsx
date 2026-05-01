import { Activity } from "lucide-react";

interface PatientSummaryCardProps {
  summary: string;
  updatedAt: string;
}

const sectionIconClass =
  "flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(210,219,228,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,246,249,0.96))] text-[hsl(220,36%,18%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";

const PatientSummaryCard = ({
  summary,
  updatedAt,
}: PatientSummaryCardProps) => {
  return (
    <section className="w-full rounded-[16px] border border-[hsl(214,22%,88%)] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
      <div className="flex items-start gap-4">
        <div className={sectionIconClass}>
          <Activity size={18} className="text-current" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="min-w-0">
            <p className="mb-1 text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(214,18%,44%)]">
              Pacienta kopsavilkums
            </p>

            <p className="text-sm leading-6 text-[hsl(222,28%,20%)]">{summary}</p>
          </div>

          <p className="text-xs text-[hsl(214,14%,56%)]">Atjaunināts: {updatedAt}</p>
        </div>
      </div>
    </section>
  );
};

export default PatientSummaryCard;
