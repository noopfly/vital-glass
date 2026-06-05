import * as React from "react";
import { CircleX, Search, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import praksesAsistentsLogo from "@/assets/prakses-asistents-logo.png";
import DashboardSidebar from "@/components/DashboardSidebar";
import PatientLoadingPanel from "@/components/PatientLoadingPanel";
import { patients } from "@/data/patients";
import {
  filterDashboardLayoutOrderBySpecialty,
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import {
  readStoredDashboardSpecialty,
  type SpecialtyId,
} from "@/lib/specialties";
import {
  readStoredLastViewedPatient,
  writeStoredLastViewedPatientId,
} from "@/lib/last-viewed-patient";
import { Patient } from "@/types/patient";

type SearchLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  searchQuery?: string;
  specialtyId?: SpecialtyId;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const personalCodeFirstPartLength = 6;
const personalCodeSecondPartLength = 5;
const personalCodeLength = personalCodeFirstPartLength + personalCodeSecondPartLength;

// Format: xxxxxx-xxxxx
function formatPersonalCode(
  raw: string,
  options?: {
    forceSeparatorAfterFirstPart?: boolean;
  },
) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);
  const forceSeparatorAfterFirstPart =
    options?.forceSeparatorAfterFirstPart ?? false;

  if (digits.length < personalCodeFirstPartLength) {
    return digits;
  }

  if (digits.length === personalCodeFirstPartLength) {
    return forceSeparatorAfterFirstPart ? `${digits}-` : digits;
  }

  return `${digits.slice(0, personalCodeFirstPartLength)}-${digits.slice(
    personalCodeFirstPartLength,
  )}`;
}

function getPersonalCodeDigits(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, personalCodeLength);
}

type SearchPageProps = {
  variant?: "omnus" | "prakses-asistents";
};

