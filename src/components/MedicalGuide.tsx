import React, { useState } from 'react';
import {
  Stethoscope,
  AlertOctagon,
  HelpCircle,
  FileText,
  Activity,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

export const MedicalGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string>('pcos');

  const conditions = [
    {
      id: 'pcos',
      title: 'PCOS & PCOD (Polycystic Ovary Syndrome)',
      tag: 'Hormonal & Metabolic Balance',
      tagColor: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
      summary: 'Affects 1 in 10 women of reproductive age. Caused by an imbalance in reproductive hormones and insulin sensitivity.',
      symptoms: [
        'Irregular or absent menstrual cycles (fewer than 8 periods a year)',
        'Excess facial or body hair growth (hirsutism) due to elevated androgens',
        'Persistent hormonal acne along the jawline and chin',
        'Hair thinning or male-pattern hair loss on the scalp',
        'Weight fluctuations or difficulty processing carbohydrates',
      ],
      selfCare: [
        'Prioritize low-glycemic, fiber-rich meals to stabilize insulin spikes.',
        'Gentle resistance & strength training improves insulin receptor sensitivity.',
        'Consult with a gynecologist or endocrinologist regarding Myo-Inositol or birth control options.',
      ],
    },
    {
      id: 'endo',
      title: 'Endometriosis (Endo)',
      tag: 'Pelvic Pain & Inflammation',
      tagColor: 'text-rose-300 bg-rose-500/20 border-rose-500/30',
      summary: 'Tissue similar to the uterine lining grows outside the uterus—on ovaries, fallopian tubes, or bladder—causing severe inflammatory pain.',
      symptoms: [
        'Severe, debilitating period cramps that cause missed school or work',
        'Pelvic pain radiating down into the lower back, hips, and legs',
        'Painful bowel movements or pain while urinating during your period',
        'Heavy menstrual bleeding with large clots',
        'Deep pain during or after sexual intimacy',
      ],
      selfCare: [
        'Never let anyone tell you "extreme pain is normal"—advocate for imaging and specialist referral.',
        'High-dose anti-inflammatory nutrition (turmeric, omega-3, leafy greens).',
        'Pelvic floor physical therapy and heat therapy.',
      ],
    },
    {
      id: 'uti',
      title: 'Urinary Tract Infection (UTI)',
      tag: 'Urinary Health Alert',
      tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      summary: 'A bacterial infection (most commonly E. coli) in the urinary bladder or urethra. Very common and easy to treat if caught early!',
      symptoms: [
        'Sharp, stinging burning sensation when urinating',
        'Constant intense urge to pee, but only releasing a few drops',
        'Cloudy, dark, or pinkish/bloody urine',
        'Pelvic pressure or cramping right above the pubic bone',
      ],
      selfCare: [
        'Drink massive amounts of water to mechanically flush bacteria out.',
        'Take pure D-Mannose powder, which binds to E. coli pili and washes them away.',
        'See a healthcare clinic for a quick urine dipstick and short antibiotic course. Never ignore back pain or fever (kidney risk!).',
      ],
    },
    {
      id: 'tss',
      title: 'Toxic Shock Syndrome (TSS)',
      tag: 'CRITICAL SAFETY PROTOCOL',
      tagColor: 'text-red-300 bg-red-500/20 border-red-500/30',
      summary: 'A rare but life-threatening complication of bacterial toxins (Staphylococcus aureus) related to prolonged tampon or menstrual cup wear.',
      symptoms: [
        'Sudden high fever (above 102°F / 38.9°C)',
        'Widespread flat red rash resembling severe sunburn (especially on palms/soles)',
        'Rapid drop in blood pressure, dizziness, or fainting when standing up',
        'Vomiting or watery diarrhea during or right after your period',
      ],
      selfCare: [
        'EMERGENCY: If you experience these symptoms while wearing a tampon, remove it immediately and go to the nearest Emergency Room.',
        'Prevention: Change tampons every 4 to 8 hours. Never wear high-absorbency tampons on light flow days.',
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Banner */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-rose-950/40 to-stone-900 p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Medical Conditions & Disease Guide</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">
          Knowledge is Your Superpower
        </h1>
        <p className="text-xs md:text-sm text-stone-300 max-w-xl">
          Clear, medically grounded guides to PCOS, Endometriosis, UTIs, and emergency TSS awareness so you always know when to seek medical care.
        </p>
      </div>

      {/* Red Flags / Emergency Warning */}
      <div className="p-5 rounded-3xl bg-red-950/40 border border-red-800/60 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Gynecological Red Flags: Seek Immediate Medical Care If:</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
          <li className="flex items-start gap-1.5">
            <span className="text-rose-400 font-bold">•</span>
            <span>Soaking through 2+ pads or tampons every hour for more than 2 hours.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-rose-400 font-bold">•</span>
            <span>Severe pelvic pain accompanied by high fever, chills, or vomiting.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-rose-400 font-bold">•</span>
            <span>Sudden fainting, dizziness, or chest tightness.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-rose-400 font-bold">•</span>
            <span>Passing menstrual blood clots larger than a quarter coin repeatedly.</span>
          </li>
        </ul>
      </div>

      {/* YEAST INFECTION VS BACTERIAL VAGINOSIS COMPARISON TABLE */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-4">
        <div className="border-b border-stone-800 pb-3">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Yeast Infection vs Bacterial Vaginosis (BV) Diagnostic Guide</span>
          </h2>
          <p className="text-xs text-stone-400">
            The two most common reasons for vaginal discomfort—here is how to tell them apart:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400">
                <th className="py-2.5 px-3 font-semibold">Symptom</th>
                <th className="py-2.5 px-3 font-semibold text-amber-300">Yeast Infection (Candida)</th>
                <th className="py-2.5 px-3 font-semibold text-rose-300">Bacterial Vaginosis (BV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-200">
              <tr>
                <td className="py-2.5 px-3 font-medium text-stone-400">Discharge Texture</td>
                <td className="py-2.5 px-3">Thick, white, clumpy ("cottage cheese")</td>
                <td className="py-2.5 px-3">Thin, watery, grayish-white</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-stone-400">Odor</td>
                <td className="py-2.5 px-3">Little to none (or mild bread/yeast scent)</td>
                <td className="py-2.5 px-3 font-bold text-rose-300">Noticeable "fishy" odor, worse after wash/intercourse</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-stone-400">Primary Sensation</td>
                <td className="py-2.5 px-3 font-bold text-amber-300">Intense vulvar itching, redness, swelling</td>
                <td className="py-2.5 px-3">Mild irritation or burning sensation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-stone-400">Treatment</td>
                <td className="py-2.5 px-3">Antifungal cream or oral pill (Fluconazole)</td>
                <td className="py-2.5 px-3">Prescription Antibiotic (Metronidazole)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPANDABLE CONDITIONS CARDS */}
      <div className="space-y-3">
        {conditions.map((item) => {
          const isOpen = expandedSection === item.id;
          return (
            <div
              key={item.id}
              className="rounded-3xl border border-stone-800 bg-stone-900/90 overflow-hidden shadow-lg transition"
            >
              <button
                onClick={() => setExpandedSection(isOpen ? '' : item.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-stone-800/40 transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-100">{item.title}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">{item.summary}</p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-5 pt-0 border-t border-stone-800 space-y-4">
                  <div className="space-y-1.5 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      Common Symptoms to Track:
                    </span>
                    <ul className="space-y-1 text-xs text-stone-300">
                      {item.symptoms.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Empowering Self-Care & Medical Steps:
                    </span>
                    <ul className="space-y-1 text-xs text-stone-300">
                      {item.selfCare.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DOCTOR APPOINTMENT PREPARATION CHECKLIST */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>Gynecologist Visit Preparation Checklist</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-300">
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
            <strong className="text-rose-200">1. Date of Last Period</strong>
            <p className="text-[11px] text-stone-400">
              Have your exact cycle dates and duration ready directly from the GirlyPop Period Tracker.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
            <strong className="text-rose-200">2. Rate Pain Specifically</strong>
            <p className="text-[11px] text-stone-400">
              Don't just say "it hurts." Specify: "sharp stabbing in left ovary," "radiates to thighs," or "nauseous on day 1."
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1">
            <strong className="text-rose-200">3. Bring Your Advocate</strong>
            <p className="text-[11px] text-stone-400">
              You are entitled to bring a trusted friend or mother into the examination room for emotional support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
