const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'HealthReport.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 1. Replace ORGAN_SCORECARD and COMPOSITE_INDICES
const newIndices = `const COMPOSITE_INDICES = [
  { index: "Bone Health Index", score: 65, interpretation: "Moderate Risk: Bone weakening (Osteopenia risk)" },
  { index: "Stress Load Index", score: 58, interpretation: "Moderate Risk: High stress burden affecting recovery" },
  { index: "Gut Health Index", score: 60, interpretation: "Moderate Risk: Impaired digestion & microbiome imbalance" },
  { index: "Metabolic Health Index", score: 62, interpretation: "Moderate Risk: Reduced metabolic efficiency" },
  { index: "Glycemic Control Index", score: 63, interpretation: "Moderate Risk: Prediabetic tendency" },
  { index: "Cardio Risk Index", score: 82, interpretation: "Low Risk: Stable cardiac profile" },
  { index: "Hepatic Perf Index", score: 65, interpretation: "Moderate Risk: Fat accumulation / detox inefficiency" },
  { index: "Renal Vitality Index", score: 78, interpretation: "Mild Risk: Early kidney stress" },
  { index: "Thyroid Health Index", score: 72, interpretation: "Mild Risk: Suboptimal hormonal regulation" },
  { index: "Cellular Aging Index", score: 66, interpretation: "Moderate Risk: Early biological aging signs" },
  { index: "Immune Health Index", score: 68, interpretation: "Mild Risk: Reduced immune resilience" },
  { index: "Female Hormonal Index", score: 75, interpretation: "Mild Imbalance: Hormonal fluctuations present" },
  { index: "BP Stability Index", score: 76, interpretation: "Mild Risk: Early vascular instability" },
  { index: "Joint Flammation Index", score: 58, interpretation: "Moderate Risk: Inflammatory joint tendency" },
  { index: "Hemoglobin Opt Index", score: 35, interpretation: "Moderate Risk: Anemia / low oxygen limit" },
  { index: "Pancreas Health Index", score: 68, interpretation: "Mild Risk: Insulin resistance trend" },
  { index: "Inflammation Index", score: 55, interpretation: "Moderate Risk: Systemic inflammation present" },
];

const YOGA_PROTOCOL = {
  goal: "Improve metabolism, reduce stress & inflammation, support bone & hormonal health",
  daily: [
    "Asanas: Surya Namaskar, Vrikshasana, Bhujangasana, Baddha Konasana",
    "Pranayama: Anulom Vilom, Bhramari (± Kapalbhati if suitable)",
    "Meditation: 5–10 min breath awareness (Goal: Improve metabolism, reduce stress & inflammation...)",
  ],
};

const FOLLOW_UP = [
  { time: "After 8–12 Weeks", tests: "HbA1c, Fasting Glucose • CRP • Vitamin D" },
  { time: "After 3–6 Months", tests: "LFT, KFT • CBC (Hemoglobin)" },
  { time: "After 6–12 Months", tests: "Lipid Profile • Bone Density (DEXA)" },
  { time: "Index Review", tests: "Every 3–6 months" },
];`;

let startIndex = lines.findIndex(l => l.includes('const ORGAN_SCORECARD = ['));
let endIndex = lines.findIndex(l => l.includes('const BHI_RANGES = ['));
if(startIndex !== -1 && endIndex !== -1) {
    let replaced = lines.slice(0, startIndex).join('\n') + '\n' + newIndices + '\n\n' + lines.slice(endIndex).join('\n');
    content = replaced;
}

// 2. Add "reportPage7" to pageIds
content = content.replace(/"reportPage6",/g, '"reportPage6",\n        "reportPage7",');

// 3. Replace total={6} with total={7}
content = content.replace(/total=\{6\}/g, 'total={7}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Phase 1 replacement done.');
