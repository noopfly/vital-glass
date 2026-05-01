import {
  Activity,
  AlertTriangle,
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
  return (
    <div className="overflow-hidden rounded-[16px] border border-[hsl(210,22%,89%)] bg-white shadow-[0_8px_18px_rgba(29,53,87,0.05)]">
      
      {/* 🔹 TOP HEADER */}
      <div className="border-b border-[hsl(208,22%,92%)] px-7 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[hsl(214,20%,96%)]">
            <Activity className="h-5 w-5 text-heading" />
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-heading">
              Pacienta klīniskais profils
            </p>
            <p className="mt-1 text-[14px] text-[hsl(214,16%,48%)]">
              Galvenie medicīniskie rādītāji, diagnozes un riska faktori
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

        <div className="hidden h-24 w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

        {/* Diagnozes */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Activity size={15} className="text-heading" />
            <p className={labelClass}>Esošās diagnozes</p>
          </div>

          <ul className="space-y-1 text-sm leading-5 text-text-dark">
            {patient.diagnoses.slice(0, 2).map((diag, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-[8px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                <span>
                  <strong>{diag.code}</strong> - {diag.description}
                  {diag.diagnosedAt && (
                    <span className="whitespace-nowrap text-[hsl(214,14%,62%)]"> ({diag.diagnosedAt})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden h-24 w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

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
                    <span className="whitespace-nowrap text-[hsl(214,14%,62%)]"> ({disease.diagnosedAt})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden h-24 w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

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
