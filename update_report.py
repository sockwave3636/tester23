import sys
import os
import re

file_path = r"c:\Users\aakas\OneDrive\Desktop\New folder (2)\tester23\tester23\app\HealthReport.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ORGAN_SCORECARD and COMPOSITE_INDICES
regex_arrays = re.compile(r"const ORGAN_SCORECARD = \[.*?\n\];\s*const COMPOSITE_INDICES = \[.*?\];", re.DOTALL)

new_indices = """const COMPOSITE_INDICES = [
  { index: "Bone Health Index", score: 65, interpretation: "Moderate Risk: Bone weakening (Osteopenia risk)" },
  { index: "Stress Load Index", score: 58, interpretation: "Moderate Risk: High stress burden affecting recovery" },
  { index: "Gut Health Index", score: 60, interpretation: "Moderate Risk: Impaired digestion & microbiome imbalance" },
  { index: "Metabolic Health Index", score: 62, interpretation: "Moderate Risk: Reduced metabolic efficiency" },
  { index: "Glycemic Control Index", score: 63, interpretation: "Moderate Risk: Prediabetic tendency" },
  { index: "Cardiovascular Risk Index", score: 82, interpretation: "Low Risk: Stable cardiac profile" },
  { index: "Hepatic Performance Index", score: 65, interpretation: "Moderate Risk: Fat accumulation / detox inefficiency" },
  { index: "Renal Vitality Index", score: 78, interpretation: "Mild Risk: Early kidney stress" },
  { index: "Thyroid Health Index", score: 72, interpretation: "Mild Risk: Suboptimal hormonal regulation" },
  { index: "Cellular Aging Index", score: 66, interpretation: "Moderate Risk: Early biological aging signs" },
  { index: "Immune Health Index", score: 68, interpretation: "Mild Risk: Reduced immune resilience" },
  { index: "Female Hormonal Index", score: 75, interpretation: "Mild Imbalance: Hormonal fluctuations present" },
  { index: "BP Stability Index", score: 76, interpretation: "Mild Risk: Early vascular instability" },
  { index: "Joint Inflammation Index", score: 58, interpretation: "Moderate Risk: Inflammatory joint tendency" },
  { index: "Hemoglobin Opt Index", score: 35, interpretation: "Moderate Risk: Anemia / low oxygen carrying capacity" },
  { index: "Pancreas Health Index", score: 68, interpretation: "Mild Risk: Insulin resistance trend" },
  { index: "Inflammation Status Index", score: 55, interpretation: "Moderate Risk: Systemic inflammation present" },
];"""

content = regex_arrays.sub(new_indices, content)

hex_comment = "/* Hex only so html2canvas (no oklab support) works */"
new_data = """const YOGA_PROTOCOL = {
  goal: "Improve metabolism, reduce stress & inflammation, support bone & hormonal health",
  daily: [
    "Asanas: Surya Namaskar, Vrikshasana, Bhujangasana, Baddha Konasana",
    "Pranayama: Anulom Vilom, Bhramari (± Kapalbhati if suitable)",
    "Meditation: 5–10 min breath awareness",
  ],
};

const FOLLOW_UP = [
  { time: "After 8–12 Weeks", tests: "HbA1c, Fasting Glucose • CRP • Vitamin D" },
  { time: "After 3–6 Months", tests: "LFT, KFT • CBC (Hemoglobin)" },
  { time: "After 6–12 Months", tests: "Lipid Profile • Bone Density (DEXA)" },
  { time: "Index Review", tests: "Every 3–6 months" },
];

"""
content = content.replace(hex_comment, new_data + hex_comment)

content = content.replace('"reportPage6",', '"reportPage6",\n        "reportPage7",')
content = content.replace("total={6}", "total={7}")

regex_pages = re.compile(r"\{\/\*\s*Page 2:.*?\{\/\*\s*Page 4:", re.DOTALL)

new_pages = """{/* Page 2: Section 2 – Composite Health Indices Dashboard (Part 1) */}
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
              <div className="flex flex-1 flex-col p-8 pt-0">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="h-6 w-1 bg-teal-500 rounded-full" />
                  Section 2: Composite Health Indices Dashboard (Part 1)
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
                      {COMPOSITE_INDICES.slice(0, 9).map((row) => (
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
                <ReportFooter page={2} total={7} />
              </div>
            </div>
          </div>

          {/* Page 3: Section 2 – Composite Health Indices Dashboard (Part 2) */}
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
                  Section 2: Composite Health Indices Dashboard (Part 2)
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {COMPOSITE_INDICES.slice(9).map((row) => (
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

                <div className="mt-8 border-t border-slate-100 pt-4">
                  <h3 className="text-[14px] font-black text-slate-800">Bone Health Index (BHI) Interpretation</h3>
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-100">
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
                </div>
                <ReportFooter page={3} total={7} />
              </div>
            </div>
          </div>

          {/* Page 4:"""

content = regex_pages.sub(new_pages, content)

content = content.replace("Section 4: Ayurveda Wellness Dashboard", "Section 3: Ayurveda Wellness Dashboard")
content = content.replace("Section 5: Predictive Risk Intelligence", "Section 4: Predictive Risk Intelligence")
content = content.replace("Section 6: Personalized Action Plan", "Section 5: Personalized Action Plan")

regex_page6 = re.compile(r'(<ReportFooter page=\{6\} total=\{7\} \/>\s*<\/div>\s*<\/div>\s*<\/div>)')
page7 = r"""\1

          {/* Page 7: Section 6 & 7 – Yoga and Follow-Up */}
          <div
            id="reportPage7"
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
                  Section 6: Yoga & Mind-Body Protocol
                </h2>
                
                <div className="mt-6 space-y-4">
                  <div className="text-sm font-bold text-slate-700">Goal: {YOGA_PROTOCOL.goal}</div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-6">
                    <ul className="space-y-3">
                      {YOGA_PROTOCOL.daily.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm font-medium text-slate-700">
                          <Leaf className="h-5 w-5 text-amber-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 mt-12">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  Section 7: Follow-Up & Monitoring
                </h2>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/20 p-6">
                  <ul className="space-y-4">
                    {FOLLOW_UP.map((item, i) => (
                      <li key={i} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                        <span className="font-bold text-blue-700">{item.time}</span>
                        <span>{item.tests}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ReportFooter page={7} total={7} />
              </div>
            </div>
          </div>"""
content = regex_page6.sub(page7, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("success")
