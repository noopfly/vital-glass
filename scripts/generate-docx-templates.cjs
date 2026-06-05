const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");

const templatesDir = path.resolve(__dirname, "../public/templates");
fs.mkdirSync(templatesDir, { recursive: true });

const commonFields = [
  { label: "Pacienta vārds, uzvārds", placeholder: "{{patient_full_name}}" },
  { label: "Personas kods", placeholder: "{{patient_personal_code}}" },
  { label: "Dzimšanas datums", placeholder: "{{patient_birth_date}}" },
  { label: "Vecums", placeholder: "{{patient_age}}" },
  { label: "Dzimums", placeholder: "{{patient_gender}}" },
  { label: "Ārsta vārds", placeholder: "{{doctor_name}}" },
  { label: "Prakses nosaukums", placeholder: "{{practice_name}}" },
  {
    label: "Prakses reģistrācijas numurs",
    placeholder: "{{practice_registration_number}}",
  },
  { label: "Sagatavošanas datums", placeholder: "{{today_date}}" },
];

const templates = [
  {
    fileName: "vdeavk_work_ability_referral.docx",
    title: "Darba nespējas ekspertīzes nosūtījums VDEĀVK",
    description: "Nosūtījuma melnraksts darba nespējas ekspertīzei.",
    fields: [
      { label: "Aktīvās diagnozes", placeholder: "{{active_diagnoses}}" },
      { label: "Izmeklējumu rezultāti", placeholder: "{{lab_results}}" },
      { label: "Pamatojums nosūtījumam", placeholder: "{{doctor_fill_reason}}" },
      {
        label: "Funkcionālie ierobežojumi",
        placeholder: "{{doctor_fill_functional_limitations}}",
      },
      {
        label: "Rekomendācijas",
        placeholder: "{{doctor_fill_recommendations}}",
      },
    ],
  },
  {
    fileName: "vaccination_pass_entries.docx",
    title: "Vakcinācijas pases ieraksti",
    description: "Vakcinācijas vēstures ierakstu sagatave.",
    fields: [
      {
        label: "Vakcinācijas vēsture",
        placeholder: "{{vaccination_history}}",
      },
      {
        label: "Papildu piezīmes",
        placeholder: "{{doctor_fill_additional_notes}}",
      },
    ],
  },
  {
    fileName: "ambulatory_extract_027u.docx",
    title: "Izraksts no ambulatorā pacienta kartes (Veidlapa Nr. 027/u)",
    description: "Pacienta ambulatorās ārstēšanas kopsavilkums.",
    fields: [
      {
        label: "Diagnožu kopsavilkums",
        placeholder: "{{diagnosis_summary}}",
      },
      { label: "Medikamenti", placeholder: "{{medications}}" },
      { label: "Vizītes kopsavilkums", placeholder: "{{visit_summary}}" },
      { label: "Nosūtīšanas iemesls", placeholder: "{{doctor_fill_reason}}" },
    ],
  },
  {
    fileName: "driver_medical_certificate.docx",
    title: "Autovadītāju medicīniskā izziņa",
    description: "Izziņas sagatave transportlīdzekļa vadītājam.",
    fields: [
      { label: "Aktīvās diagnozes", placeholder: "{{active_diagnoses}}" },
      {
        label: "Ārsta secinājums",
        placeholder: "{{doctor_fill_recommendations}}",
      },
    ],
  },
  {
    fileName: "weapons_possession_certificate.docx",
    title: "Izziņa ieroču glabāšanai un nēsāšanai",
    description: "Izziņas sagatave veselības atbilstībai.",
    fields: [
      { label: "Aktīvās diagnozes", placeholder: "{{active_diagnoses}}" },
      {
        label: "Ārsta secinājums",
        placeholder: "{{doctor_fill_recommendations}}",
      },
      {
        label: "Papildu piezīmes",
        placeholder: "{{doctor_fill_additional_notes}}",
      },
    ],
  },
  {
    fileName: "sports_pool_certificate.docx",
    title: "Izziņa sporta sekcijai vai baseinam",
    description: "Izziņas sagatave fiziskas slodzes izvērtēšanai.",
    fields: [
      { label: "Aktīvās diagnozes", placeholder: "{{active_diagnoses}}" },
      {
        label: "Ārsta rekomendācijas",
        placeholder: "{{doctor_fill_recommendations}}",
      },
    ],
  },
  {
    fileName: "education_excuse_certificate.docx",
    title: "Attaisnojoša izziņa izglītības iestādei",
    description: "Izziņas sagatave prombūtnes vai atbrīvojuma apliecināšanai.",
    fields: [
      { label: "Vizītes kopsavilkums", placeholder: "{{visit_summary}}" },
      { label: "Pamatojums", placeholder: "{{doctor_fill_reason}}" },
      {
        label: "Papildu piezīmes",
        placeholder: "{{doctor_fill_additional_notes}}",
      },
    ],
  },
  {
    fileName: "mandatory_health_check_ovp.docx",
    title: "Obligātās veselības pārbaudes karte — OVP",
    description: "Atzinuma sagatave darbinieka veselības novērtēšanai.",
    fields: [
      { label: "Aktīvās diagnozes", placeholder: "{{active_diagnoses}}" },
      {
        label: "Darba vides riska faktori",
        placeholder: "{{doctor_fill_reason}}",
      },
      {
        label: "Rekomendācijas",
        placeholder: "{{doctor_fill_recommendations}}",
      },
    ],
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFieldRow(field) {
  return `
<w:tr>
  <w:tc>
    <w:tcPr>
      <w:tcW w:w="3400" w:type="dxa"/>
      <w:shd w:val="clear" w:color="auto" w:fill="EEF4FA"/>
    </w:tcPr>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(field.label)}</w:t></w:r></w:p>
  </w:tc>
  <w:tc>
    <w:tcPr>
      <w:tcW w:w="6200" w:type="dxa"/>
    </w:tcPr>
    <w:p><w:r><w:t xml:space="preserve">${escapeXml(field.placeholder)}</w:t></w:r></w:p>
  </w:tc>
</w:tr>`.trim();
}

function buildDocumentXml(template) {
  const fieldRows = [...commonFields, ...template.fields]
    .map(buildFieldRow)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 wp14">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t xml:space="preserve">${escapeXml(template.title)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">${escapeXml(template.description)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Dokuments ir automātiski sagatavots melnraksts. Pirms izmantošanas ārstam jāpārbauda un jāapstiprina saturs.</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="0" w:type="auto"/>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="3400"/>
        <w:gridCol w:w="6200"/>
      </w:tblGrid>
      ${fieldRows}
    </w:tbl>
    <w:p>
      <w:r><w:t xml:space="preserve">Word veidlapas struktūra ir fiksēta. Ārsts aizpilda tikai laukus, kas paredzēti melnraksta sagatavošanai.</w:t></w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function buildCoreXml(title) {
  const timestamp = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Prakses Asistents</dc:creator>
  <cp:lastModifiedBy>Prakses Asistents</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:modified>
</cp:coreProperties>`;
}

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="30"/>
      <w:color w:val="17324D"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
        <w:left w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
        <w:right w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
        <w:insideH w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
        <w:insideV w:val="single" w:sz="8" w:space="0" w:color="D7E2EE"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Prakses Asistents</Application>
</Properties>`;

for (const template of templates) {
  const zip = new PizZip();
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.folder("_rels").file(".rels", rootRelsXml);
  zip.folder("docProps").file("app.xml", appXml);
  zip.folder("docProps").file("core.xml", buildCoreXml(template.title));
  zip.folder("word").file("document.xml", buildDocumentXml(template));
  zip.folder("word").file("styles.xml", stylesXml);
  zip.folder("word").folder("_rels").file("document.xml.rels", documentRelsXml);

  const buffer = zip.generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  fs.writeFileSync(path.join(templatesDir, template.fileName), buffer);
}
