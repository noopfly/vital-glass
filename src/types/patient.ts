export interface Patient {
  id: string;
  name: string;
  personalCode: string;
  age: number;
  phone: string;
  email: string;
  summary: string;
  updatedAt: string;
  diagnoses: { code: string; description: string; diagnosedAt?: string }[];
  chronicDiseases: { code: string; description: string; diagnosedAt?: string }[];
  deviations: string[];
  riskFactors: string[];
}
