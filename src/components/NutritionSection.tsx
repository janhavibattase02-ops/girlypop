import React, { useState } from 'react';
import {
  Apple,
  Sparkles,
  Droplets,
  Heart,
  Flame,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Leaf,
  Clock,
  CupSoda,
} from 'lucide-react';

export const NutritionSection: React.FC = () => {
  const [activePhase, setActivePhase] = useState<'menstrual' | 'follicular' | 'ovulatory' | 'luteal'>('menstrual');

  const phaseData = {
    menstrual: {
      title: 'Menstrual Phase (Days 1 - 5)',
      subtitle: 'Nourish & Replenish Blood Loss',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Your hormone levels are at their lowest and your body requires warmth, bioavailable iron, and magnesium to soothe uterine contractions.',
      powerFoods: [
        { name: 'Dark Chocolate (70%+)', benefit: 'High in magnesium to relax muscle spasms and stimulate serotonin.' },
        { name: 'Warm Lentil & Spinach Stew', benefit: 'Replenishes iron lost during menstrual bleeding and prevents fatigue.' },
        { name: 'Fresh Ginger & Turmeric Tea', benefit: 'Clinically proven natural COX-2 inhibitor that rivals ibuprofen for cramps.' },
        { name: 'Wild Salmon or Chia Seeds', benefit: 'Rich in Omega-3 fatty acids that dampen inflammatory prostaglandins.' },
      ],
      comfortBeverage: 'Hot Cinnamon & Chamomile Infusion with raw honey',
      avoid: 'Cold icy beverages, salty processed chips (causes water retention), excess espresso.',
    },
    follicular: {
      title: 'Follicular Phase (Days 6 - 13)',
      subtitle: 'Energize & Boost Estrogen',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Estrogen and FSH levels are climbing. Your metabolism is efficient, mental focus is sharp, and gut microbiome thrives on vibrant fiber.',
      powerFoods: [
        { name: 'Avocado & Sprouted Grain Toast', benefit: 'Healthy fats support ovarian follicle maturation.' },
        { name: 'Kimchi & Greek Yogurt / Kefir', benefit: 'Probiotics keep vaginal flora balanced and prevent post-period yeast imbalances.' },
        { name: 'Pumpkin & Flax Seeds (Seed Cycling)', benefit: 'Phytoestrogens naturally balance healthy estrogen curves.' },
        { name: 'Citrus, Kiwi & Bell Peppers', benefit: 'Vitamin C stimulates collagen and boosts iron absorption.' },
      ],
      comfortBeverage: 'Matcha Green Tea Latte with almond milk',
      avoid: 'Heavy greasy fried meals that slow down your rising natural stamina.',
    },
    ovulatory: {
      title: 'Ovulatory Phase (Days 14 - 16)',
      subtitle: 'Fiber & Liver Support',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Estrogen peaks, triggering the LH surge. Your liver works overtime to metabolize excess hormones—feed it detoxifying fiber!',
      powerFoods: [
        { name: 'Raw Shredded Carrot Salad', benefit: 'Unique indigestible fiber binds to endotoxins and excess estrogen.' },
        { name: 'Cruciferous Greens (Broccoli, Kale)', benefit: 'Contains DIM (Diindolylmethane) to promote safe estrogen clearance.' },
        { name: 'Wild Blueberries & Blackberries', benefit: 'High ORAC antioxidants safeguard egg cellular health.' },
        { name: 'Quinoa & Hemp Hearts', benefit: 'Complete plant protein and zinc for peak hormonal vitality.' },
      ],
      comfortBeverage: 'Iced Hibiscus & Mint Tea with fresh lime',
      avoid: 'Dehydrating sugary cocktails or sodas during high metabolic temperature.',
    },
    luteal: {
      title: 'Luteal Phase (Days 17 - 28)',
      subtitle: 'Calm PMS & Stabilize Blood Sugar',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Progesterone rises, which can trigger water retention, mood swings, and sweet cravings. Stabilize blood sugar with slow-burning complex carbs!',
      powerFoods: [
        { name: 'Roasted Sweet Potatoes & Squash', benefit: 'Rich in Vitamin B6 to alleviate breast tenderness and PMS mood drops.' },
        { name: 'Walnuts & Sunflower Seeds', benefit: 'High in selenium and Vitamin E to support progesterone synthesis.' },
        { name: 'Warm Oats with Ceylon Cinnamon', benefit: 'Steadies glucose levels to eliminate 3 PM irritability.' },
        { name: 'Peppermint Tea', benefit: 'Relieves premenstrual abdominal gas, bloating, and digestive sluggishness.' },
      ],
      comfortBeverage: 'Golden Ashwagandha Moon Milk before sleep',
      avoid: 'Excess caffeine (can worsen breast tenderness and pre-period anxiety).',
    },
  };

  const selected = phaseData[activePhase];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Banner */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-amber-950/30 to-stone-900 p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
          <Apple className="w-3.5 h-3.5" />
          <span>Hormone & Cycle-Syncing Nutrition</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-100">
          Eat in Harmony with Your Cycle
        </h1>
        <p className="text-xs md:text-sm text-stone-300 max-w-xl">
          Your body's metabolic rate and nutrient requirements shift every single week of the month. Fuel your body with the exact vitamins it needs to conquer cramps and boost vitality.
        </p>

        {/* Phase Select Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={`py-3 px-3 rounded-2xl text-xs font-bold capitalize transition cursor-pointer border ${
                activePhase === p
                  ? 'bg-rose-700 text-white border-rose-500 shadow-lg'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700/60'
              }`}
            >
              {p} Phase
            </button>
          ))}
        </div>
      </div>

      {/* Main Phase Details Card */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-100">{selected.title}</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${selected.badge}`}>
                {selected.subtitle}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">{selected.description}</p>
          </div>
        </div>

        {/* Power Foods Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-400" /> Top Healing Foods for this Phase
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selected.powerFoods.map((food, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-3 hover:border-stone-700 transition"
              >
                <div className="p-2 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/50 shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-200 text-xs">{food.name}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{food.benefit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beverages and Cautions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/40 space-y-1">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" /> Best Tonic / Drink
            </span>
            <p className="text-xs text-stone-200 font-medium">{selected.comfortBeverage}</p>
          </div>

          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/40 space-y-1">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> What to Minimize
            </span>
            <p className="text-xs text-stone-300">{selected.avoid}</p>
          </div>
        </div>
      </div>

      {/* Instant Cramp Soothing Recipe Cards */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Emergency Anti-Cramp Kitchen Remedies</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
            <span className="text-xs font-bold text-amber-300">1. Golden Turmeric Elixir</span>
            <p className="text-[11px] text-stone-400">
              1 cup warm oat or almond milk, 1/2 tsp ground turmeric, 1/4 tsp ginger, pinch of black pepper (enhances absorption by 2000%), and raw honey.
            </p>
            <div className="text-[10px] text-emerald-400 font-semibold">Works within 25 mins to relieve prostaglandins</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
            <span className="text-xs font-bold text-rose-300">2. Magnesium Bliss Bites</span>
            <p className="text-[11px] text-stone-400">
              Mix 2 tbsp pumpkin seeds, 1 tbsp raw cacao powder, 1 medjool date, and 1 tsp almond butter. Roll into bites and chill.
            </p>
            <div className="text-[10px] text-emerald-400 font-semibold">Stops uterine muscle cramping & sweet cravings</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
            <span className="text-xs font-bold text-purple-300">3. Iron Rebuilder Smoothie</span>
            <p className="text-[11px] text-stone-400">
              1 cup coconut water, 1 cup baby spinach, 1/2 cup frozen blackberries, 1 tbsp chia seeds, and a squeeze of fresh lemon juice.
            </p>
            <div className="text-[10px] text-emerald-400 font-semibold">Combats heavy flow fatigue & dizziness</div>
          </div>
        </div>
      </div>
    </div>
  );
};
