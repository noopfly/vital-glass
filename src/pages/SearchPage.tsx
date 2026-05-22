import * as React from "react";
import { CircleX, Search, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardSidebar from "@/components/DashboardSidebar";
import PatientLoadingPanel from "@/components/PatientLoadingPanel";
import { patients } from "@/data/patients";
import {
  normalizeDashboardLayoutOrder,
  readStoredDashboardLayoutOrder,
  type DashboardComponentKey,
} from "@/lib/dashboard-layout";
import { Patient } from "@/types/patient";

type SearchLocationState = {
  patient?: Patient;
  layoutOrder?: DashboardComponentKey[];
  searchQuery?: string;
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
function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);

  if (digits.length <= personalCodeFirstPartLength) {
    return digits;
  }

  return `${digits.slice(0, personalCodeFirstPartLength)}-${digits.slice(
    personalCodeFirstPartLength,
  )}`;
}

function getPersonalCodeDigits(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, personalCodeLength);
}

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as SearchLocationState | undefined;

  const activePatient = routeState?.patient ?? patients[0];

  const [layoutOrder, setLayoutOrder] = React.useState<DashboardComponentKey[]>(
    () =>
      normalizeDashboardLayoutOrder(
        routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
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
      normalizeDashboardLayoutOrder(
        routeState?.layoutOrder ?? readStoredDashboardLayoutOrder(),
      ),
    );
  }, [routeState?.layoutOrder]);

  React.useEffect(() => {
    setQuery(formatPersonalCode(routeState?.searchQuery ?? ""));
  }, [routeState?.searchQuery]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPersonalCode(event.target.value);

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
    <div className="min-h-screen overflow-hidden bg-[#F5F7FA]">
      <DashboardSidebar
        activePatient={sidebarPatient}
        recentPatients={recentPatients}
        allPatients={patients}
        currentView="search"
        dayListCount={patients.length}
        layoutOrder={layoutOrder}
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
        <div className="absolute right-8 top-6 flex items-center gap-2 text-[13px] font-medium text-[hsl(214,18%,52%)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(136,36%,34%)]" />
          E-veselība pieslēgta
        </div>

        <div className="flex w-full max-w-5xl flex-col items-center px-6 text-center">
          <img
            src="/omnus-logo.svg"
            alt="Omnus"
            className="h-auto w-full max-w-[620px] [filter:drop-shadow(0_8px_26px_rgba(29,53,87,0.08))]"
          />

          <form
            className="mt-10 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="mx-auto flex w-full max-w-[520px] flex-col items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Ievadiet personas kodu..."
                  aria-label="Personas kods"
                  className="h-14 w-full rounded-[14px] border border-[hsl(214,20%,86%)] bg-white py-0 pl-5 pr-14 text-[16px] font-medium tracking-[0.02em] text-[hsl(214,42%,17%)] shadow-[0_12px_32px_rgba(29,53,87,0.08)] outline-none transition placeholder:text-[hsl(214,14%,62%)] focus:border-[hsl(214,42%,36%)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08),0_12px_32px_rgba(29,53,87,0.08)]"
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
                state: { patient: loadingPatient, layoutOrder },
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
