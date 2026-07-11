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
    <div className="flex min-h-screen items-center justify-center bg-[hsl(210,32%,96%)] px-4 py-6">
      <PatientLoadingPanel
        patient={patient}
        variant="page"
        onCancel={() => navigate("/", { replace: true })}
        onContinue={() => navigate("/clinical-dashboard", { state: { patient } })}
      />
    </div>
  );
};

export default WaitingScreen;
