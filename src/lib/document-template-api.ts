import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import { patients } from "@/data/patients";
import { registeredDoctorAccount, registeredPractice } from "@/lib/doctor-account";
import { documentTemplateMap, documentTemplates } from "@/lib/document-templates";
import {
  type DocumentAuditLog,
  type DocumentDraftFieldRecord,
  type DocumentDraftRecord,
  type DocumentTemplate,
  type DocumentTemplateSummary,
  type GenerateDraftResponse,
  type GeneratedFileRecord,
  type PatientDocumentData,
  type PatientSearchResult,
  type PreparedDocumentDraft,
  type PreparedDraftField,
  type TemplateFieldStatus,
  type UpdateDraftRequest,
} from "@/types/document-templates";
import { type Patient } from "@/types/patient";

type GeneratedFileStoreItem = GeneratedFileRecord & {
  blob: Blob;
  objectUrl: string;
};

const draftStore = new Map<string, DocumentDraftRecord>();
const draftFieldStore = new Map<string, DocumentDraftFieldRecord[]>();
const generatedFileStore = new Map<string, GeneratedFileStoreItem>();
const auditLogStore: DocumentAuditLog[] = [];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugifyFilePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function todayDate() {
  return new Intl.DateTimeFormat("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function parseName(patient: Patient) {
  const parts = patient.name.split(" ");
  return {
    firstName: parts[0] ?? patient.name,
    lastName: parts.slice(1).join(" ") || parts[0] || patient.name,
  };
}

function inferBirthDate(personalCode: string) {
  const [raw] = personalCode.split("-");
  if (raw.length !== 6) {
    return "1980-01-01";
  }

  const day = raw.slice(0, 2);
  const month = raw.slice(2, 4);
  const year = Number(raw.slice(4, 6));
  const fullYear = year > 30 ? `19${year.toString().padStart(2, "0")}` : `20${year.toString().padStart(2, "0")}`;
  return `${fullYear}-${month}-${day}`;
}

function mapPatientToDocumentData(patient: Patient): PatientDocumentData {
  const { firstName, lastName } = parseName(patient);
  const latestVisitDate = patient.updatedAt.split(",")[0] ?? patient.updatedAt;

  return {
    patient: {
      id: patient.id,
      firstName,
      lastName,
      fullName: patient.name,
      personalCode: patient.personalCode,
      birthDate: inferBirthDate(patient.personalCode),
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      latestVisitDate,
    },
    doctor: registeredDoctorAccount,
    practice: registeredPractice,
    clinicalData: {
      activeDiagnoses: patient.diagnoses.map((item) => ({
        code: item.code,
        name: item.description,
      })),
      medications: patient.chronicDiseases.map(
        (item) => `${item.code} — ${item.description}`,
      ),
      latestVisits: [
        patient.summary,
        `Pēdējā vizīte: ${latestVisitDate}`,
      ],
      labResults: patient.deviations.length
        ? patient.deviations.map((item) => `${item}`)
        : ["Laboratoriskie rezultāti nav pievienoti."],
      vaccinations: [
        "Difterija / stingumkrampji — 2024",
        "Gripa — 2025",
      ],
      sickLeavePeriods: patient.riskFactors.length
        ? [`Sistēmā atrasti iespējamie saistītie ierobežojumi: ${patient.riskFactors.join(", ")}`]
        : [],
    },
  };
}

function buildDoctorSuggestedValue(
  templateId: string,
  key: string,
  data: PatientDocumentData,
) {
  const diagnoses = data.clinicalData.activeDiagnoses
    .map((item) => `${item.code} - ${item.name}`)
    .join("; ");
  const visitSummary = data.clinicalData.latestVisits.filter(Boolean).join(" ");
  const labResults = data.clinicalData.labResults.filter(Boolean).join("; ");
  const medications = data.clinicalData.medications.filter(Boolean).join("; ");
  const vaccinationHistory = data.clinicalData.vaccinations.filter(Boolean).join("; ");
  const riskFactors = data.clinicalData.sickLeavePeriods.filter(Boolean).join("; ");

  switch (key) {
    case "doctor_fill_health_description":
      return [
        visitSummary || "Viz\u012btes kopsavilkums sist\u0113m\u0101 nav pieejams.",
        diagnoses ? `Aktu\u0101l\u0101s diagnozes: ${diagnoses}.` : "",
        labResults ? `Pieejamie izmekl\u0113jumi: ${labResults}.` : "",
        medications ? `Lietotie medikamenti un terapija: ${medications}.` : "",
        "L\u016bdzu, preciz\u0113jiet prognozi un turpm\u0101k\u0101s \u0101rst\u0113\u0161anas pl\u0101nu atbilsto\u0161i kl\u012bniskajai situ\u0101cijai.",
      ]
        .filter(Boolean)
        .join(" ");
    case "doctor_fill_reason":
      if (templateId === "vdeavk_work_ability_referral") {
        return `Pacients tiek nos\u016bt\u012bts uz VDE\u0100VK izv\u0113rt\u0113jumu, jo vesel\u012bbas st\u0101voklis var b\u016btiski ietekm\u0113t darba sp\u0113jas. Aktu\u0101l\u0101s diagnozes: ${diagnoses || "nav struktur\u0113ti nor\u0101d\u012btas"}.`;
      }

      if (templateId === "ambulatory_extract_027u") {
        return `Dokuments sagatavots pacienta vesel\u012bbas st\u0101vok\u013ca un l\u012bdz\u0161in\u0113j\u0101s \u0101rst\u0113\u0161anas gaitas apkopo\u0161anai. ${visitSummary || "Viz\u012btes kopsavilkums sist\u0113m\u0101 nav pieejams."}`;
      }

      if (templateId === "education_excuse_certificate") {
        return `Pamatojoties uz aktu\u0101lo vesel\u012bbas st\u0101vokli, pacientam nepiecie\u0161ams attaisnojums izgl\u012bt\u012bbas iest\u0101dei. ${visitSummary || "Nepiecie\u0161ams preciz\u0113t kl\u012bnisko situ\u0101ciju."}`;
      }

      if (templateId === "mandatory_health_check_ovp") {
        return `Darba vides riska izv\u0113rt\u0113jum\u0101 j\u0101\u0146em v\u0113r\u0101 \u0161\u0101di aspekti: ${riskFactors || "sist\u0113m\u0101 struktur\u0113ti riska faktori nav atrasti"}.`;
      }

      return `${visitSummary || "Sist\u0113m\u0101 sagatavots \u012bss kl\u012bniskais kopsavilkums."} ${diagnoses ? `Aktu\u0101l\u0101s diagnozes: ${diagnoses}.` : ""}`.trim();
    case "doctor_fill_referral_reason":
      return [
        "\u2610 Prognoz\u0113jam\u0101s invalidit\u0101tes ekspert\u012bzei",
        "\u2611 Invalidit\u0101tes un darbsp\u0113ju ekspert\u012bzei",
        "\u2610 \u012apa\u0161as kop\u0161anas medic\u012bnisko indik\u0101ciju ekspert\u012bzei",
        "\u2610 Viegl\u0101 automobi\u013ca speci\u0101l\u0101s piel\u0101go\u0161anas un pabalsta sa\u0146em\u0161anas transporta izdevumu kompens\u0113\u0161anai medic\u012bnisko indik\u0101ciju ekspert\u012bzei",
        "\u2610 Pavado\u0146a pakalpojuma sa\u0146em\u0161anas ekspert\u012bzei",
        "\u2610 Atzinuma snieg\u0161anai par darbnesp\u0113jas lapas pagarin\u0101\u0161anu p\u0101rejo\u0161as darbnesp\u0113jas period\u0101",
        "\u2610 Cits iemesls: nav nor\u0101d\u012bts",
      ].join("\n");
    case "doctor_fill_functional_limitations":
      if (riskFactors) {
        return `${riskFactors}. Nepiecie\u0161ams \u0101rsta kl\u012bniskais preciz\u0113jums par funkcion\u0101lo ierobe\u017eojumu apjomu ikdien\u0101 un darb\u0101.`;
      }

      if (diagnoses) {
        return `Funkcion\u0101lie ierobe\u017eojumi v\u0113rt\u0113jami saist\u012bb\u0101 ar \u0161\u0101d\u0101m diagnoz\u0113m: ${diagnoses}. Nepiecie\u0161ams \u0101rsta preciz\u0113jums par ietekmi uz pacienta ikdienas aktivit\u0101t\u0113m.`;
      }

      return "Sist\u0113m\u0101 nav pietiekamu datu funkcion\u0101lo ierobe\u017eojumu aprakstam. Nepiecie\u0161ams \u0101rsta izv\u0113rt\u0113jums un preciz\u0113jums.";
    case "doctor_fill_recommendations":
      if (templateId === "driver_medical_certificate") {
        return "Ieteicams izv\u0113rt\u0113t pacienta atbilst\u012bbu transportl\u012bdzek\u013ca vad\u012b\u0161anai atbilsto\u0161i aktu\u0101lajam vesel\u012bbas st\u0101voklim un, ja nepiecie\u0161ams, noz\u012bm\u0113t papildu speci\u0101lista konsult\u0101ciju.";
      }

      if (templateId === "sports_pool_certificate") {
        return "Pie\u013caujama fizisk\u0101 slodze atbilsto\u0161i pacienta pa\u0161reiz\u0113jam vesel\u012bbas st\u0101voklim. S\u016bdz\u012bbu vai pa\u0161saj\u016btas pasliktin\u0101\u0161an\u0101s gad\u012bjum\u0101 slodze j\u0101p\u0101rtrauc un j\u0101veic atk\u0101rtota izv\u0113rt\u0113\u0161ana.";
      }

      if (templateId === "mandatory_health_check_ovp") {
        return "Ieteicama regul\u0101ra vesel\u012bbas st\u0101vok\u013ca uzraudz\u012bba un darba vides riska faktoru mazin\u0101\u0161ana. Gala atzinumu \u0101rsts preciz\u0113 p\u0113c kl\u012bnisk\u0101 izv\u0113rt\u0113juma.";
      }

      return "Ieteicams turpin\u0101t nov\u0113ro\u0161anu pie \u0123imenes \u0101rsta un preciz\u0113t t\u0101l\u0101ko \u0101rst\u0113\u0161anas vai izmekl\u0113jumu pl\u0101nu atbilsto\u0161i kl\u012bniskajai situ\u0101cijai.";
    case "doctor_fill_attached_documents":
      return [
        diagnoses ? "Ambulator\u0101s kartes izraksts ar aktu\u0101laj\u0101m diagnoz\u0113m" : "",
        labResults ? "Laboratorisko un instrument\u0101lo izmekl\u0113jumu kopijas" : "",
        visitSummary ? "Speci\u0101listu konsult\u0101ciju atzinumu kopijas" : "",
      ]
        .filter(Boolean)
        .join(";\n");
    case "doctor_fill_additional_notes":
      if (templateId === "vaccination_pass_entries") {
        return `Vakcin\u0101cijas v\u0113stur\u0113 sist\u0113m\u0101 atrasti \u0161\u0101di ieraksti: ${vaccinationHistory || "ieraksti nav pieejami"}. Nepiecie\u0161am\u012bbas gad\u012bjum\u0101 preciz\u0113t inform\u0101ciju ar pacienta dokumentiem.`;
      }

      if (templateId === "weapons_possession_certificate") {
        return `Pamatojoties uz pieejamajiem sist\u0113mas datiem, nepiecie\u0161ams \u0101rsta gala atzinums par vesel\u012bbas atbilst\u012bbu izzi\u0146as izsnieg\u0161anai. ${diagnoses ? `Aktu\u0101l\u0101s diagnozes: ${diagnoses}.` : ""}`.trim();
      }

      return `${labResults ? `Pieejamie rezult\u0101ti: ${labResults}. ` : ""}${medications ? `Sist\u0113m\u0101 re\u0123istr\u0113tie medikamenti: ${medications}. ` : ""}L\u016bdzu, preciz\u0113jiet formul\u0113jumu atbilsto\u0161i kl\u012bniskajai situ\u0101cijai.`.trim();
    default:
      return "";
  }
}

function buildSuggestedValue(key: string, data: PatientDocumentData) {
  switch (key) {
    case "patient_full_name":
      return data.patient.fullName;
    case "patient_personal_code":
      return data.patient.personalCode;
    case "patient_birth_date":
      return data.patient.birthDate;
    case "patient_age":
      return `${data.patient.age} gadi`;
    case "patient_gender":
      return data.patient.gender === "male" ? "V\u012brietis" : "Sieviete";
    case "patient_gender_vdeavk":
      return data.patient.gender === "male"
        ? "\u2611 v\u012brietis   \u2610 sieviete"
        : "\u2610 v\u012brietis   \u2611 sieviete";
    case "doctor_name":
      return data.doctor.name;
    case "practice_name":
      return data.practice.name;
    case "practice_registration_number":
      return data.practice.registrationNumber;
    case "today_date":
      return todayDate();
    case "active_diagnoses":
      return data.clinicalData.activeDiagnoses
        .map((item) => `${item.code} \u2014 ${item.name}`)
        .join("; ");
    case "diagnosis_summary":
      return data.clinicalData.activeDiagnoses
        .map((item) => `${item.code} \u2014 ${item.name}`)
        .join("; ");
    case "medications":
      return data.clinicalData.medications.join("; ");
    case "lab_results":
      return data.clinicalData.labResults.join("; ");
    case "sick_leave_periods":
      return data.clinicalData.sickLeavePeriods.join("; ");
    case "visit_summary":
      return data.clinicalData.latestVisits.join(" ");
    case "vaccination_history":
      return data.clinicalData.vaccinations.join("; ");
    default:
      return "";
  }
}

function deriveFieldStatus(
  templateStatus: TemplateFieldStatus,
  key: string,
  value: string,
): TemplateFieldStatus {
  if (templateStatus === "doctor_required") {
    return "doctor_required";
  }

  if (templateStatus === "auto" && value) {
    return "auto";
  }

  if (templateStatus === "needs_confirmation" && value) {
    return "needs_confirmation";
  }

  if (
    !value &&
    (key === "lab_results" ||
      key === "vaccination_history" ||
      key === "sick_leave_periods")
  ) {
    return "missing";
  }

  return templateStatus;
}

function buildDraftFields(
  template: DocumentTemplate,
  data: PatientDocumentData,
): PreparedDraftField[] {
  return [...template.fields]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((field) => {
      const value =
        field.source === "doctor"
          ? buildDoctorSuggestedValue(template.id, field.key, data) ||
            buildSuggestedValue(field.key, data)
          : buildSuggestedValue(field.key, data);
      const status = deriveFieldStatus(field.status, field.key, value);

      return {
        key: field.key,
        label: field.label,
        value,
        source: field.source,
        required: field.required,
        editable: field.editable,
        status,
        inputType: field.inputType,
        options: field.options,
        confirmedByDoctor: status === "auto" || Boolean(value.trim()),
        placeholder: field.placeholder,
      };
    });
}

function buildWarnings(fields: PreparedDraftField[]) {
  const warnings = [];

  const missingFieldCount = fields.filter((field) => field.status === "missing").length;
  const confirmationCount = fields.filter(
    (field) =>
      field.status === "needs_confirmation" ||
      field.status === "doctor_required",
  ).length;

  if (missingFieldCount > 0) {
    warnings.push({
      type: "missing" as const,
      message: "Trūkst daļa datu. Pirms ģenerēšanas pārbaudiet un papildiniet obligātos laukus.",
    });
  }

  if (confirmationCount > 0) {
    warnings.push({
      type: "confirmation" as const,
      message: "Daļa lauku ir ieteikti no sistēmas un tiem nepieciešams ārsta apstiprinājums.",
    });
  }

  return warnings;
}

function toDraftFieldRecord(
  draftId: string,
  field: PreparedDraftField,
): DocumentDraftFieldRecord {
  return {
    id: makeId("draft_field"),
    draftId,
    key: field.key,
    label: field.label,
    value: field.value,
    source: field.source,
    required: field.required,
    editable: field.editable,
    status: field.status,
    confirmedByDoctor: field.confirmedByDoctor,
    updatedAt: new Date().toISOString(),
  };
}

function ensureTemplateExists(templateId: string) {
  const template = documentTemplateMap[templateId];
  if (!template) {
    throw new Error("template_not_found");
  }
  return template;
}

function buildFileName(pattern: string, data: Record<string, string>) {
  return pattern.replace(/\{\{(.*?)\}\}/g, (_, key: string) => {
    return slugifyFilePart(data[key.trim()] ?? "");
  });
}

function shouldIncludeFieldValueInDocument(field: DocumentDraftFieldRecord) {
  return true;
}

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const WORD_2010_NS = "http://schemas.microsoft.com/office/word/2010/wordml";
const XML_NS = "http://www.w3.org/XML/1998/namespace";

const vdeavkReasonOptions = [
  "Prognozējamās invaliditātes ekspertīzei",
  "Invaliditātes un darbspēju ekspertīzei",
  "Īpašas kopšanas medicīnisko indikāciju ekspertīzei",
  "Vieglā automobiļa speciālās pielāgošanas un pabalsta saņemšanas transporta izdevumu kompensēšanai medicīnisko indikāciju ekspertīzei",
  "Pavadoņa pakalpojuma saņemšanas ekspertīzei",
  "Atzinuma sniegšanai par darbnespējas lapas pagarināšanu pārejošas darbnespējas periodā",
  "Cits iemesls",
] as const;

function isElement(node: Node | ChildNode | null): node is Element {
  return Boolean(node && node.nodeType === 1);
}

function getDirectChildrenByLocalName(parent: Element, localName: string) {
  return Array.from(parent.childNodes).filter(
    (node): node is Element => isElement(node) && node.localName === localName,
  );
}

function getWordText(node: Element) {
  return Array.from(node.getElementsByTagNameNS(WORD_NS, "t"))
    .map((item) => item.textContent ?? "")
    .join("");
}

function getBodyTables(body: Element) {
  return Array.from(body.childNodes).filter(
    (node): node is Element => isElement(node) && node.localName === "tbl",
  );
}

function getTableRows(table: Element) {
  return getDirectChildrenByLocalName(table, "tr");
}

function getTableCells(row: Element) {
  return getDirectChildrenByLocalName(row, "tc");
}

function ensureParagraph(container: Element, xmlDocument: XMLDocument, index = 0) {
  const paragraphs = getDirectChildrenByLocalName(container, "p");
  while (paragraphs.length <= index) {
    const paragraph = xmlDocument.createElementNS(WORD_NS, "w:p");
    container.appendChild(paragraph);
    paragraphs.push(paragraph);
  }
  return paragraphs[index];
}

function setParagraphText(
  paragraph: Element,
  value: string,
  xmlDocument: XMLDocument,
) {
  Array.from(paragraph.childNodes).forEach((node) => {
    if (isElement(node) && node.localName === "pPr") {
      return;
    }
    paragraph.removeChild(node);
  });

  const lines = (value || "").split(/\r?\n/);

  lines.forEach((line, index) => {
    if (index > 0) {
      const breakRun = xmlDocument.createElementNS(WORD_NS, "w:r");
      breakRun.appendChild(xmlDocument.createElementNS(WORD_NS, "w:br"));
      paragraph.appendChild(breakRun);
    }

    const run = xmlDocument.createElementNS(WORD_NS, "w:r");
    const text = xmlDocument.createElementNS(WORD_NS, "w:t");
    text.setAttributeNS(XML_NS, "xml:space", "preserve");
    text.textContent = line;
    run.appendChild(text);
    paragraph.appendChild(run);
  });
}

function setCellText(
  cell: Element,
  value: string,
  xmlDocument: XMLDocument,
  paragraphIndex = 0,
) {
  const paragraph = ensureParagraph(cell, xmlDocument, paragraphIndex);
  setParagraphText(paragraph, value, xmlDocument);
}

function appendParagraphLine(
  paragraph: Element,
  value: string,
  xmlDocument: XMLDocument,
) {
  if (!value) {
    return;
  }

  const breakRun = xmlDocument.createElementNS(WORD_NS, "w:r");
  breakRun.appendChild(xmlDocument.createElementNS(WORD_NS, "w:br"));
  paragraph.appendChild(breakRun);

  const valueRun = xmlDocument.createElementNS(WORD_NS, "w:r");
  const valueText = xmlDocument.createElementNS(WORD_NS, "w:t");
  valueText.setAttributeNS(XML_NS, "xml:space", "preserve");
  valueText.textContent = value;
  valueRun.appendChild(valueText);
  paragraph.appendChild(valueRun);
}

function fillEmptyCellsWithCharacters(
  row: Element,
  value: string,
  xmlDocument: XMLDocument,
) {
  const cells = getTableCells(row).filter((cell) => !getWordText(cell).trim());
  const characters = Array.from(value);

  cells.forEach((cell, index) => {
    setCellText(cell, characters[index] ?? "", xmlDocument);
  });
}

function setCheckboxState(checkbox: Element, checked: boolean) {
  const checkedElement = checkbox.getElementsByTagNameNS(WORD_2010_NS, "checked")[0];
  if (checkedElement) {
    checkedElement.setAttributeNS(WORD_2010_NS, "w14:val", checked ? "1" : "0");
  }

  const textNode = checkbox.getElementsByTagNameNS(WORD_NS, "t")[0];
  if (textNode) {
    textNode.textContent = checked ? "☒" : "☐";
  }
}

function parseDiagnosesForVdeavk(
  value: string,
  fallbackDiagnoses: PatientDocumentData["clinicalData"]["activeDiagnoses"],
) {
  const entries = value
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  const parsedEntries = entries
    .map((entry) => {
      const match = entry.match(/^([A-ZĀ-Ž]\d+(?:\.\d+)?)\s*[—-]\s*(.+)$/i);
      if (!match) {
        return null;
      }

      return {
        code: match[1].trim(),
        name: match[2].trim(),
      };
    })
    .filter((item): item is { code: string; name: string } => Boolean(item));

  if (parsedEntries.length > 0) {
    return {
      diagnosesText: parsedEntries.map((item) => item.name).join("\n"),
      diagnosisCodesText: parsedEntries.map((item) => item.code).join("\n"),
    };
  }

  if (fallbackDiagnoses.length > 0) {
    return {
      diagnosesText: fallbackDiagnoses.map((item) => item.name).join("\n"),
      diagnosisCodesText: fallbackDiagnoses.map((item) => item.code).join("\n"),
    };
  }

  return {
    diagnosesText: value,
    diagnosisCodesText: "",
  };
}

function parseReferralReasonSelection(value: string) {
  const normalizedLines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const checked = new Array(vdeavkReasonOptions.length).fill(false);
  let customReason = "";

  normalizedLines.forEach((line) => {
    const isChecked = /^[☑☒✅✔■xX]/.test(line);
    vdeavkReasonOptions.forEach((option, index) => {
      if (!line.includes(option)) {
        return;
      }

      checked[index] = isChecked;

      if (option === "Cits iemesls") {
        customReason = line
          .replace(/^[☑☒✅✔■xX☐]\s*/, "")
          .replace(/^Cits iemesls[:\s-]*/i, "")
          .trim();
      }
    });
  });

  if (!checked.some(Boolean)) {
    checked[1] = true;
  }

  return { checked, customReason };
}

function fillVdeavkTemplate(
  templateBinary: Uint8Array,
  dataMap: Record<string, string>,
  patientData: PatientDocumentData,
) {
  const zip = new PizZip(templateBinary);
  const documentXmlFile = zip.file("word/document.xml");
  const documentXml = documentXmlFile?.asText();

  if (!documentXml) {
    throw new Error("template_file_missing");
  }

  const xmlDocument = new DOMParser().parseFromString(documentXml, "application/xml");
  const serializer = new XMLSerializer();
  const body = xmlDocument.getElementsByTagNameNS(WORD_NS, "body")[0];

  if (!body) {
    throw new Error("template_file_missing");
  }

  const paragraphs = Array.from(body.childNodes).filter(
    (node): node is Element => isElement(node) && node.localName === "p",
  );
  const tables = getBodyTables(body);

  appendParagraphLine(paragraphs[4], dataMap.practice_name ?? "", xmlDocument);

  fillEmptyCellsWithCharacters(
    getTableRows(tables[0])[0],
    (dataMap.practice_registration_number ?? "").replace(/\D/g, ""),
    xmlDocument,
  );

  setCellText(
    getTableCells(getTableRows(tables[1])[0])[1],
    dataMap.patient_full_name ?? "",
    xmlDocument,
  );

  fillEmptyCellsWithCharacters(
    getTableRows(tables[2])[0],
    (dataMap.patient_personal_code ?? "").replace(/\D/g, ""),
    xmlDocument,
  );

  const genderCheckboxes = Array.from(tables[3].getElementsByTagNameNS(WORD_NS, "sdt"));
  const isMale = patientData.patient.gender === "male";
  setCheckboxState(genderCheckboxes[0], isMale);
  setCheckboxState(genderCheckboxes[1], !isMale);

  const { diagnosesText, diagnosisCodesText } = parseDiagnosesForVdeavk(
    dataMap.active_diagnoses ?? "",
    patientData.clinicalData.activeDiagnoses,
  );
  const diagnosisRowCells = getTableCells(getTableRows(tables[4])[2]);
  setCellText(diagnosisRowCells[0], diagnosesText, xmlDocument);
  setCellText(diagnosisRowCells[1], diagnosisCodesText, xmlDocument);

  setCellText(
    getTableCells(getTableRows(tables[5])[1])[0],
    dataMap.doctor_fill_health_description ?? "",
    xmlDocument,
  );
  setCellText(
    getTableCells(getTableRows(tables[6])[1])[0],
    dataMap.lab_results ?? "",
    xmlDocument,
  );
  setCellText(
    getTableCells(getTableRows(tables[7])[1])[0],
    dataMap.sick_leave_periods ?? "",
    xmlDocument,
  );
  setCellText(
    getTableCells(getTableRows(tables[8])[1])[0],
    dataMap.doctor_fill_functional_limitations ?? "",
    xmlDocument,
  );

  const referralReason = parseReferralReasonSelection(
    dataMap.doctor_fill_referral_reason ?? "",
  );
  const referralReasonCheckboxes = Array.from(
    tables[9].getElementsByTagNameNS(WORD_NS, "sdt"),
  );
  referralReasonCheckboxes.forEach((checkbox, index) => {
    setCheckboxState(checkbox, referralReason.checked[index] ?? false);
  });

  if (referralReason.customReason) {
    const customReasonCell = getTableCells(getTableRows(tables[9])[6])[0];
    const customReasonParagraph = ensureParagraph(customReasonCell, xmlDocument);
    const textNodes = Array.from(customReasonParagraph.getElementsByTagNameNS(WORD_NS, "t"));
    const underlineNode = textNodes.find((node) =>
      (node.textContent ?? "").includes("________________"),
    );
    if (underlineNode) {
      const templateUnderline = underlineNode.textContent ?? "";
      underlineNode.textContent = `${referralReason.customReason} ${templateUnderline}`.slice(
        0,
        templateUnderline.length,
      );
    }
  }

  fillEmptyCellsWithCharacters(
    getTableRows(tables[9])[7],
    (dataMap.today_date ?? "").replace(/\D/g, ""),
    xmlDocument,
  );

  const preparedByCells = getTableCells(getTableRows(tables[10])[0]);
  setCellText(preparedByCells[1], dataMap.doctor_name ?? "", xmlDocument, 0);

  setCellText(
    getTableCells(getTableRows(tables[11])[1])[0],
    dataMap.doctor_fill_attached_documents ?? "",
    xmlDocument,
  );

  zip.file("word/document.xml", serializer.serializeToString(xmlDocument));

  return zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

async function fetchTemplateBinary(templatePath: string) {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error("template_file_missing");
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function buildRenderedDraftDocument(
  draftId: string,
): Promise<{ blob: Blob; fileName: string }> {
  const draft = draftStore.get(draftId);
  const draftFields = draftFieldStore.get(draftId);

  if (!draft || !draftFields) {
    throw new Error("draft_not_found");
  }

  const template = ensureTemplateExists(draft.templateId);
  const patientData = await getPatientDocumentData(draft.patientId);
  const dataMap = Object.fromEntries(
    draftFields.map((field) => [
      field.key,
      shouldIncludeFieldValueInDocument(field) ? field.value || "" : "",
    ]),
  ) as Record<string, string>;

  dataMap.patient_first_name = patientData.patient.firstName;
  dataMap.patient_last_name = patientData.patient.lastName;

  const fileName = buildFileName(template.outputFileNamePattern, dataMap);
  const templateBinary = await fetchTemplateBinary(template.templateFilePath);

  if (template.id === "vdeavk_work_ability_referral") {
    const blob = fillVdeavkTemplate(templateBinary, dataMap, patientData);
    return { blob, fileName };
  }

  const zip = new PizZip(templateBinary);

  const doc = new Docxtemplater(zip, {
    delimiters: {
      start: "{{",
      end: "}}",
    },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(dataMap);

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });

  return { blob, fileName };
}

export async function listDocumentTemplates(): Promise<DocumentTemplateSummary[]> {
  return documentTemplates.map(({ id, title, description, category }) => ({
    id,
    title,
    description,
    category,
  }));
}

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  const normalizedQuery = normalizeText(query.trim());

  const results = patients
    .filter((patient) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeText(
        `${patient.name} ${patient.personalCode} ${patient.email} ${patient.phone}`,
      );

      return haystack.includes(normalizedQuery);
    })
    .slice(0, 8)
    .map((patient) => ({
      id: patient.id,
      fullName: patient.name,
      personalCode: patient.personalCode,
      age: patient.age,
    }));

  return results;
}

export async function getPatientDocumentData(
  patientId: string,
): Promise<PatientDocumentData> {
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) {
    throw new Error("patient_not_found");
  }

  return mapPatientToDocumentData(patient);
}

