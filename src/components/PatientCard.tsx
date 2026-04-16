import { ChevronDown } from "lucide-react";

const PatientCard = () => {
  return (
    <div className="glass-card-solid rounded-2xl p-5 flex items-center gap-6">
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-heading uppercase">Vārds</p>
          <p className="text-base font-semibold text-text-dark">Jānis</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-heading uppercase">Uzvārds</p>
          <p className="text-base font-semibold text-text-dark">Bērziņš</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-heading uppercase">Personas kods</p>
          <p className="text-base font-semibold text-text-dark">010185-12345</p>
        </div>
      </div>
      <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
        <ChevronDown size={18} />
      </button>
    </div>
  );
};

export default PatientCard;
