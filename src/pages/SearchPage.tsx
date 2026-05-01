import * as React from "react";
import { ArrowRight, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardSidebar from "@/components/DashboardSidebar";
import PatientLoadingPanel from "@/components/PatientLoadingPanel";
import { patients } from "@/data/patients";
import { Patient } from "@/types/patient";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// format: xxxxxx-xxxxx
function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 11);

  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePatient =
    (location.state?.patient as Patient | undefined) ?? patients[0];

  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState("");
  const [loadingPatient, setLoadingPatient] = React.useState<Patient | null>(
    null,
  );

  const recentPatients = React.useMemo(
    () =>
      [
        activePatient,
        ...patients.filter((p) => p.id !== activePatient.id),
      ].slice(0, 5),
    [activePatient],
  );

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    const normalizedQuery = normalizeText(trimmedQuery);

    if (!trimmedQuery) {
      setError("Ievadiet pacienta personas kodu.");
      return;
    }

    const patient = patients.find((item) => {
      if (item.personalCode === trimmedQuery) return true;
      return normalizeText(item.name).includes(normalizedQuery);
    });

    if (!patient) {
      setError("Pacients netika atrasts.");
      return;
    }

    setError("");
    setLoadingPatient(patient);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] overflow-hidden">
      <DashboardSidebar
        activePatient={activePatient}
        recentPatients={recentPatients}
        currentView="search"
        dayListCount={patients.length}
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

        {/* CENTER CONTENT */}
        <div className="flex w-full max-w-xl flex-col items-center px-6 text-center">
          <h1 className="mb-6 text-7xl font-light tracking-tight text-[hsl(218,46%,12%)]">
            OMNUS
          </h1>

          <p className="mb-8 max-w-lg text-[17px] text-[hsl(214,18%,44%)]">
            Ievadiet pacienta personas kodu, lai piekļūtu strukturētam
            pārskatam ar galvenajiem veselības datiem un klīnisko informāciju.
          </p>

          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex w-full items-center rounded-xl bg-white px-6 py-4 shadow">
              <Search className="mr-3 h-[22px] w-[22px] text-[hsl(214,18%,70%)]" />

              <input
                type="text"
                placeholder="Ievadiet personas kodu"
                className="flex-1 bg-transparent text-center text-lg text-[hsl(214,42%,17%)] outline-none placeholder:text-[hsl(214,18%,70%)]"
                autoFocus
                value={query}
                onChange={(e) => {
                  const formatted = formatPersonalCode(e.target.value);
                  setQuery(formatted);
                  if (error) setError("");
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text");
                  setQuery(formatPersonalCode(pasted));
                }}
                inputMode="numeric"
                maxLength={12}
                onKeyDown={(e) => {
                  const allowed = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                    "Enter",
                  ];

                  if (!/\d/.test(e.key) && !allowed.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />

              <button
                type="submit"
                className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(214,42%,17%)] text-white transition hover:opacity-95"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <p className="mt-3 text-left text-[12px] text-[hsl(0,72%,55%)]">
                {error}
              </p>
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
            onCancel={() => setLoadingPatient(null)}
            onContinue={() =>
              navigate("/components", {
                state: { patient: loadingPatient },
              })
            }
          />
        </div>
      )}
    </div>
  );
}