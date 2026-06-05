export type DocumentTemplateCategory =
  | "nosutijums"
  | "izzina"
  | "izraksts"
  | "ovp"
  | "vakcinacija";

export type TemplateFieldSource =
  | "patient"
  | "doctor"
  | "practice"
  | "system"
  | "suggested";

export type TemplateFieldStatus =
  | "auto"
  | "needs_confirmation"
  | "doctor_required"
  | "missing";

export type TemplateFieldInputType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "checkbox";

export type TemplateField = {
  key: string;
  label: string;
  placeholder: string;
  source: TemplateFieldSource;
  required: boolean;
  editable: boolean;
  status: TemplateFieldStatus;
  inputType?: TemplateFieldInputType;
  options?: string[];
  sortOrder: number;
};

export type DocumentTemplate = {
  id: string;
  title: string;
  description: string;
  category: DocumentTemplateCategory;
  templateFilePath: string;
  outputFileNamePattern: string;
  fields: TemplateField[];
};

export type DocumentTemplateSummary = Pick<
  DocumentTemplate,
  "id" | "title" | "description" | "category"
>;

export type PatientSearchResult = {
  id: string;
  fullName: string;
  personalCode: string;
  age: number;
};

export type ClinicalDiagnosis = {
  code: string;
  name: string;
};

export type PatientDocumentData = {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    personalCode: string;
    birthDate: string;
    age: number;
    gender: "male" | "female";
    phone?: string;
    email?: string;
    latestVisitDate: string;
  };
  doctor: {
    id: string;
    name: string;
    certificateNumber: string;
  };
  practice: {
    name: string;
    registrationNumber: string;
    address: string;
  };
  clinicalData: {
    activeDiagnoses: ClinicalDiagnosis[];
    medications: string[];
    latestVisits: string[];
    labResults: string[];
    vaccinations: string[];
    sickLeavePeriods: string[];
  };
};

export type PreparedDraftField = {
  key: string;
  label: string;
  value: string;
  source: TemplateFieldSource;
  required: boolean;
  editable: boolean;
  status: TemplateFieldStatus;
  inputType?: TemplateFieldInputType;
  options?: string[];
  confirmedByDoctor: boolean;
  placeholder: string;
};

export type PreparedDraftWarning = {
  type: "missing" | "confirmation" | "template";
  message: string;
};

export type PreparedDocumentDraft = {
  draftId: string;
  templateId: string;
  patientId: string;
  fields: PreparedDraftField[];
  warnings: PreparedDraftWarning[];
};

export type UpdateDraftRequest = {
  fields: Record<string, string>;
  confirmedFields?: string[];
};

export type GenerateDraftResponse = {
  fileId: string;
  fileName: string;
  downloadUrl: string;
};

export type DocumentDraftStatus =
  | "draft"
  | "needs_doctor_input"
  | "ready_to_generate"
  | "generated"
  | "archived";

export type DocumentTemplateRecord = {
  id: string;
  title: string;
  description: string;
  category: DocumentTemplateCategory;
  templateFilePath: string;
  outputFileNamePattern: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DocumentTemplateFieldRecord = {
  id: string;
  templateId: string;
  key: string;
  label: string;
  placeholder: string;
  source: TemplateFieldSource;
  required: boolean;
  editable: boolean;
  status: TemplateFieldStatus;
  inputType?: TemplateFieldInputType;
  sortOrder: number;
};

export type DocumentDraftRecord = {
  id: string;
  templateId: string;
  patientId: string;
  doctorId: string;
  status: DocumentDraftStatus;
  createdAt: string;
  updatedAt: string;
  generatedFileId?: string;
};

export type DocumentDraftFieldRecord = {
  id: string;
  draftId: string;
  key: string;
  label: string;
  value: string;
  source: TemplateFieldSource;
  required: boolean;
  editable: boolean;
  status: TemplateFieldStatus;
  confirmedByDoctor: boolean;
  updatedAt: string;
};

export type GeneratedFileRecord = {
  id: string;
  draftId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  createdAt: string;
};

export type DocumentAuditLog = {
  doctorId: string;
  patientId: string;
  templateId: string;
  draftId: string;
  generatedFileId: string;
  timestamp: string;
  autoFilledFields: string[];
  doctorEditedFields: string[];
};
