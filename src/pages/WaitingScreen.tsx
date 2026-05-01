import { useLocation, useNavigate } from "react-router-dom";

import PatientLoadingPanel from "@/components/PatientLoadingPanel";
import { Patient } from "@/types/patient";

const WaitingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient as Patient | undefined;

  if (!patient) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f5f7fa_0%,#edf1f5_100%)] px-4 py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,145,168,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,145,168,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle at center, black 35%, transparent 88%)",
        }}
      />

      <PatientLoadingPanel
        patient={patient}
        variant="page"
        onCancel={() => navigate("/", { replace: true })}
        onContinue={() => navigate("/components", { state: { patient } })}
      />
    </div>
  );
};

export default WaitingScreen;
