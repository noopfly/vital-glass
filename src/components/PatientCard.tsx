import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import { Patient } from "@/types/patient";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-heading";

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [showAllDiagnoses, setShowAllDiagnoses] = useState(false);
  const visibleDiagnoses = showAllDiagnoses
    ? patient.diagnoses
    : patient.diagnoses.slice(0, 2);
  const hasHiddenDiagnoses = patient.diagnoses.length > 2;

  return (
    <div className="overflow-hidden rounded-[6px] border border-[hsl(210,22%,89%)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]">

      {/* 🔹 TOP HEADER */}
      <div className="border-b border-[hsl(208,22%,92%)] px-7 py-5">
        <div className="flex items-start">
          <div className="flex flex-1 flex-col gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-heading">
                Pacienta klīniskais profils
              </p>

              <p className="mt-1 text-[14px] leading-6 text-[hsl(222,28%,20%)]">
                {patient.summary}
              </p>
            </div>

            <p className="text-xs text-[hsl(214,14%,56%)]">
              Atjaunināts: {patient.updatedAt}
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 CONTENT */}
      <div className="grid w-full gap-5 px-6 py-6 lg:grid-cols-[0.84fr_auto_1.24fr_auto_1fr_auto_0.9fr] lg:items-start">

        {/* Novirzes */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={15} className="text-heading" />
            <p className={labelClass}>Novirzes no normas</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {patient.deviations.slice(0, 3).map((deviation, index) => (
              <span
                key={index}
                className="rounded-[999px] bg-[hsl(0,56%,96%)] px-3 py-1 text-[13px] font-semibold text-[hsl(0,54%,52%)]"
              >
                {deviation}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden self-stretch w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

        {/* Diagnozes */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Activity size={15} className="text-heading" />
            <p className={labelClass}>Esošās diagnozes</p>
          </div>

          <ul className="space-y-1 text-sm leading-5 text-text-dark">
            {visibleDiagnoses.map((diag, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-[8px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />

                <span>
                  <strong>{diag.code}</strong> - {diag.description}

                  {diag.diagnosedAt && (
                    <span className="whitespace-nowrap text-[hsl(214,14%,62%)]">
                      {" "}
                      ({diag.diagnosedAt})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {hasHiddenDiagnoses && (
            <button
              type="button"
              onClick={() => setShowAllDiagnoses((current) => !current)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-normal text-[hsl(214,14%,62%)] transition-colors hover:text-[hsl(214,14%,48%)]"
            >
              {showAllDiagnoses ? "Rādīt mazāk" : "Rādīt vairāk"}
              {showAllDiagnoses ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        <div className="hidden self-stretch w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

        {/* Hroniskās */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HeartPulse size={15} className="text-heading" />
            <p className={labelClass}>Hroniskās slimības</p>
          </div>

          <ul className="space-y-1 text-sm leading-5 text-text-dark">
            {patient.chronicDiseases.slice(0, 2).map((disease, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-[8px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />

                <span>
                  <strong>{disease.code}</strong> - {disease.description}

                  {disease.diagnosedAt && (
                    <span className="whitespace-nowrap text-[hsl(214,14%,62%)]">
                      {" "}
                      ({disease.diagnosedAt})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden self-stretch w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

        {/* Riska faktori */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert size={15} className="text-heading" />
            <p className={labelClass}>Riska faktori</p>
          </div>

          <ul className="space-y-1 text-sm leading-5 text-text-dark">
            {patient.riskFactors.slice(0, 3).map((riskFactor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-[8px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                <span>{riskFactor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