export default function SearchPage({
  variant = "omnus",
}: SearchPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as SearchLocationState | undefined;
  const specialtyId = routeState?.specialtyId ?? readStoredDashboardSpecialty();

  const activePatient =
    routeState?.patient ?? readStoredLastViewedPatient(patients) ?? patients[0];

  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(
    () =>
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
  );

  const [query, setQuery] = React.useState(() =>
    formatPersonalCode(routeState?.searchQuery ?? ""),
  );

  const [error, setError] = React.useState("");

  const [loadingPatient, setLoadingPatient] = React.useState<Patient | null>(
    null,
  );

  const [loadingPatientComplete, setLoadingPatientComplete] =
    React.useState(false);

  const sidebarPatient = loadingPatient ?? activePatient;

  const recentPatients = React.useMemo(
    () =>
      [
        sidebarPatient,
        ...patients.filter((p) => p.id !== sidebarPatient.id),
      ].slice(0, 5),
    [sidebarPatient],
  );

  React.useEffect(() => {
    setLayoutOrder(
      filterDashboardLayoutOrderBySpecialty(
        normalizeDashboardLayoutOrder(
          routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
        ),
        specialtyId,
      ),
    );
  }, [routeState?.layoutOrder, specialtyId]);

  React.useEffect(() => {
    setQuery(formatPersonalCode(routeState?.searchQuery ?? ""));
  }, [routeState?.searchQuery]);

  React.useEffect(() => {
    writeStoredLastViewedPatientId(activePatient.id);
  }, [activePatient]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isDeleting = event.target.value.length < query.length;
    const formattedValue = formatPersonalCode(event.target.value, {
      forceSeparatorAfterFirstPart: !isDeleting,
    });

    setQuery(formattedValue);

    if (error) {
      setError("");
    }
  };

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    const normalizedQuery = normalizeText(trimmedQuery);
    const queryDigits = getPersonalCodeDigits(trimmedQuery);

    if (!trimmedQuery) {
      setError("Ievadiet pacienta personas kodu.");
      return;
    }

    if (queryDigits.length < personalCodeLength) {
      setError("Ievadiet pilnu pacienta personas kodu.");
      return;
    }

    const patient = patients.find((item) => {
      const itemPersonalCodeDigits = getPersonalCodeDigits(item.personalCode);

      if (item.personalCode === trimmedQuery) return true;
      if (itemPersonalCodeDigits === queryDigits) return true;

      return normalizeText(item.name).includes(normalizedQuery);
    });

    if (!patient) {
      setError("Pacients netika atrasts.");
      return;
    }

    setError("");
    setLoadingPatientComplete(false);
    setLoadingPatient(patient);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F7FA]">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(177,193,210,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(177,193,210,0.14) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(circle at center, black 34%, transparent 88%)",
        }}
      />

      <DashboardSidebar
        activePatient={sidebarPatient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="search"
        dayListCount={patients.length}
        layoutOrder={layoutOrder}
        specialtyId={specialtyId}
        onSaveLayoutOrder={setLayoutOrder}
        loadingPatientId={loadingPatient?.id ?? null}
        loadingPatientComplete={loadingPatientComplete}
      />

      {/* MAIN */}
      <main
        className="relative flex min-h-screen items-center justify-center"
        style={{
          paddingLeft: "var(--dashboard-sidebar-width, 280px)",
        }}
      >
        {/* STATUS */}
        <div
          className={`absolute right-8 flex items-center gap-2 text-[13px] font-medium text-[hsl(214,18%,52%)] ${
            variant === "prakses-asistents" ? "top-6" : "top-6"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(136,36%,34%)]" />
          E-veselība pieslēgta
        </div>

        <div className="flex w-full max-w-5xl flex-col items-center px-6 text-center">
          {variant === "prakses-asistents" ? (
            <div className="flex items-center justify-center gap-3">
              <img
                src={praksesAsistentsLogo}
                alt="Prakses asistents"
                className="h-auto w-full max-w-[190px] object-contain [filter:drop-shadow(0_6px_18px_rgba(29,53,87,0.08))] md:max-w-[220px]"
              />
              <div className="flex shrink-0 items-center gap-2 text-[12px] font-semibold text-[hsl(214,18%,48%)]">
                <span aria-hidden="true">x</span>
                <img
                  src={`${import.meta.env.BASE_URL}omnus-logo.svg`}
                  alt="Omnus"
                  className="h-auto w-[86px] max-w-full opacity-90"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}omnus-icon-logo.svg`}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 rounded-[14px] object-contain [filter:drop-shadow(0_6px_18px_rgba(29,53,87,0.08))] md:h-16 md:w-16"
              />

              <img
                src={`${import.meta.env.BASE_URL}omnus-logo.svg`}
                alt="Omnus"
                className="h-auto w-[190px] max-w-full [filter:drop-shadow(0_6px_18px_rgba(29,53,87,0.08))] md:w-[210px]"
              />
            </div>
          )}

          <form
            className="mt-6 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
              <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Ievadiet personas kodu..."
                  aria-label="Personas kods"
                  className="h-14 w-full rounded-full border border-[hsl(214,20%,86%)] bg-white py-0 pl-5 pr-14 text-[16px] font-medium tracking-[0.02em] text-[hsl(214,42%,17%)] shadow-[0_12px_32px_rgba(29,53,87,0.08)] outline-none transition placeholder:font-normal placeholder:text-[hsl(214,14%,62%)] focus:border-[hsl(214,42%,36%)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08),0_12px_32px_rgba(29,53,87,0.08)]"
                />

                <button
                  type="submit"
                  aria-label="Meklēt pacientu"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-[hsl(214,26%,38%)] transition hover:bg-[hsl(214,24%,95%)] hover:text-[hsl(218,46%,16%)]"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] font-medium text-[#8A8F98]">
  <ShieldCheck className="h-30 w-4 shrink-0 text-[#9AA0AA]" />
  <span>Dati tiek apstrādāti droši un atbilstoši GDPR prasībām</span>
</div>
            </div>

            {error && (
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-3 px-2 py-1 text-[hsl(0,72%,60%)]">
                  <CircleX className="h-6 w-6 shrink-0" />
                  <p className="text-[13px] font-medium">{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* FIXED LOADING OVERLAY */}
      {loadingPatient && (
        <div className="fixed bottom-0 right-0 top-0 z-50 flex items-center justify-center bg-[#f5f7fa] p-6 lg:left-[var(--dashboard-sidebar-width,280px)]">
          <PatientLoadingPanel
            patient={loadingPatient}
            variant="overlay"
            onProgressChange={(_, isComplete) => {
              setLoadingPatientComplete(isComplete);
            }}
            onCancel={() => {
              setError("");
              setQuery("");
              setLoadingPatientComplete(false);
              setLoadingPatient(null);
            }}
            onContinue={() => {
              setLoadingPatientComplete(false);
              navigate("/components", {
                state: { patient: loadingPatient, layoutOrder, specialtyId },
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
