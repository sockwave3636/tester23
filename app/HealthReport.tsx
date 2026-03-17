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
  dateOfReport: "16 Feb 2026",
};

const LAB_FINDINGS = [
  {
    test: "Vitamin D",
    yourValue: "18",
    idealRange: "30–100",
    meaning: "Low – may affect bone strength",
    subMeaning: "Bone tissue (Asthi) mild deficiency",
  },
  {
    test: "HbA1c",
    yourValue: "6.2",
    idealRange: "<5.7",
    meaning: "Borderline glycemic control",
    subMeaning: "Fat tissue (Meda) Mild accumulation",
  },
  {
    test: "CRP",
    yourValue: "5",
    idealRange: "<1",
    meaning: "Mild inflammation present",
    subMeaning: "Toxin load (Ama) present",
  },
];

const HEALTH_SCORECARD = [
  // only include metrics requested for section 2
  { healthArea: "Bone Health Index", score: 65, status: "Needs Attention" },
  { healthArea: "Cardiovascular Index", score: 72, status: "Early Risk" },
  { healthArea: "Metabolic Index", score: 78, status: "Mild Imbalance" },
  { healthArea: "Inflammation Status Index", score: 55, status: "Moderate" },
  { healthArea: "Immune Function Index", score: 68, status: "Mild Deficient" },
  { healthArea: "Hematology Health Index", score: 85, status: "Optimal" },
  { healthArea: "Liver Function Index", score: 82, status: "Optimal" },
  { healthArea: "Kidney Function", score: 92, status: "Optimal" },
];

const BHI_RANGES = [
  { range: "85–100", meaning: "Your bones are strong and healthy." },
  { range: "70–84", meaning: "Slight weakness may be starting." },
  { range: "50–69", meaning: "Bones are getting weaker. Care needed." },
  { range: "<50", meaning: "Bones are weak. High chance of fractures." },
];

// radar chart data for section 2 – built from the (now trimmed) HEALTH_SCORECARD
const RADAR_DATA = HEALTH_SCORECARD.map((h) => ({ subject: h.healthArea, score: h.score }));

const AYURVEDA_PARAMS = [
  { name: "Agni - Digestive Fire", value: 60, desc: "Mildly weak digestion" },
  { name: "Ama - Toxin load", value: 65, desc: "Moderate toxin accumulation" },
  { name: "Ojas - Vitality", value: 82, desc: "Good vitality reserve" },
  { name: "Rasa - Plasma", value: 78, desc: "Plasma balance — mild kshaya" },
  { name: "Rakta - Blood Tissue", value: 35, desc: "Moderate deficiency (anemia)" },
  { name: "Mamsa - Muscle Tissue", value: 82, desc: "Muscle tissue balanced" },
  { name: "Meda - Fat Tissue", value: 55, desc: "Moderate fat/tissue accumulation" },
  { name: "Asthi - Bone Tissue", value: 65, desc: "Bone strength reduced — care needed" },
  { name: "Majja - Bone marrow", value: 72, desc: "Bone marrow / nerve reserve good" },
  { name: "Shukra - Reproductive Tissue", value: 48, desc: "Low reproductive reserve / weak" },
];

const DHATU = [
  { name: "Rasa (Plasma)", value: 78, label: "Mild Kshaya" },
  { name: "Rakta (Blood)", value: 35, label: "Moderate Deficiency (Anemia)" },
  { name: "Mamsa (Muscle)", value: 82, label: "Balanced" },
  { name: "Asthi (Bone)", value: 65, label: "Moderate Deficiency (osteopenia)" },
];

const RISKS = [
  "Prediabetes progression risk → Moderate",
  "Bone thinning (osteopenia) risk → Moderate",
  "Early heart risk → Mild",
  "Chronic inflammation tendency → Moderate",
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
  if (value >= 85) return "#425af5";
  if (value >= 70) return PURPLE.light;
  if (value >= 50) return "#ffee00";
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
    <footer className="mt-auto border-t border-slate-200 pt-2 pb-4">
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
      <p className="mb-6 text-center text-[10px] font-medium leading-relaxed text-slate-400 max-w-2xl mx-auto italic">
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
            <div className="flex min-h-[1123px] flex-col">
              <ReportWaveHeader mode="cover" />
              <div className="flex flex-1 flex-col p-12 pt-4">
                {/* Patient Information Grid */}
                <div className="mt-0 grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] text-slate-400">
                      <FileText className="h-4 w-4 text-teal-600" />
                      Patient Profile
                    </h2>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-200/50">
                      <dl className="grid gap-3">
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

                  <div className="space-y-4">
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
                <div className="mt-6">
                  <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                    <div className="h-8 w-1 bg-teal-500 rounded-full" />
                    Section 1: Critical Lab Insights
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-500 max-w-lg">
                    Comprehensive analysis of markers operating outside optimal ranges. Immediate clinical correlation is recommended.
                  </p>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Parameter</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Your Value</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Reference</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Clinical Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {LAB_FINDINGS.map((row) => (
                          <tr key={row.test} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-400" />
                                <span className="font-bold text-slate-900">{row.test}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black text-rose-600 bg-rose-50/20">{row.yourValue}</td>
                            <td className="px-6 py-4 text-slate-500 font-medium">{row.idealRange}</td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800">{row.meaning}</div>
                                <div className="text-[11px] font-medium text-slate-400 italic">{row.subMeaning}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <ReportFooter page={1} total={5} />
              </div>
            </div>
          </div>

          {/* Page 2 removed (content moved into Page 1) */}

          {/* Page 3: Section 2 – Health Scorecard */}
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
              <div className="flex flex-1 flex-col p-12 pt-0">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-teal-500 rounded-full" />
                  Section 2: Systemic Health Scorecard
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Biological system analysis based on cross-referenced lab markers. Higher scores indicate optimal physiological function.
                </p>

                <div className="mt-2 flex flex-col items-center gap-4 lg:flex-col">
                  <div className="relative h-[300px] w-full max-w-[500px] shrink-0">
                    {/* Background glow for radar chart */}
                    <div className="absolute inset-0 bg-teal-500/5 blur-[80px] rounded-full" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={RADAR_DATA} outerRadius="75%">
                        <PolarGrid stroke={BRAND.border} strokeDasharray="4 4" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 10, fontWeight: 700, fill: BRAND.slate[400] }}
                        />
                        <PolarRadiusAxis
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Efficiency"
                          dataKey="score"
                          stroke={BRAND.primary}
                          strokeWidth={3}
                          fill={BRAND.primary}
                          fillOpacity={0.15}
                        />
                        {/* Custom Labels on Points */}
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
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        HEALTH_SCORECARD.slice(0, 4),
                        HEALTH_SCORECARD.slice(4, 8),
                      ].map((col, colIdx) => (
                        <div key={`col-${colIdx}`} className="space-y-2">
                          {col.map((row) => (
                            <div key={row.healthArea} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:border-teal-200 hover:shadow-md ring-1 ring-slate-200/50">
                              <div className="flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-black uppercase tracking-wider text-slate-900">{row.healthArea}</div>
                                  <div className="text-[10px] font-medium text-slate-400 leading-tight">{row.status}</div>
                                </div>
                                <div className="h-20 w-20 relative shrink-0">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { name: 'score', value: row.score },
                                          { name: 'remaining', value: 100 - row.score }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={36}
                                        fill="#8884d8"
                                        dataKey="value"
                                        startAngle={-15}
                                        endAngle={-342}
                                      >
                                        <Cell fill={getBarColor(row.score)} />
                                        <Cell fill="#e5e7eb" />
                                      </Pie>
                                    </PieChart>
                                  </ResponsiveContainer>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 flex items-center justify-center">
                                    <span className="text-xs font-black text-slate-900 whitespace-nowrap">{row.score}/100</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <ReportFooter page={2} total={5} />
              </div>
            </div>
          </div>

          {/* Page 4: Section 3 – Ayurveda Dashboard */}
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
                {/* Header Section */}
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-8 w-1 bg-teal-500 rounded-full" />
                  Section 3: Ayurveda Wellness Inventory
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Multidimensional analysis of physiological and energetic balance using the Vata-Pitta-Kapha framework.
                </p>

                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 ring-1 ring-slate-200/50">
                  <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-teal-700">
                    <Zap className="h-4 w-4" />
                    Vikriti Analysis (Current State)
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    Your <span className="font-bold text-slate-900 underline decoration-teal-500/30">Pitta-dominant</span> pattern indicates current imbalance driven by excess metabolic heat, accelerated transformation, and potential inflammatory responses. Clinical correlation with liver and blood markers is advised.
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    AYURVEDA_PARAMS.slice(0, 5),
                    AYURVEDA_PARAMS.slice(5, 10),
                  ].map((col, colIdx) => (
                    <div key={`col-${colIdx}`} className="space-y-2">
                      {col.map((p) => (
                        <div key={p.name} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-teal-200 hover:shadow-md ring-1 ring-slate-200/50">
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <div className="text-xs font-black uppercase tracking-wider text-slate-900">{p.name}</div>
                              <div className="text-[10px] font-medium text-slate-400 leading-tight">{p.desc}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-teal-600">{p.value}</div>
                              <div className="text-[8px] font-bold text-slate-300 uppercase letter-spacing-widest">Score</div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div style={{ height: 40 }} className="relative">
                              {/* Custom Axis Labels for better readability */}
                              <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                                <span>Deficiency</span>
                                <span>Balanced</span>
                                <span>Excess</span>
                              </div>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  layout="vertical"
                                  data={[{
                                    name: p.name,
                                    // scale 0-100 into -100..100 with 50 as the midpoint
                                    valueFromMid: ((Number(p.value) || 0) - 50) * 2
                                  }]}
                                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                                >
                                  <CartesianGrid vertical={true} horizontal={false} strokeDasharray="3 3" stroke={BRAND.slate[100]} />
                                  <XAxis
                                    type="number"
                                    domain={[-100, 100]}
                                    ticks={[-100, -50, 0, 50, 100]}
                                    // tick values now represent a bipolar scale where 0 maps to score 50
                                    tickFormatter={(val) => val.toString()}
                                    fontSize={8}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={true}
                                    style={{ fill: BRAND.slate[400] }}


                                  />
                                  <YAxis type="category" dataKey="name" hide />
                                  <Bar
                                    dataKey="valueFromMid"
                                    barSize={10}
                                    radius={[4, 4, 4, 4]}
                                    isAnimationActive={false}
                                    fill={getBarColor(Number(p.value) || 0)}
                                  />
                                  <ReferenceLine x={0} stroke={BRAND.slate[200]} strokeWidth={1} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* 
                <p className="mt-8 text-sm italic text-slate-400 leading-relaxed max-w-2xl border-l-2 border-slate-100 pl-4">
                  Note: Ayurvedic assessments are complementary and identify functional patterns. Ensure standard clinical integration for any pathological concerns.
                </p> */}
                <ReportFooter page={3} total={5} />
              </div>
            </div>
          </div>

          {/* Page 5: Section 4 – Risk Forecast */}
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
                  Section 4: Preventive Risk Forecast
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Biomedical foresight based on your unique physiological markers. These represent areas of vulnerability if current trends remain unmanaged.
                </p>

                <div className="mt-8 space-y-3">
                  {RISKS.map((risk, idx) => (
                    <div key={idx} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-200/50 transition-all hover:border-amber-200">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-amber-400 group-hover:animate-ping" />
                        <span className="text-sm font-bold text-slate-800">{risk}</span>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/50">
                        Elevated Risk
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-2xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[60px] rounded-full -mr-10 -mt-10" />
                  <div className="relative flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20 backdrop-blur-md">
                      <ShieldCheck className="h-6 w-6 text-teal-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black tracking-tight">Clinical Advisory</h3>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                        These forecasts are generated using advanced predictive modeling. They are designed to empower you with preemptive insight and should be used to facilitate deeper conversations with your primary healthcare provider.
                      </p>
                    </div>
                  </div>
                </div>
                <ReportFooter page={4} total={5} />
              </div>
            </div>
          </div>

          {/* Page 6: Section 5 – Action Plan */}
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
                  Section 5: Personalized Wellness Roadmap
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Targeted lifestyle and nutritional adjustments engineered to optimize your biological markers within 90 days.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 ring-1 ring-emerald-200/50">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-800">Nutrition Focus</span>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-200/50 space-y-4">
                      {NUTRITION_ITEMS.map((item, idx) => (
                        <div key={idx} className="flex gap-3 group">
                          <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                            <span className="text-[10px] font-bold text-emerald-600 group-hover:text-white">{idx + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-700 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 ring-1 ring-cyan-200/50">
                      <div className="h-2 w-2 rounded-full bg-cyan-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-cyan-800">Lifestyle Upgrade</span>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-200/50 space-y-4">
                      {LIFESTYLE_ITEMS.map((item, idx) => (
                        <div key={idx} className="flex gap-3 group">
                          <div className="mt-1 h-5 w-5 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 transition-colors">
                            <span className="text-[10px] font-bold text-cyan-600 group-hover:text-white">{idx + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-700 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <ReportFooter page={5} total={5} />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
