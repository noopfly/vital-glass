import { Patient } from "@/types/patient";

export const patients: Patient[] = [
  {
    id: "1",
    name: "Jānis Bērziņš",
    personalCode: "010185-12345",
    age: 39,
    phone: "+371 20 123 456",
    email: "janis.berzins@inbox.lv",
    summary:
      "Pacientam konstatēta akūta augšējo elpceļu infekcija ar iekaisuma aktivitātes pazīmēm laboratoriskajos rādītājos. Saistībā ar klīnisko ainu ordinēta antibakteriāla terapija un simptomātiska ārstēšana. Ņemot vērā paaugstinātos glikēmijas rādītājus un sūdzības par muguras sāpēm, ieteicama atkārtota ģimenes ārsta izvērtēšana un kontroles vizīte pēc 5 dienām.",
    updatedAt: "15.04.2026, 08:15",
    diagnoses: [
      { code: "J06.9", description: "akūta augšējo elpceļu infekcija" },
      { code: "M54.5", description: "Muguras sāpes" },
    ],
    chronicDiseases: [{ code: "E11", description: "2.tipa diabets" }],
    deviations: [
      "Glikoze ↑",
      "HbA1c ↑",
      "Sūdzības par muguras sāpēm",
    ],
    riskFactors: [
      "ĶMI 31.2 kg/m² (↑)",
      "Mazkustīgs dzīvesveids",
      "Smēķēšanas anamnēze",
    ],
  },
  {
    id: "2",
    name: "Anna Kalnina",
    personalCode: "020290-67890",
    age: 34,
    phone: "+371 25 678 901",
    email: "anna.kalnina@gmail.com",
    summary:
      "Hroniska hipertensija. Pacients sanem antihipertensivos medikamentus. Kontroles vizite pec 3 menesiem.",
    updatedAt: "20.04.2026, 10:30",
    diagnoses: [{ code: "I10", description: "Esenciala hipertensija" }],
    chronicDiseases: [{ code: "I10", description: "Esenciala hipertensija" }],
    deviations: ["Asinsspiediens paaugstinats"],
    riskFactors: [
      "Paaugstinats stresa limenis",
      "Nepietiekamas fiziskas aktivitates",
    ],
  },  
];
