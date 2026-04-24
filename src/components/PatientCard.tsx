import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  HeartPulse,
  User,
} from "lucide-react";
import { Patient } from "@/types/patient";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-heading";
const valueClass = "text-sm font-semibold text-text-dark";

const glowIcon =
  "flex items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]";

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(210,22%,89%)] bg-white shadow-[0_8px_20px_hsl(210_25%_85%/0.15)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left"
      >
        <div className="relative grid w-full gap-6 px-5 py-3 lg:grid-cols-[1fr_auto_0.95fr] lg:items-center">
<div className="flex items-center gap-4">            <div className={`${glowIcon} h-10 w-10`}>
              <User size={18} className="text-current" />
            </div>

            <div className="flex flex-wrap items-center gap-7">
              <div>
                <p className={labelClass}>Vards Uzvards</p>
                <p className={valueClass}>{patient.name}</p>
              </div>

              <div>
                <p className={labelClass}>Personas kods</p>
                <p className={`${valueClass} whitespace-nowrap`}>
                  {patient.personalCode}
                </p>
              </div>

              <div>
                <p className={labelClass}>Vecums</p>
                <p className={`${valueClass} whitespace-nowrap`}>
                  {patient.age} gadi
                </p>
              </div>
            </div>
          </div>

          <div className="hidden h-16 w-px bg-[linear-gradient(180deg,hsla(206,26%,90%,0),hsla(206,26%,90%,0.95),hsla(206,26%,90%,0))] lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:pl-6">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Activity size={12} className="text-heading" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-heading">
                  Esošās diagnozes
                </p>
              </div>

              <ul className="space-y-0.5 text-[12px] leading-[1.15rem] text-text-dark">
                {patient.diagnoses
                  .slice(0, expanded ? patient.diagnoses.length : 2)
                  .map((diag, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                      <span>
                        <strong>{diag.code}</strong> - {diag.description}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <HeartPulse size={12} className="text-heading" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-heading">
                  Hroniskas slimibas
                </p>
              </div>

              <ul
                className={`text-[12px] text-text-dark ${
                  expanded ? "space-y-1 leading-4" : "space-y-0.5 leading-[1.15rem]"
                }`}
              >
                {patient.chronicDiseases
                  .slice(0, expanded ? patient.chronicDiseases.length : 2)
                  .map((disease, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                      <span>
                        <strong>{disease.code}</strong> - {disease.description}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <span className={`${glowIcon} h-9 w-9`}>
              <ChevronDown
                size={14}
                className={`text-current transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[hsl(208,22%,92%)] px-5 py-4">
          <div className="grid gap-9 lg:grid-cols-[1fr_auto_0.95fr]">
            <div>
              <div className="flex flex-wrap items-start gap-10 pl-16">
                <div>
                  <p className={labelClass}>Telefona nr.</p>
                  <p className="text-sm font-semibold text-text-dark">
                    {patient.phone}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>E-pasts</p>
                  <p className="text-sm font-semibold text-text-dark">
                    {patient.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden h-full w-px bg-[linear-gradient(180deg,hsla(206,26%,92%,0),hsla(206,26%,92%,0.75),hsla(206,26%,92%,0))] lg:block" />

            <div className="ml-3 grid gap-8 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-heading" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-heading">
                    Novirzes no normas
                  </p>
                </div>

                <ul className="space-y-1 text-[12px] leading-4 text-text-dark">
                  {patient.deviations.map((deviation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                      <span>{deviation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-heading" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-heading">
                    Riska faktori
                  </p>
                </div>

                <ul className="space-y-1 text-[12px] leading-4 text-text-dark">
                  {patient.riskFactors.map((riskFactor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-[hsl(210,14%,34%)]" />
                      <span>{riskFactor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCard;