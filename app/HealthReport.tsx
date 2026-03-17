"use client";

import React, { useCallback, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  Download,
  FileText,
  FlaskConical,
  Activity,
  Leaf,
  AlertCircle,
  ClipboardList,
  ShieldAlert,
  HeartPulse,
  BadgeCheck,
  Loader2,
  Printer,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  ReferenceLine,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from "recharts";

const PATIENT = {
  name: "Abhishek Singh",
  patientId: "AV-2026-2043",
  age: 24,
  gender: "male",
  dateOfReport: "16 Mar 2026",
};

const LAB_FINDINGS = [
  {
    test: "Vitamin D",
    yourValue: "18",
    idealRange: "30–100",
    meaning: "Deficiency affecting bone mineralization",
    ayurvedicCorrelation: "Asthi Dhatu Kshaya (Bone depletion)",
  },
  {
    test: "HbA1c",
    yourValue: "6.2",
    idealRange: "<5.7",
    meaning: "Impaired glucose metabolism (Prediabetic trend)",
    ayurvedicCorrelation: "Meda Dushti (Fat tissue) + Agni Deficiency",
  },
  {
    test: "CRP",
    yourValue: "5",
    idealRange: "<1",
    meaning: "Ongoing low-grade inflammation",
    ayurvedicCorrelation: "Ama (Toxin) accumulation + Pitta aggravation",
  },
];

const ORGAN_SCORECARD = [
  { system: "Kidney", score: 78, status: "Mild Risk", insight: "Early filtration stress" },
  { system: "Liver", score: 65, status: "Moderate Risk", insight: "Metabolic overload / detox inefficiency" },
  { system: "Thyroid", score: 72, status: "Early Risk", insight: "Suboptimal hormonal regulation" },
  { system: "Heart", score: 82, status: "Optimal", insight: "Good cardiovascular status" },
  { system: "Pancreas", score: 68, status: "Mild Risk", insight: "Insulin resistance trend" },
];

const COMPOSITE_INDICES = [
  { index: "Inflammation Index", score: 55, interpretation: "Moderate systemic inflammation" },
  { index: "Immune Health Index", score: 68, interpretation: "Mildly compromised immunity" },
  { index: "Bone Health Index", score: 65, interpretation: "Early bone weakening (Osteopenia risk)" },
  { index: "Metabolic Index", score: 62, interpretation: "Reduced metabolic efficiency" },
  { index: "Gut Health Index", score: 58, interpretation: "Impaired digestion & absorption" },
  { index: "Hormonal Health Index", score: 75, interpretation: "Mild imbalance" },
  { index: "Stress Recovery Index", score: 70, interpretation: "Moderate stress management capacity" },
];

const BHI_RANGES = [
  { range: "85–100", meaning: "Your bones are strong and healthy." },
  { range: "70–84", meaning: "Slight weakness may be starting." },
  { range: "50–69", meaning: "Bones are getting weaker. Care needed." },
  { range: "<50", meaning: "Bones are weak. High chance of fractures." },
];

// radar chart data for section 2 – built from the (now trimmed) HEALTH_SCORECARD
const RADAR_DATA = COMPOSITE_INDICES.map((h) => ({ subject: h.index, score: h.score }));

const AYURVEDA_PARAMS = [
  { name: "Agni (Digestive Power)", value: 60, desc: "Mildly impaired digestion" },
  { name: "Ama (Toxin Load)", value: 65, desc: "Moderate accumulation" },
  { name: "Ojas (Vitality Reserve)", value: 82, desc: "Good resilience" },
];

const DHATU_ASSESSMENT = [
  { name: "Rasa (Plasma/Nutrition)", value: 78, status: "Mild Deficiency", interpretation: "Suboptimal nourishment, hydration needs improvement" },
  { name: "Rakta (Blood)", value: 35, status: "Moderate Deficiency", interpretation: "Anemia, reduced oxygenation" },
  { name: "Mamsa (Muscle)", value: 82, status: "Balanced", interpretation: "Good muscle strength" },
  { name: "Meda (Fat/Metabolic Tissue)", value: 68, status: "Mild Deficiency", interpretation: "Early fat metabolism imbalance" },
  { name: "Asthi (Bone)", value: 65, status: "Moderate Deficiency", interpretation: "Bone density reduction (osteopenia risk)" },
  { name: "Majja (Nervous Tissue)", value: 72, status: "Mild Deficiency", interpretation: "Nervous system depletion / stress impact" },
  { name: "Shukra (Reproductive Tissue)", value: 80, status: "Near Optimal", interpretation: "Good reproductive vitality" },
];

const PREDICTIVE_RISK = [
  { area: "Prediabetes Progression", probability: "Moderate", interpretation: "Needs metabolic correction" },
  { area: "Bone Loss (Osteopenia)", probability: "Moderate", interpretation: "Risk of future osteoporosis" },
  { area: "Cardiovascular Risk", probability: "Mild", interpretation: "Preventive care needed" },
  { area: "Chronic Inflammation", probability: "Moderate", interpretation: "Long-term disease trigger" },
];

const NUTRITION_STRATEGY = {
  increase: [
    "Calcium-rich foods (sesame, ragi, milk)",
    "Vitamin D sources + sunlight",
    "High-quality protein",
    "Anti-inflammatory foods (turmeric, leafy greens)",
  ],
  reduce: [
    "Refined sugar",
    "Processed foods",
    "Excess spicy & fermented foods (for Pitta balance)",
  ]
};

const LIFESTYLE_OPTIMIZATION = [
  "30–40 minutes daily exercise",
  "Morning sunlight exposure (Vitamin D + circadian balance)",
  "Stress reduction (Pranayama / Meditation)",
  "Sleep before 11 PM",
];

const AYURVEDIC_HERBS = [
  "Brahmi 2 gm before sleep",
  "Trikatu ½ tsf before every meal",
];

const NUTRITION_ITEMS = [
  "Increase calcium & Vitamin D sources",
  "Reduce refined sugar & processed foods",
  "Add anti-inflammatory foods (turmeric, leafy greens)",
  "Improve protein intake",
];

const LIFESTYLE_ITEMS = [
  "30–40 min daily physical activity",
  "Morning sunlight exposure",
  "Stress reduction (Pranayama / Meditation)",
  "Sleep before 11 PM",
];

/* Hex only so html2canvas (no oklab support) works */
function getStatusColor(status: string): { color: string; backgroundColor: string; borderColor: string } {
  if (status === "Optimal" || status === "Strong") return { color: "#6D28D9", backgroundColor: "#F5F3FF", borderColor: "#DDD6FE" };
  if (status === "Mild Imbalance" || status === "Mild Weakness" || status === "Mild Risk" || status === "Mild Deficient") return { color: "#B45309", backgroundColor: "#FFFBEB", borderColor: "#FDE68A" };
  if (status === "Needs Attention" || status === "Early Risk" || status === "Moderate") return { color: "#C2410C", backgroundColor: "#FFF7ED", borderColor: "#FED7AA" };
  return { color: "#334155", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" };
}

function getBarColor(value: number): string {
  if (value >= 85) return "#00bb06";
  if (value >= 70) return "#31f891";
  if (value >= 50) return "#ff9900";
  return "#EF4444";
}

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/* Palette Refinement: Using a professional Slate + Teal/Cyan system */
const BRAND = {
  primary: "#0D9488", // Teal 600
  secondary: "#0891B2", // Cyan 600
  accent: "#0F766E", // Teal 700
  light: "#CCFBF1", // Teal 100
  surface: "#F0FDFA", // Teal 50
  border: "#99F6E4", // Teal 200
  muted: "#134E4A", // Teal 900
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    400: "#94A3B8",
    600: "#475569",
    800: "#1E293B",
    950: "#020617",
  }
} as const;

const PURPLE = {
  primary: BRAND.primary,
  light: BRAND.secondary,
  dark: BRAND.accent,
  bg: BRAND.surface,
  border: BRAND.border,
  muted: BRAND.muted,
} as const;

function ReportWaveHeader({ mode }: { mode: "cover" | "section" }) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Dynamic Background with Gradients */}
      <div
        className="relative px-10 pt-8 pb-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
        }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 shadow-inner ring-1 ring-white/30 backdrop-blur-md">
              <HeartPulse className="h-7 w-7 text-white drop-shadow-sm" />
            </div>
            <div>
              <div className="text-[32px] font-bold italic tracking-tighter leading-none">
                Healthians
              </div>
              <div className="text-[10px] font-medium tracking-widest text-teal-50 uppercase mt-1 opacity-80">
                Intuitive Healthcare
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 sm:flex">
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold">22+</div>
              <div className="text-[10px] font-medium text-teal-50/80 uppercase tracking-wider">Labs</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold">100M+</div>
              <div className="text-[10px] font-medium text-teal-50/80 uppercase tracking-wider">Tests</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="ml-2 grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-2 ring-white/20 backdrop-blur-sm shadow-xl">
              <div className="text-[12px] font-black leading-none text-white">CAP</div>
              <div className="mt-0.5 text-[8px] font-bold leading-none text-white opacity-70">
                ACCRED
              </div>
            </div>
          </div>
        </div>

        {/* Improved Layered Waves */}
        <svg
          className="absolute -bottom-px left-0 right-0 h-20 w-full"
          viewBox="0 0 1000 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,96 C165,135 330,38 520,82 C710,125 745,120 1000,74 L1000,160 L0,160 Z"
            fill={BRAND.light}
            fillOpacity="0.4"
          />
          <path
            d="M0,106 C175,150 340,50 525,94 C710,132 830,128 1000,86 L1000,160 L0,160 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {mode === "cover" ? (
        <div className="relative -mt-6 bg-white px-10 pb-8 pt-5">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                INTELLIGENT ANALYSIS
              </div>
              <div className="text-[32px] font-extrabold tracking-tight text-slate-900">
                Health Insight <span style={{ color: BRAND.primary }}>Report</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">
                Powered By
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="h-8 w-8 rounded-lg bg-slate-950 grid place-items-center">
                  <div className="text-white font-black text-xs">DX</div>
                </div>
                <div className="text-[28px] font-black leading-none text-slate-800 tracking-tighter">
                  DXAI
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Healthtech Solutions
              </div>
            </div>
          </div>
          <div className="mt-6 h-1 w-full rounded-full opacity-20" style={{ background: `linear-gradient(to right, ${BRAND.primary}, transparent)` }} />
        </div>
      ) : (
        <div className="relative -mt-6 bg-white px-10 pb-5 pt-10">
          <div className="flex items-center justify-between gap-6">
            <div className="text-[11px] font-extrabold tracking-[0.2em] text-slate-500 uppercase">
              Integrated Wellness Summary
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {PATIENT.name} • {PATIENT.patientId}
              </div>
            </div>
          </div>
          <div className="mt-4 h-0.5 w-full rounded-full bg-slate-100" />
        </div>
      )}
    </div>
  );
}
function ReportFooter({ page, total }: { page: number; total: number }) {
  return (
    <footer className="mt-auto border-t border-slate-200 pt-1 pb-4">
      <div className="mb-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-300">
        <div className="flex items-center gap-4">
          <div>Ref ID: DXAI-{PATIENT.patientId}-2026</div>
          <div className="h-3 w-px bg-slate-200" />
          <div>Page {page} of {total}</div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
          Digital Integrity Verified
        </div>
      </div>
      <p className="mb-2 text-center text-[10px] font-medium leading-relaxed text-slate-400 max-w-2xl mx-auto italic">
        Disclaimer: This AI-powered health insight report is generated based on laboratory data provided. It is intended for informational and educational purposes only. Always consult with a qualified medical professional for diagnosis or treatment.
      </p>
      <div className="flex items-start gap-8 border-t border-slate-50 pt-6">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <span className="mt-2 text-[10px] font-black text-slate-400">MC-4245</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
            Healthian Labs • Expedient Healthcare Marketing
          </p>
          <p className="mt-1 text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
            Udyog Vihar, Phase-4, Gurgaon, Haryana-122016 <span className="mx-2 text-slate-200">|</span> CAP #9019582 <span className="mx-2 text-slate-200">|</span> NABL #MC-4245
          </p>
        </div>
      </div>
    </footer>
  );
}
function DonutScore({ 
  score, 
  size = 42, 
  color: customColor, 
  strokeWidth = 6 
}: { 
  score: number; 
  size?: number; 
  color?: string; 
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = customColor || (score > 80 ? "#059669" : score > 60 ? "#D97706" : "#DC2626");
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[10px] font-black leading-none text-slate-800">{score}</span>
      </div>
    </div>
  );
}

export default function HealthReport() {
  const chartHeight = Math.max(200, AYURVEDA_PARAMS.length * 25);
  const ayurvedaCardChartHeight = 56;
  const [isGenerating, setIsGenerating] = useState(false);

  // global adjustments: remove browser margins and force colours. also
  // ensure pages are rectangular by zeroing border radius.
  // hardware printers still have unprintable edges, so a tiny white
  // band may remain at the very top.
  const printStyles = (
    <style jsx global>{`\
      .report-page {\
        border-radius: 0 !important;\
      }\
      @media print {\
        html, body {\
          margin: 0;\
          padding: 0;\
          -webkit-print-color-adjust: exact;\
          print-color-adjust: exact;\
        }\
        .report-page {\
          margin: 0;\
          page-break-after: always;\
        }\
      }\
    `}</style>
  );

  const downloadPDF = useCallback(async () => {
    if (isGenerating) return; // prevent double click
    setIsGenerating(true);

    try {
      const pageIds = [
        "reportPage1",
        "reportPage2",
        "reportPage3",
        "reportPage4",
        "reportPage5",
        "reportPage6",
      ];

      // give layout a moment to settle
      await new Promise((r) => setTimeout(r, 600));

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      });

      // Add Metadata
      pdf.setProperties({
        title: `${PATIENT.name} Health Insight Report`,
        subject: "Medical Laboratory Analysis",
        author: "Healthians DXAI",
        keywords: "health, diagnostics, report, ai",
        creator: "DXAI Health Intelligence Platform"
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;

      for (let i = 0; i < pageIds.length; i++) {
        const el = document.getElementById(pageIds[i]);
        if (!el) continue;

        // Force capture at scale 3 for ultra-sharp PDF
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          onclone: (clonedDoc) => {
            // Ensure cloned document state is clean
            const clonedEl = clonedDoc.getElementById(pageIds[i]);
            if (clonedEl) clonedEl.style.borderRadius = "0px";
          }
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

        // Add minimal professional touch: Page numbers
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Page ${i + 1} of ${pageIds.length} | Generated by Healthians DXAI`, 10, pageHeightMm - 8);
      }

      const fileName = `${PATIENT.name.replace(/\s+/g, '_')}_Health_Report_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("error generating pdf", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return (
    <div className="min-h-screen py-8 px-4 print:py-0 print:px-0"
      style={{ background: `linear-gradient(to bottom, ${PURPLE.bg} 0%, #ffffff 100%)` }}>
      {printStyles}
      <div className="mx-auto max-w-[794px]">
        <div className="mb-6 flex gap-4 justify-end print:hidden">
          <button
            type="button"
            onClick={downloadPDF}
            disabled={isGenerating}
            aria-busy={isGenerating}
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: PURPLE.primary }}
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5" aria-hidden="true" />
            )}
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: PURPLE.dark }}
          >
            <Printer className="h-5 w-5" aria-hidden="true" />
            Print
          </button>
        </div>

        <div id="reportContent" className="space-y-6">
          {/* Page 1: Cover + Patient Information */}
          <div
            id="reportPage1"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1000px] flex-col">
              <ReportWaveHeader mode="cover" />
              <div className="flex flex-1 flex-col p-10 pt-0">
                {/* Patient Information Grid */}
                <div className="mt-0 grid grid-cols-2 gap-3">
                  <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] text-slate-400">
                      <FileText className="h-4 w-4 text-teal-600" />
                      Patient Profile
                    </h2>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-2 ring-1 ring-slate-200/50">
                      <dl className="grid gap-1">
                        {[
                          { label: "Full Name", value: PATIENT.name },
                          { label: "Patient ID", value: PATIENT.patientId },
                          { label: "Age / Gender", value: `${PATIENT.age} Years / ${PATIENT.gender}` },
                          { label: "Report Date", value: PATIENT.dateOfReport },
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col">
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</dt>
                            <dd className="text-sm font-bold text-slate-800">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] text-slate-400">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Quick Status
                    </h2>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 ring-1 ring-amber-200/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-800 uppercase tracking-tight">Attention Required</div>
                          <div className="text-[10px] font-medium text-amber-700/80 leading-tight mt-0.5">3 Critical markers identified in recent lab tests.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Key Findings */}
                <div className="mt-3">
                  <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                    <div className="h-8 w-1 bg-teal-500 rounded-full" />
                    Section 1: Key Clinical Insights – Priority Areas
                  </h2>
                  <h3 className="mt-3 text-[13px] font-black uppercase tracking-[0.1em] text-slate-400">Abnormal Lab Highlights</h3>

                  <div className="mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Parameter</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Your Value</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Optimal Range</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Clinical Interpretation</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Ayurvedic Correlation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {LAB_FINDINGS.map((row) => (
                          <tr key={row.test} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900">{row.test}</span>
                            </td>
                            <td className="px-6 py-4 font-black text-rose-600 bg-rose-50/20">{row.yourValue}</td>
                            <td className="px-6 py-4 text-slate-500 font-medium">{row.idealRange}</td>
                            <td className="px-6 py-4 text-slate-700 font-bold">{row.meaning}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{row.ayurvedicCorrelation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 rounded-2xl bg-teal-50/50 p-4 border border-teal-200 italic">
                    <span className="font-bold text-teal-800">Summary Insight:</span> <p className="text-teal-800"> Early metabolic imbalance with inflammation + bone weakening + impaired glucose metabolism</p>
                  </div>
                </div>
                <ReportFooter page={1} total={6} />
              </div>
            </div>
          </div>

          {/* Page 2 removed (content moved into Page 1) */}

          {/* Page 2: Section 2 – Organ Function Scorecard */}
          <div
            id="reportPage2"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="section" />
              <div className="flex flex-1 flex-col p-12 pt-0">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-teal-500 rounded-full" />
                  Section 2: Organ Function Scorecard
                </h2>
                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Organ System</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Score</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Clinical Insight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ORGAN_SCORECARD.map((row) => (
                        <tr key={row.system} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{row.system}</td>
                          <td className="px-6 py-4 text-center font-black text-slate-800">{row.score}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                              style={{ color: getStatusColor(row.status).color, backgroundColor: getStatusColor(row.status).backgroundColor }}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{row.insight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ReportFooter page={2} total={6} />
              </div>
            </div>
          </div>

          {/* Page 3: Section 3 – Composite Health Indices */}
          <div
            id="reportPage3"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="section" />
              <div className="flex flex-1 flex-col p-8 pt-0">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-6 w-1 bg-teal-500 rounded-full" />
                  Section 3: Composite Health Indices
                </h2>

                <div className="mt-0 flex flex-col items-center gap-4 lg:flex-row">
                  <div className="relative h-[300px] w-full max-w-[450px] shrink-0">
                    <div className="absolute inset-0 bg-teal-500/5 blur-[80px] rounded-full" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={RADAR_DATA} outerRadius="75%">
                        <PolarGrid stroke={BRAND.border} strokeDasharray="4 4" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 9, fontWeight: 700, fill: BRAND.slate[400] }}
                        />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Efficiency"
                          dataKey="score"
                          stroke={BRAND.primary}
                          strokeWidth={3}
                          fill={BRAND.primary}
                          fillOpacity={0.15}
                        />
                        <Radar
                          dataKey="score"
                          stroke="none"
                          fill="none"
                          label={(props: any) => {
                            const { x, y, value } = props;
                            return (
                              <text x={x} y={y} dy={-8} textAnchor="middle" fontSize={10} fontWeight={800} fill={BRAND.accent}>
                                {value}
                              </text>
                            );
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full flex-1">
                    <div className="mt-0 grid grid-cols-1 gap-2">
                      {COMPOSITE_INDICES.map((row) => (
                        <div key={row.index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm ring-1 ring-slate-200/50">
                          <div className="space-y-0.5">
                            <div className="text-xs font-black uppercase tracking-wider text-slate-900">{row.index}</div>
                            <div className="text-[10px] font-medium text-slate-400 leading-tight">{row.interpretation}</div>
                          </div>
                          <div className="flex shrink-0 items-center justify-center ml-4">
                            <DonutScore score={row.score} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-0 border-t border-slate-100 pt-2">
                  <h3 className="text-[14px] font-black text-slate-800">Bone Health Index (BHI) Interpretation</h3>
                  <div className="mt-0 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 font-black text-slate-500">Score</th>
                          <th className="px-4 py-2 font-black text-slate-500">Meaning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {BHI_RANGES.map((r, i) => (
                          <tr key={i} className={i === 2 ? "bg-amber-50/50" : ""}>
                            <td className="px-4 py-2 font-bold text-slate-700">{r.range}</td>
                            <td className="px-4 py-2 font-medium text-slate-600">{r.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-sm font-black text-slate-900">
                    Your Score: 65 → <span className="text-amber-600">Moderate bone weakening (needs correction phase)</span>
                  </div>
                </div>
                <ReportFooter page={3} total={6} />
              </div>
            </div>
          </div>

          {/* Page 4: Section 4 – Ayurveda Wellness Dashboard */}
          <div
            id="reportPage4"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="section" />
              <div className="flex flex-1 flex-col p-12 pt-0">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-teal-500 rounded-full" />
                  Section 4: Ayurveda Wellness Dashboard
                </h2>

                <div className="mt-2 space-y-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 ring-1 ring-slate-200/50">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.1em] text-teal-700">Prakriti–Vikriti Analysis</h3>
                    <ul className="mt-0 space-y-2 list-disc pl-5 text-sm font-medium text-slate-700">
                      <li>Current Imbalance (Vikriti): <span className="font-bold text-slate-900">Pitta Dominant</span></li>
                      <li>Indicates:
                        <ul className="mt-0 space-y-1 list-disc pl-6 font-normal text-slate-600">
                          <li>Excess metabolic heat</li>
                          <li>Inflammatory tendency</li>
                          <li>Tissue depletion due to over-transformation</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.1em] text-slate-400">Core Functional Parameters</h3>
                    <div className="mt-0 grid grid-cols-3 gap-4">
                      {AYURVEDA_PARAMS.map((p) => (
                        <div key={p.name} className="flex flex-col items-center rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{p.name}</div>
                          <DonutScore 
                            score={p.value} 
                            size={64} 
                            color={p.name.includes("Ama") ? "#DC2626" : (p.value > 80 ? "#059669" : "#D97706")}
                          />
                          <div className="mt-1 text-[10px] font-bold text-slate-500 leading-tight h-8 flex items-center">{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.1em] text-slate-400">Dhatu Assessment (Tissue Strength)</h3>
                    <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500">Dhatu</th>
                            <th className="px-6 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500">Score</th>
                            <th className="px-6 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                              {DHATU_ASSESSMENT.map((d) => (
                                <tr key={d.name}>
                                  <td className="px-6 py-1 font-bold text-slate-900">{d.name}</td>
                                  <td className="px-6 py-1 text-center">
                                    <DonutScore 
                                      score={d.value} 
                                      size={36} 
                                      strokeWidth={5}
                                      color={getBarColor(d.value)}
                                    />
                                  </td>
                                  <td className="px-6 py-3 font-bold text-slate-600">{d.status}</td>
                              <td className="px-6 py-3 text-slate-500">{d.interpretation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <ReportFooter page={4} total={6} />
              </div>
            </div>
          </div>

          {/* Page 5: Section 5 – Risk Intelligence */}
          <div
            id="reportPage5"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="section" />
              <div className="flex flex-1 flex-col p-12 pt-10">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-amber-500 rounded-full" />
                  Section 5: Predictive Risk Intelligence
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  (If current trends continue)
                </p>

                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Risk Area</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Probability</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {PREDICTIVE_RISK.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{r.area}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/50">
                              {r.probability}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{r.interpretation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Note: These are preventive projections, not diagnoses.
                </div>

                <ReportFooter page={5} total={6} />
              </div>
            </div>
          </div>

          {/* Page 6: Section 6 – Action Plan */}
          <div
            id="reportPage6"
            className="report-page relative overflow-hidden bg-white shadow-xl"
            style={{
              width: A4_WIDTH_PX,
              maxWidth: "100%",
              minHeight: A4_HEIGHT_PX,
              boxShadow: `0 25px 50px -12px ${PURPLE.light}`,
              border: `1px solid ${PURPLE.border}`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="section" />
              <div className="flex flex-1 flex-col p-12 pt-10">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-teal-600 rounded-full" />
                  Section 6: Personalized Action Plan
                </h2>

                <div className="mt-10 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800">1. Nutrition Strategy (Ahara Chikitsa)</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6">
                        <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-4">Increase</div>
                        <ul className="space-y-3">
                          {NUTRITION_STRATEGY.increase.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm font-medium text-slate-700">
                              <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-6">
                        <div className="text-[11px] font-black uppercase tracking-wider text-rose-700 mb-4">Reduce</div>
                        <ul className="space-y-3">
                          {NUTRITION_STRATEGY.reduce.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm font-medium text-slate-700">
                              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800">2. Lifestyle Optimization (Vihara)</h3>
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/20 p-6">
                      <ul className="grid grid-cols-2 gap-4">
                        {LIFESTYLE_OPTIMIZATION.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-slate-700 border-l-2 border-cyan-500 pl-4">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800">3. Ayurvedic Herbs</h3>
                    <div className="rounded-2xl border border-teal-100 bg-teal-50/20 p-6">
                      <ul className="space-y-3">
                        {AYURVEDIC_HERBS.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-slate-700">
                            <Leaf className="h-5 w-5 text-teal-600 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <ReportFooter page={6} total={6} />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