export async function prepareDocumentTemplate(
  templateId: string,
  patientId: string,
): Promise<PreparedDocumentDraft> {
  const template = ensureTemplateExists(templateId);
  const patientData = await getPatientDocumentData(patientId);
  const draftId = makeId("draft");
  const fields = buildDraftFields(template, patientData);
  const warnings = buildWarnings(fields);

  draftStore.set(draftId, {
    id: draftId,
    templateId,
    patientId,
    doctorId: registeredDoctorAccount.id,
    status: "needs_doctor_input",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  draftFieldStore.set(
    draftId,
    fields.map((field) => toDraftFieldRecord(draftId, field)),
  );

  return {
    draftId,
    templateId,
    patientId,
    fields,
    warnings,
  };
}

export async function updateDocumentDraft(
  draftId: string,
  payload: UpdateDraftRequest,
): Promise<{ draftId: string; status: "updated" }> {
  const draft = draftStore.get(draftId);
  const draftFields = draftFieldStore.get(draftId);

  if (!draft || !draftFields) {
    throw new Error("draft_not_found");
  }

  const nextFields = draftFields.map((field) => {
    const nextValue = payload.fields[field.key];
    const resolvedValue = nextValue ?? field.value;
    const confirmedByDoctor =
      field.status === "needs_confirmation" ||
      field.status === "doctor_required"
        ? Boolean(resolvedValue.trim())
        : field.confirmedByDoctor;

    return {
      ...field,
      value: resolvedValue,
      confirmedByDoctor,
      updatedAt: new Date().toISOString(),
    };
  });

  draft.updatedAt = new Date().toISOString();
  draftFields.length = 0;
  draftFields.push(...nextFields);
  draftFieldStore.set(draftId, draftFields);

  return {
    draftId,
    status: "updated",
  };
}

export function validateDraftBeforeGeneration(draftId: string) {
  const draftFields = draftFieldStore.get(draftId);
  const draft = draftStore.get(draftId);

  if (!draft || !draftFields) {
    throw new Error("draft_not_found");
  }

  const missingRequiredFields = draftFields.filter(
    (field) =>
      field.required &&
      !field.value.trim(),
  );

  if (missingRequiredFields.length > 0) {
    return {
      ok: false as const,
      error: "missing_required_fields",
      message: "Lai sagatavotu dokumentu, aizpildiet visus obligātos laukus.",
      fields: missingRequiredFields.map((field) => field.key),
    };
  }

  return { ok: true as const };

  const unconfirmedRequiredFields = draftFields.filter(
    (field) =>
      field.required &&
      (field.status === "needs_confirmation" ||
        field.status === "doctor_required") &&
      !field.confirmedByDoctor,
  );

  if (unconfirmedRequiredFields.length > 0) {
    return {
      ok: false as const,
      error: "unconfirmed_required_fields",
      message:
        "Lai sagatavotu dokumentu, apstipriniet ārsta pārbaudē visus obligātos pārskatāmos laukus.",
      fields: unconfirmedRequiredFields.map((field) => field.key),
    };
  }

  return { ok: true as const };
}

export async function generateDocumentDraft(
  draftId: string,
): Promise<GenerateDraftResponse> {
  const draft = draftStore.get(draftId);
  const draftFields = draftFieldStore.get(draftId);

  if (!draft || !draftFields) {
    throw new Error("draft_not_found");
  }

  const validation = validateDraftBeforeGeneration(draftId);
  if (!validation.ok) {
    throw validation;
  }

  const { blob, fileName } = await buildRenderedDraftDocument(draftId);

  const fileId = makeId("file");
  const objectUrl = URL.createObjectURL(blob);

  generatedFileStore.set(fileId, {
    id: fileId,
    draftId,
    fileName,
    filePath: template.templateFilePath,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    createdAt: new Date().toISOString(),
    blob,
    objectUrl,
  });

  draft.status = "generated";
  draft.generatedFileId = fileId;
  draft.updatedAt = new Date().toISOString();

  auditLogStore.push({
    doctorId: draft.doctorId,
    patientId: draft.patientId,
    templateId: draft.templateId,
    draftId,
    generatedFileId: fileId,
    timestamp: new Date().toISOString(),
    autoFilledFields: draftFields
      .filter((field) => field.source !== "doctor")
      .map((field) => field.key),
    doctorEditedFields: draftFields
      .filter((field) => field.source === "doctor" || field.confirmedByDoctor)
      .map((field) => field.key),
  });

  return {
    fileId,
    fileName,
    downloadUrl: `/api/files/${fileId}/download`,
  };
}

export async function generateDocumentPreviewBlob(draftId: string) {
  const { blob } = await buildRenderedDraftDocument(draftId);
  return blob;
}

export function downloadGeneratedFile(fileId: string) {
  const file = generatedFileStore.get(fileId);
  if (!file) {
    throw new Error("file_not_found");
  }

  const link = document.createElement("a");
  link.href = file.objectUrl;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getPreparedDraft(draftId: string): PreparedDocumentDraft | null {
  const draft = draftStore.get(draftId);
  const draftFields = draftFieldStore.get(draftId);
  if (!draft || !draftFields) {
    return null;
  }

  return {
    draftId,
    templateId: draft.templateId,
    patientId: draft.patientId,
    fields: draftFields.map((field) => ({
      key: field.key,
      label: field.label,
      value: field.value,
      source: field.source,
      required: field.required,
      editable: field.editable,
      status: field.status,
      confirmedByDoctor: field.confirmedByDoctor,
      placeholder:
        documentTemplateMap[draft.templateId].fields.find(
          (item) => item.key === field.key,
        )?.placeholder ?? `{{${field.key}}}`,
      inputType: documentTemplateMap[draft.templateId].fields.find(
        (item) => item.key === field.key,
      )?.inputType,
      options: documentTemplateMap[draft.templateId].fields.find(
        (item) => item.key === field.key,
      )?.options,
    })),
    warnings: buildWarnings(
      draftFields.map((field) => ({
        ...field,
        placeholder: `{{${field.key}}}`,
        inputType: documentTemplateMap[draft.templateId].fields.find(
          (item) => item.key === field.key,
        )?.inputType,
        options: documentTemplateMap[draft.templateId].fields.find(
          (item) => item.key === field.key,
        )?.options,
      })),
    ),
  };
}

export function getAuditLogs() {
  return auditLogStore;
}
