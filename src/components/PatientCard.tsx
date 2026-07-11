import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold leading-6 text-[hsl(222,28%,20%)]">
        {title}
      </h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function ConditionList({
  items,
}: {
  items: Array<{ code: string; description: string; diagnosedAt?: string }>;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={`${item.code}-${item.description}`} className="text-sm leading-5 text-text-dark">
          <span>{item.code} - {item.description}</span>
          {item.diagnosedAt ? (
            <span className="ml-1.5 whitespace-nowrap text-xs text-[hsl(215,14%,52%)]">
              {item.diagnosedAt}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [showAllDiagnoses, setShowAllDiagnoses] = useState(false);
  const visibleDiagnoses = showAllDiagnoses ? patient.diagnoses : patient.diagnoses.slice(0, 2);

  return (
    <section className="clinical-panel flex h-full w-full flex-col">
      <DashboardCardHeader
        title="Pacienta klīniskais profils"
        infoLabel="Informācija par pacienta klīnisko profilu"
        infoDescription="Klīniskā stāvokļa kopsavilkums"
      />
      <p className="-mt-1 w-full max-w-none text-sm leading-6 text-[hsl(220,18%,26%)]">
          {patient.summary}
      </p>

      <div className="mt-5 grid gap-x-8 gap-y-6 border-t border-[hsl(214,22%,90%)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileSection title="Novirzes no normas">
          <div className="flex flex-wrap gap-2">
            {patient.deviations.slice(0, 3).map((deviation) => (
              <span
                key={deviation}
                className="rounded-full border border-[hsl(40,65%,82%)] bg-[hsl(40,64%,95%)] px-3 py-1.5 text-sm font-semibold text-[hsl(34,55%,32%)]"
              >
                {deviation}
              </span>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Esošās diagnozes">
          <ConditionList items={visibleDiagnoses} />
          {patient.diagnoses.length > 2 ? (
            <button
              type="button"
              onClick={() => setShowAllDiagnoses((current) => !current)}
              className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm text-[hsl(220,36%,28%)] transition-colors hover:text-[hsl(220,48%,30%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
            >
              {showAllDiagnoses ? "Rādīt mazāk" : `Rādīt vēl ${patient.diagnoses.length - 2}`}
              {showAllDiagnoses ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          ) : null}
        </ProfileSection>

        <ProfileSection title="Hroniskās slimības">
          <ConditionList items={patient.chronicDiseases.slice(0, 2)} />
        </ProfileSection>

        <ProfileSection title="Riska profils">
          <ul className="space-y-2.5 text-sm leading-5 text-text-dark">
            {patient.riskFactors.slice(0, 3).map((riskFactor) => (
              <li key={riskFactor}>{riskFactor}</li>
            ))}
          </ul>
        </ProfileSection>
      </div>
    </section>
  );
};

export default PatientCard;
