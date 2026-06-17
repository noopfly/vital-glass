import type { DashboardComponentKey } from "@/lib/dashboard-layout";

export interface SourceDocument {
  id: string;
  title: string;
  categoryLabel: string;
  facility: string;
  date: string;
  description: string;
  url: string;
  linkLabel: string;
  relatedDashboardKeys: DashboardComponentKey[];
  usedDocumentsGroup?: string;
  usedDocumentsTitle?: string;
  usedDocumentsSubtitle?: string;
  showInUsedDocumentsPanel?: boolean;
}

const documentBaseUrl = `${import.meta.env.BASE_URL}documents/`;

export const sourceDocumentIds = {
  predaRegistry: "preda-registry",
  laboratoryBloodPanel: "laboratory-blood-panel",
  laboratoryLeukocytePanel: "laboratory-leukocyte-panel",
  ambulatoryOverview: "ambulatory-overview",
  ambulatoryVisit: "ambulatory-visit",
  ambulatoryConclusion: "ambulatory-conclusion",
  chestXray: "chest-xray",
  ekgProtocol: "ekg-protocol",
  diabetesCard: "diabetes-card",
  dischargeSummary: "discharge-summary",
  inpatientDischarge: "inpatient-discharge",
  urineLabPanel: "urine-lab-panel",
  ePrescriptions: "e-prescriptions",
  ctKnee: "ct-knee",
  mriHead: "mri-head",
  abdominalUsg: "abdominal-usg",
} as const;

