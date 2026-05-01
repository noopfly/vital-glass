import { KeyRound, ShieldCheck, UserRoundPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const navigate = useNavigate();

  const hoverButtonClass =
    "group relative overflow-hidden !bg-white !text-[hsl(220,36%,18%)] !transition-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(180deg,hsl(220,36%,18%),hsl(218,34%,24%))] before:opacity-0 before:transition-none hover:before:opacity-100 hover:!bg-white hover:!text-white hover:border-[hsl(220,36%,18%)]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fa]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(177,193,210,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(177,193,210,0.14) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(circle at center, black 34%, transparent 88%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1240px] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[520px] text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center text-[hsl(220,36%,18%)]">
            <KeyRound className="h-9 w-9" strokeWidth={1.8} />
          </div>

          <h1 className="mt-6 text-[34px] font-semibold tracking-[-0.05em] text-[hsl(219,40%,16%)] md:text-[46px]">
            Laipni lūdzam OMNUS
          </h1>

          <p className="mt-3 text-[16px] leading-7 text-[hsl(214,16%,48%)] md:text-[17px]">
            Pieslēdzieties ar eID, lai piekļūtu sistēmai.
          </p>

          <div className="mx-auto mt-8 max-w-[420px]">
            <Button
              type="button"
              onClick={() => navigate("/search")}
              className={`${hoverButtonClass} h-16 w-full rounded-[16px] border border-[rgba(218,225,233,0.96)] px-6 text-[16px] font-semibold shadow-[0_12px_28px_rgba(29,53,87,0.06)]`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <KeyRound className="mr-3 h-5 w-5" strokeWidth={1.9} />
                Pieslēgties ar eID
              </span>
            </Button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-[14px] text-[hsl(214,16%,54%)]">
            <ShieldCheck className="h-4 w-4" />
            Dati tiek aizsargāti saskaņā ar GDPR regulām.
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-[rgba(220,228,236,0.96)]" />
            <p className="text-[14px] font-medium text-[hsl(214,16%,56%)]">
              Vēl neesat reģistrēts?
            </p>
            <div className="h-px flex-1 bg-[rgba(220,228,236,0.96)]" />
          </div>

          <div className="mt-6">
            <Link to="/register">
              <Button
                type="button"
                variant="ghost"
                className={`${hoverButtonClass} h-14 rounded-[14px] border border-[rgba(210,219,228,0.96)] px-7 text-[15px] font-semibold shadow-[0_10px_24px_rgba(29,53,87,0.05)]`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Reģistrēties sistēmai
                  <UserRoundPlus className="ml-3 h-4.5 w-4.5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}