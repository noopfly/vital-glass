import * as React from "react";
import { CircleX, Search } from "lucide-react";
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

const personalCodeGroupSizes = [6, 5] as const;
const personalCodeLength = personalCodeGroupSizes[0] + personalCodeGroupSizes[1];

// format: xxxxxx-xxxxx
function formatPersonalCode(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, personalCodeLength);

  if (digits.length <= personalCodeGroupSizes[0]) return digits;
  return `${digits.slice(0, personalCodeGroupSizes[0])}-${digits.slice(personalCodeGroupSizes[0])}`;
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
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const sidebarPatient = loadingPatient ?? activePatient;

  const personalCodeDigits = React.useMemo(() => {
    const digits = query.replace(/[^\d]/g, "").slice(0, personalCodeLength).split("");

    return Array.from({ length: personalCodeLength }, (_, index) => digits[index] ?? "");
  }, [query]);

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

  const updateQueryFromDigits = React.useCallback(
    (nextDigits: string[]) => {
      setQuery(formatPersonalCode(nextDigits.join("")));
      if (error) setError("");
    },
    [error],
  );

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    const normalizedQuery = normalizeText(trimmedQuery);
    const digitCount = trimmedQuery.replace(/[^\d]/g, "").length;

    if (!trimmedQuery) {
      setError("Ievadiet pacienta personas kodu.");
      return;
    }

    if (digitCount < personalCodeLength) {
      setError("Ievadiet pilnu pacienta personas kodu.");
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
    setLoadingPatientComplete(false);
    setLoadingPatient(patient);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] overflow-hidden">
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
          <h1 className="text-7xl font-light tracking-tight text-[hsl(218,46%,12%)] [text-shadow:0_8px_26px_rgba(29,53,87,0.08)]">
            OMNUS
          </h1>

          <form
            className="mt-10 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="mx-auto flex w-fit flex-col items-center justify-center gap-8 px-4 py-4">
              <div className="grid grid-cols-[1fr_1fr] items-center">
                <div className="flex w-[318px] justify-end gap-1.5 pr-[3px]">
                  {personalCodeDigits
                    .slice(0, personalCodeGroupSizes[0])
                    .map((digit, localIndex) => {
                      const index = localIndex;

                      return (
                        <input
                          key={index}
                          ref={(node) => {
                            inputRefs.current[index] = node;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoFocus={index === 0}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const nextValue = e.target.value.replace(/[^\d]/g, "").slice(-1);
                            const nextDigits = [...personalCodeDigits];
                            nextDigits[index] = nextValue;
                            updateQueryFromDigits(nextDigits);

                            if (nextValue && index < personalCodeLength - 1) {
                              inputRefs.current[index + 1]?.focus();
                              inputRefs.current[index + 1]?.select();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              e.preventDefault();
                              const nextDigits = [...personalCodeDigits];

                              if (nextDigits[index]) {
                                nextDigits[index] = "";
                                updateQueryFromDigits(nextDigits);
                                return;
                              }

                              if (index > 0) {
                                nextDigits[index - 1] = "";
                                updateQueryFromDigits(nextDigits);
                                inputRefs.current[index - 1]?.focus();
                              }
                              return;
                            }

                            if (e.key === "ArrowLeft" && index > 0) {
                              e.preventDefault();
                              inputRefs.current[index - 1]?.focus();
                              return;
                            }

                            if (e.key === "ArrowRight" && index < personalCodeLength - 1) {
                              e.preventDefault();
                              inputRefs.current[index + 1]?.focus();
                              return;
                            }

                            const allowed = ["Delete", "Tab", "Enter"];
                            if (!/\d/.test(e.key) && !allowed.includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedDigits = e.clipboardData
                              .getData("text")
                              .replace(/[^\d]/g, "")
                              .slice(0, personalCodeLength - index)
                              .split("");

                            if (pastedDigits.length === 0) return;

                            const nextDigits = [...personalCodeDigits];
                            pastedDigits.forEach((value, offset) => {
                              nextDigits[index + offset] = value;
                            });
                            updateQueryFromDigits(nextDigits);

                            const nextFocusIndex = Math.min(
                              index + pastedDigits.length,
                              personalCodeLength - 1,
                            );
                            inputRefs.current[nextFocusIndex]?.focus();
                          }}
                          className="h-12 w-12 shrink-0 rounded-[8px] border border-[hsl(214,20%,86%)] bg-white text-center text-lg font-semibold text-[hsl(214,42%,17%)] shadow-[0_6px_18px_rgba(29,53,87,0.06)] outline-none transition focus:border-[hsl(214,42%,36%)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                          aria-label={`Personas koda cipars ${index + 1}`}
                        />
                      );
                    })}
                </div>

                <div className="flex w-[318px] justify-start gap-1.5 pl-[3px]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] border border-[hsl(214,18%,82%)] bg-[hsl(214,18%,94%)] text-xl font-semibold leading-none text-[hsl(214,18%,46%)] shadow-[0_4px_12px_rgba(29,53,87,0.04)]">
                    -
                  </span>
                  {personalCodeDigits
                    .slice(personalCodeGroupSizes[0])
                    .map((digit, localIndex) => {
                      const index = personalCodeGroupSizes[0] + localIndex;

                      return (
                        <input
                          key={index}
                          ref={(node) => {
                            inputRefs.current[index] = node;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const nextValue = e.target.value.replace(/[^\d]/g, "").slice(-1);
                            const nextDigits = [...personalCodeDigits];
                            nextDigits[index] = nextValue;
                            updateQueryFromDigits(nextDigits);

                            if (nextValue && index < personalCodeLength - 1) {
                              inputRefs.current[index + 1]?.focus();
                              inputRefs.current[index + 1]?.select();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              e.preventDefault();
                              const nextDigits = [...personalCodeDigits];

                              if (nextDigits[index]) {
                                nextDigits[index] = "";
                                updateQueryFromDigits(nextDigits);
                                return;
                              }

                              if (index > 0) {
                                nextDigits[index - 1] = "";
                                updateQueryFromDigits(nextDigits);
                                inputRefs.current[index - 1]?.focus();
                              }
                              return;
                            }

                            if (e.key === "ArrowLeft" && index > 0) {
                              e.preventDefault();
                              inputRefs.current[index - 1]?.focus();
                              return;
                            }

                            if (e.key === "ArrowRight" && index < personalCodeLength - 1) {
                              e.preventDefault();
                              inputRefs.current[index + 1]?.focus();
                              return;
                            }

                            const allowed = ["Delete", "Tab", "Enter"];
                            if (!/\d/.test(e.key) && !allowed.includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedDigits = e.clipboardData
                              .getData("text")
                              .replace(/[^\d]/g, "")
                              .slice(0, personalCodeLength - index)
                              .split("");

                            if (pastedDigits.length === 0) return;

                            const nextDigits = [...personalCodeDigits];
                            pastedDigits.forEach((value, offset) => {
                              nextDigits[index + offset] = value;
                            });
                            updateQueryFromDigits(nextDigits);

                            const nextFocusIndex = Math.min(
                              index + pastedDigits.length,
                              personalCodeLength - 1,
                            );
                            inputRefs.current[nextFocusIndex]?.focus();
                          }}
                          className="h-12 w-12 shrink-0 rounded-[8px] border border-[hsl(214,20%,86%)] bg-white text-center text-lg font-semibold text-[hsl(214,42%,17%)] shadow-[0_6px_18px_rgba(29,53,87,0.06)] outline-none transition focus:border-[hsl(214,42%,36%)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                          aria-label={`Personas koda cipars ${index + 1}`}
                        />
                      );
                    })}
                </div>
              </div>

              <button
                type="submit"
                className="flex h-12 min-w-[184px] shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(180deg,hsl(220,36%,18%)_0%,hsl(218,34%,22%)_100%)] px-6 text-white shadow-[0_14px_30px_rgba(29,53,87,0.14)] transition hover:opacity-95"
              >
                <Search className="h-5 w-5" />
                <span className="text-[15px] font-semibold">Meklēt</span>
              </button>
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