export const dashboardSourceDocuments: SourceDocument[] = [
  {
    id: sourceDocumentIds.predaRegistry,
    title: "PREDA",
    categoryLabel: "Reģistri",
    facility: "Slimību reģistri",
    date: "2026-06-11",
    description:
      "Iedzimtu traucējumu un citu slimību reģistra ieraksti pacienta klīniskā profila precizēšanai.",
    url: `${documentBaseUrl}preda-2026-06-11.html`,
    linkLabel: "Skatīt PREDA ierakstu",
    relatedDashboardKeys: ["patientCard"],
    usedDocumentsGroup: "Reģistri un kartes",
    usedDocumentsTitle: "PREDA",
    usedDocumentsSubtitle: "11.06.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.laboratoryBloodPanel,
    title: "Laboratorijas pārskats",
    categoryLabel: "Laboratorija",
    facility: "E. Gulbja laboratorija",
    date: "2026-06-14",
    description:
      "Kritisku laboratorisko noviržu pārskats ar ļoti augstām un ļoti zemām vērtībām.",
    url: `${documentBaseUrl}laboratorijas-izraksts-2026-04-14.html`,
    linkLabel: "Skatīt laboratorijas pārskatu",
    relatedDashboardKeys: [
      "healthTrends",
      "alertsCard",
      "eventTimeline",
      "patientCard",
    ],
    usedDocumentsGroup: "Laboratorijas rezultāti",
    usedDocumentsTitle: "E. Gulbja laboratorija",
    usedDocumentsSubtitle: "14.06.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.laboratoryLeukocytePanel,
    title: "Laboratorijas pārskats",
    categoryLabel: "Laboratorija",
    facility: "Centrālā laboratorija",
    date: "2026-06-12",
    description:
      "Papildu kritisko laboratorisko rezultātu izraksts salīdzināšanai dinamikā.",
    url: `${documentBaseUrl}laboratorijas-kontrole-2026-06-12.html`,
    linkLabel: "Skatīt laboratorijas pārskatu",
    relatedDashboardKeys: ["healthTrends", "alertsCard", "patientCard"],
    usedDocumentsGroup: "Laboratorijas rezultāti",
    usedDocumentsTitle: "Centrālā laboratorija",
    usedDocumentsSubtitle: "12.06.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.ambulatoryOverview,
    title: "Ambulatorais pārskats",
    categoryLabel: "Vizīte",
    facility: "Ģimenes ārsta prakse - Dr. I. Bērziņa",
    date: "2026-05-05",
    description:
      "Ambulatorās piezīmes ar novērojumiem, terapijas korekciju un turpmāko plānu.",
    url: `${documentBaseUrl}ambulatorais-parskats-2026-05-05.html`,
    linkLabel: "Skatīt ambulatoro pārskatu",
    relatedDashboardKeys: ["patientCard", "preventionCard", "medicationTable"],
    usedDocumentsGroup: "Izraksti un slēdzieni",
    usedDocumentsTitle: "Ambulatorais pārskats",
    usedDocumentsSubtitle: "05.05.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.ambulatoryVisit,
    title: "Ambulatorās vizītes protokols",
    categoryLabel: "Vizīte",
    facility: "Ģimenes ārsta prakse - Dr. I. Bērziņa",
    date: "2026-04-10",
    description:
      "Ģimenes ārsta novērtējums, terapija un rekomendācijas pēc ambulatoras apskates.",
    url: `${documentBaseUrl}ambulatoras-vizites-protokols-2026-04-10.html`,
    linkLabel: "Skatīt ambulatorās vizītes protokolu",
    relatedDashboardKeys: [
      "patientCard",
      "preventionCard",
      "medicationTable",
      "eventTimeline",
    ],
  },
  {
    id: sourceDocumentIds.ambulatoryConclusion,
    title: "Ambulatorais slēdziens",
    categoryLabel: "Vizīte",
    facility: "Ģimenes ārsta prakse - Dr. I. Bērziņa",
    date: "2026-05-05",
    description:
      "Ambulatorās apskates slēdziens ar klīnisko novērtējumu un rekomendācijām.",
    url: `${documentBaseUrl}ambulatorais-sledziens-2026-05-05.html`,
    linkLabel: "Skatīt ambulatoro slēdzienu",
    relatedDashboardKeys: ["patientCard", "preventionCard", "medicationTable"],
  },
  {
    id: sourceDocumentIds.chestXray,
    title: "Vizuālās diagnostikas slēdziens",
    categoryLabel: "Attēldiagnostika",
    facility: "Diagnostikas centrs",
    date: "2026-04-02",
    description:
      "Vizuālās diagnostikas apraksts un secinājumi no attēldiagnostikas izmeklējuma.",
    url: `${documentBaseUrl}vizualas-diagnostikas-sledziens-2026-04-02.html`,
    linkLabel: "Skatīt vizuālās diagnostikas slēdzienu",
    relatedDashboardKeys: ["medicalImagingViewer", "eventTimeline"],
    usedDocumentsGroup: "Izraksti un slēdzieni",
    usedDocumentsTitle: "Vizuālās diagnostikas slēdziens",
    usedDocumentsSubtitle: "02.04.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.ekgProtocol,
    title: "EKG protokols",
    categoryLabel: "Procedūra",
    facility: "Rīgas 1. slimnīca",
    date: "2026-03-25",
    description: "12 novadījumu EKG izmeklējuma rezultāts.",
    url: `${documentBaseUrl}ekg-protokols-2026-03-25.html`,
    linkLabel: "Skatīt EKG protokolu",
    relatedDashboardKeys: ["eventTimeline", "patientCard"],
    usedDocumentsGroup: "Citi",
    usedDocumentsTitle: "EKG protokols",
    usedDocumentsSubtitle: "25.03.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.diabetesCard,
    title: "Diabēta karte",
    categoryLabel: "Karte",
    facility: "Diabēta aprūpes programma",
    date: "2026-05-28",
    description:
      "Diabēta aprūpes kartes ieraksti ar HbA1c, komplikāciju un terapijas uzskaiti.",
    url: `${documentBaseUrl}diabeta-karte-2026-05-28.html`,
    linkLabel: "Skatīt diabēta karti",
    relatedDashboardKeys: ["patientCard", "healthTrends", "preventionCard"],
    usedDocumentsGroup: "Reģistri un kartes",
    usedDocumentsTitle: "Diabēta karte",
    usedDocumentsSubtitle: "28.05.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.dischargeSummary,
    title: "Vienkāršotais izraksts-epikrīze",
    categoryLabel: "Stacionārs",
    facility: "Paula Stradiņa klīniskā universitātes slimnīca",
    date: "2026-03-18",
    description:
      "Vienkāršots stacionāra izraksta un epikrīzes kopsavilkums turpmākai aprūpei.",
    url: `${documentBaseUrl}vienkarsotais-izraksts-epikrizs-2026-03-18.html`,
    linkLabel: "Skatīt vienkāršoto izrakstu-epikrīzi",
    relatedDashboardKeys: ["patientCard", "eventTimeline", "referralHistory"],
    usedDocumentsGroup: "Izraksti un slēdzieni",
    usedDocumentsTitle: "Vienkāršotais izraksts-epikrīze",
    usedDocumentsSubtitle: "18.03.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.inpatientDischarge,
    title: "Stacionāra izraksts",
    categoryLabel: "Stacionārs",
    facility: "Paula Stradiņa klīniskā universitātes slimnīca",
    date: "2026-04-12",
    description:
      "Stacionāra izraksts ar terapijas kopsavilkumu un rekomendācijām.",
    url: `${documentBaseUrl}stacionara-izraksts-2026-04-12.html`,
    linkLabel: "Skatīt stacionāra izrakstu",
    relatedDashboardKeys: ["patientCard", "eventTimeline", "referralHistory"],
  },
  {
    id: sourceDocumentIds.urineLabPanel,
    title: "Urīna analīzes izraksts",
    categoryLabel: "Laboratorija",
    facility: "VCA laboratorija",
    date: "2026-03-10",
    description:
      "Vispārējā urīna analīze ar laboratorijas secinājumiem un kvalitātes kontroli.",
    url: `${documentBaseUrl}urina-analizes-izraksts-2026-03-10.html`,
    linkLabel: "Skatīt laboratorijas izrakstu",
    relatedDashboardKeys: ["healthTrends", "alertsCard", "eventTimeline"],
  },
  {
    id: sourceDocumentIds.ePrescriptions,
    title: "E-receptes",
    categoryLabel: "Medikamenti",
    facility: "NVD e-veselība",
    date: "2026-06-13",
    description:
      "Aktīvās un nesen izrakstītās e-receptes ar izrakstīšanas datiem.",
    url: `${documentBaseUrl}e-receptes-2026-06-13.html`,
    linkLabel: "Skatīt e-receptes",
    relatedDashboardKeys: ["medicationTable", "patientCard"],
    usedDocumentsGroup: "Medikamentu dati",
    usedDocumentsTitle: "E-receptes",
    usedDocumentsSubtitle: "13.06.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.ctKnee,
    title: "CT izmeklējuma apraksts",
    categoryLabel: "Attēldiagnostika",
    facility: "Ziemeļkurzemes reģionālā slimnīca",
    date: "2026-02-19",
    description: "Kreisā ceļa datortomogrāfijas apraksts.",
    url: `${documentBaseUrl}ct-kreisais-celis-2026-02-19.html`,
    linkLabel: "Skatīt CT izmeklējuma aprakstu",
    relatedDashboardKeys: ["medicalImagingViewer"],
    usedDocumentsGroup: "Citi",
    usedDocumentsTitle: "CT izmeklējuma apraksts",
    usedDocumentsSubtitle: "19.02.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.mriHead,
    title: "MRI izmeklējuma dokuments",
    categoryLabel: "Attēldiagnostika",
    facility: "Paula Stradiņa klīniskā universitātes slimnīca",
    date: "2026-03-04",
    description: "Galvas zonas magnētiskās rezonanses izmeklējums.",
    url: `${documentBaseUrl}mri-galvas-zona-2026-03-04.pdf`,
    linkLabel: "Skatīt MRI izmeklējumu",
    relatedDashboardKeys: ["medicalImagingViewer"],
    usedDocumentsGroup: "Citi",
    usedDocumentsTitle: "MRI izmeklējuma dokuments",
    usedDocumentsSubtitle: "04.03.2026",
    showInUsedDocumentsPanel: true,
  },
  {
    id: sourceDocumentIds.abdominalUsg,
    title: "USG izmeklējuma apraksts",
    categoryLabel: "Attēldiagnostika",
    facility: "Daugavpils reģionālā slimnīca",
    date: "2026-01-27",
    description: "Vēdera dobuma ultrasonogrāfijas apraksts.",
    url: `${documentBaseUrl}usg-vedera-dobums-2026-01-27.html`,
    linkLabel: "Skatīt USG izmeklējuma aprakstu",
    relatedDashboardKeys: ["medicalImagingViewer"],
    usedDocumentsGroup: "Citi",
    usedDocumentsTitle: "USG izmeklējuma apraksts",
    usedDocumentsSubtitle: "27.01.2026",
    showInUsedDocumentsPanel: true,
  },
].sort(
  (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
);

export const dashboardSourceDocumentMap = Object.fromEntries(
  dashboardSourceDocuments.map((document) => [document.id, document]),
) as Record<(typeof sourceDocumentIds)[keyof typeof sourceDocumentIds], SourceDocument>;

export const usedDocumentsPanelDocuments = dashboardSourceDocuments.filter(
  (document) => document.showInUsedDocumentsPanel,
);
