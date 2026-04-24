export interface Patient {
  id: string;
  name: string;
  personalCode: string;
  age: number;
  phone: string;
  email: string;
  summary: string;
  updatedAt: string;
  diagnoses: { code: string; description: string }[];
  chronicDiseases: { code: string; description: string }[];
  deviations: string[];
  riskFactors: string[];
}
