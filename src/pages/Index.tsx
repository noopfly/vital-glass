import PatientCard from "@/components/PatientCard";
import HealthTrends from "@/components/HealthTrends";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <PatientCard />
        <HealthTrends />
      </div>
    </div>
  );
};

export default Index;
