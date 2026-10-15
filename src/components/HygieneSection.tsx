import React, { useState } from 'react';
import {
  Heart,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Thermometer,
} from 'lucide-react';

export const HygieneSection: React.FC = () => {
  const [selectedDischarge, setSelectedDischarge] = useState<number>(0);

  const dischargeTypes = [
    {
      title: 'Clear & Stretchy (Egg-White)',
      colorBadge: 'bg-stone-100 text-stone-900 border-stone-300',
      status: 'Normal & Very Fertile (Ovulation)',
      statusColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'Stretches 1-2 inches between your fingers. It occurs right before ovulation to help sperm swim easily. A wonderful sign of healthy estrogen and high hydration!',
      action: 'Completely normal and healthy. No action needed.',
    },
    {
      title: 'Milky White & Creamy',
      colorBadge: 'bg-stone-200 text-stone-800 border-stone-300',
      status: 'Normal Early / Late Cycle',
      statusColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'Smooth, lotion-like texture without any pungent odor or itching. Typical during the follicular or late luteal phase as progesterone levels shift.',
      action: 'Natural self-cleaning vaginal mechanism. Normal.',
    },
    {
      title: 'Thick White & Clumpy (Cottage Cheese)',
      colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
      status: 'Suspected Yeast Infection (Candida)',
      statusColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      description: 'Chunky white discharge accompanied by intense vulvar itching, burning, redness, or soreness when urinating. Often triggered by antibiotics, damp clothing, or high sugar intake.',
      action: 'Over-the-counter antifungal (miconazole/clotrimazole) or oral fluconazole from a doctor. Avoid scented products.',
    },
    {
      title: 'Thin Grayish-White with Fishy Odor',
      colorBadge: 'bg-stone-300 text-stone-900 border-stone-400',
      status: 'Suspected Bacterial Vaginosis (BV)',
      statusColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      description: 'Watery, thin gray discharge that has a noticeable fish-like odor, often more prominent right after showering or intercourse. Caused by an overgrowth of anaerobic bacteria upsetting healthy lactobacilli.',
      action: 'Requires prescription antibiotics (metronidazole or clindamycin) from a healthcare provider. Do not douche—it makes BV worse!',
    },
    {
      title: 'Yellow-Green, Frothy, or Foul Odor',
      colorBadge: 'bg-lime-200 text-lime-900 border-lime-400',
      status: 'Requires Medical Evaluation (Trichomoniasis / STI)',
      statusColor: 'text-red-400 bg-red-500/20 border-red-500/30',
      description: 'Greenish or heavy yellow tint, bubbling/frothy texture, strong unpleasant odor, and painful urination or pelvic discomfort.',
      action: 'See a gynecologist or sexual health clinic immediately for testing and targeted prescription antibiotic treatment.',
    },
    {
      title: 'Brownish Spotting / Old Blood',
      colorBadge: 'bg-amber-950 text-amber-100 border-amber-800',
      status: 'Normal Period Bookends or Ovulation',
      statusColor: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      description: 'Dark brown, rust, or light pink spotting. When blood takes longer to leave the uterus, it oxidizes and turns brown. Common at the very start or end of your period.',
      action: 'Normal. If spotting happens continuously throughout your entire cycle for several months, check with a doctor.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Banner */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-rose-950/40 to-stone-900 p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Vaginal Biome & Intimate Hygiene</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">
          Demystifying Vaginal Health
        </h1>
        <p className="text-xs md:text-sm text-stone-300 max-w-xl">
          Your vagina is an astonishing self-cleaning organ with its own delicate ecosystem. Understanding your natural discharge and pH eliminates fear and keeps you thriving.
        </p>
      </div>

      {/* pH Balance Explained Card */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">The Acidic Guard: Vaginal pH (3.8 – 4.5)</h2>
              <p className="text-xs text-stone-400">Why internal douches and perfumed soaps are harmful.</p>
            </div>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
            Optimal: pH 4.0
          </div>
        </div>

        {/* Visual pH Scale Bar */}
        <div className="space-y-2">
          <div className="h-5 rounded-full overflow-hidden flex text-[10px] font-bold text-stone-900 shadow-inner">
            <div className="w-[30%] bg-gradient-to-r from-red-400 to-rose-400 flex items-center justify-center">
              Acidic 3.8 - 4.5 (Healthy)
            </div>
            <div className="w-[35%] bg-gradient-to-r from-amber-300 to-yellow-300 flex items-center justify-center">
              Neutral 5 - 6 (Vulnerable)
            </div>
            <div className="w-[35%] bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
              Alkaline 7 - 9 (Soap/Blood)
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Good bacteria called <em>Lactobacilli</em> produce lactic acid to keep the vaginal canal at a protective acidic pH (3.8 - 4.5). Regular body wash and bubble baths have an alkaline pH of 8.0 - 9.0, which wipes out your good bacteria and creates an open invitation for yeast and bacterial infections!
          </p>
        </div>
      </div>

      {/* INTERACTIVE DISCHARGE DECODER */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-5">
        <div className="border-b border-stone-800 pb-3">
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-rose-400" />
            <span>Interactive Discharge Color & Texture Guide</span>
          </h2>
          <p className="text-xs text-stone-400">
            Select a color below to decode what your body is communicating.
          </p>
        </div>

        {/* Selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {dischargeTypes.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDischarge(idx)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedDischarge === idx
                  ? 'bg-rose-950/70 border-rose-500 shadow-md ring-1 ring-rose-400'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="w-5 h-5 rounded-full border mb-2 shadow-inner" style={{
                backgroundColor: idx === 0 ? '#ffffff' : idx === 1 ? '#f3f4f6' : idx === 2 ? '#fef3c7' : idx === 3 ? '#cbd5e1' : idx === 4 ? '#d9f99d' : '#78350f'
              }} />
              <div className="text-[11px] font-bold text-stone-200 line-clamp-2">
                {item.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Discharge Deep-Dive */}
        {dischargeTypes[selectedDischarge] && (
          <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
              <h3 className="text-sm font-bold text-rose-200">
                {dischargeTypes[selectedDischarge].title}
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${dischargeTypes[selectedDischarge].statusColor}`}>
                {dischargeTypes[selectedDischarge].status}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {dischargeTypes[selectedDischarge].description}
            </p>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-200">Recommended Action: </strong>
                <span className="text-stone-300">{dischargeTypes[selectedDischarge].action}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DOs & DON'Ts OF DAILY INTIMATE HYGIENE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DOs */}
        <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Golden Hygiene DOs
          </h3>
          <ul className="space-y-2 text-xs text-stone-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Wear 100% Breathable Cotton:</strong> Allows air circulation and prevents humidity traps where yeast thrives.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Wipe Front-to-Back:</strong> Crucial after using the bathroom to avoid transferring fecal bacteria into the urethra.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Rinse with Warm Water Only:</strong> Cleanse the vulva (external folds) gently. The inner vagina takes care of itself.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Urinate After Intercourse:</strong> Flushes out any mechanical bacteria before they can adhere to the urinary tract.</span>
            </li>
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-400" /> What to AVOID
          </h3>
          <ul className="space-y-2 text-xs text-stone-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Never Use Internal Douches:</strong> Strips your natural biome, forces bacteria up into the uterus, and drastically increases infection risk.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Avoid Scented Tampons & Sprays:</strong> Fragrances and chemical perfumes irritate sensitive mucous membranes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Don't Sit in Wet Workout Clothes:</strong> Change out of sweaty gym leggings or damp swimsuits immediately after activity.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Never Leave Tampons Over 8 Hours:</strong> Dramatically increases the danger of Toxic Shock Syndrome (TSS).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
