import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patients } from "@/data/patients";

const PatientCodeEntry = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setError("Ievadiet pacienta personas kodu.");
      return;
    }

    const patient = patients.find((item) => item.personalCode === normalizedCode);

    if (!patient) {
      setError("Pacients ar sadu personas kodu netika atrasts.");
      return;
    }

    setError("");
    navigate("/waiting", { state: { patient } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fcff_0%,#edf6ff_100%)] px-4 py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,170,214,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,170,214,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black 35%, transparent 88%)",
        }}
      />

      <div className="relative w-full max-w-[720px] rounded-[20px] border border-white/80 bg-[rgba(255,255,255,0.88)] shadow-[0_20px_56px_rgba(120,166,205,0.12)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[rgba(166,197,223,0.30)] px-5 py-4">
          <div className="flex items-center gap-2.5 text-[hsl(211,74%,54%)]">
            <span className="text-lg font-semibold tracking-[-0.02em] text-[hsl(213,54%,34%)]">
              Omnus
            </span>
          </div>

          <Link
            to="/register"
            className="text-[13px] font-semibold text-[hsl(206,74%,49%)] transition hover:text-[hsl(206,74%,42%)]"
          >
            Reģistrācija
          </Link>
        </div>

        <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-8 text-center md:px-8 md:py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(129,185,231,0.26)] bg-[linear-gradient(180deg,rgba(245,251,255,0.98),rgba(234,246,255,0.92))] text-[hsl(203,64%,52%)] shadow-[0_12px_24px_rgba(114,182,232,0.10)]">
            <Search className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[hsl(213,42%,22%)] md:text-3xl">
            Pacienta meklēšana
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-[hsl(208,25%,50%)]">
Ievadiet pacienta personas kodu, lai piekļūtu strukturētam pārskatam ar galvenajiem veselības datiem un klīnisko informāciju.          </p>

          <div className="mt-6 w-full rounded-[14px] border border-[rgba(136,184,221,0.22)] bg-[linear-gradient(180deg,rgba(248,252,255,0.98),rgba(239,247,255,0.90))] p-4 text-left shadow-[0_8px_22px_rgba(114,182,232,0.06)]">
            <div>
              <Label
                htmlFor="code"
                className="flex items-center gap-2 text-[13px] font-medium text-[hsl(212,34%,26%)]"
              >
                <UserRound className="h-4 w-4 text-[hsl(212,34%,26%)]" />
                Personas kods
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Ievadiet personas kodu"
                className="mt-3 h-13 rounded-[10px] border-[rgba(166,197,223,0.42)] bg-white/92 px-4 text-[14px] font-medium text-[hsl(213,42%,22%)] shadow-none placeholder:font-normal placeholder:text-[hsl(208,18%,62%)] focus-visible:ring-[hsl(203,64%,52%)]"
              />
              {error && (
                <p className="mt-2 text-[11px] leading-4 text-[hsl(0,72%,55%)]">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSearch}
              className="mt-4 h-10 w-full rounded-[12px] bg-[linear-gradient(180deg,#56b4f0_0%,#318dde_100%)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(90,177,232,0.20)] transition-all duration-500 hover:opacity-95"
            >
              Meklēt pacientu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCodeEntry;
