import React, { useState } from 'react';
import {
  Calendar,
  Heart,
  Droplet,
  Sparkles,
  Plus,
  Info,
  Smile,
  Frown,
  Activity,
  Flame,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  EyeOff,
  Coffee,
} from 'lucide-react';
import { PeriodLog, CycleSettings, UserProfile } from '../types';

interface PeriodTrackerProps {
  user: UserProfile;
  logs: PeriodLog[];
  cycleSettings: CycleSettings;
  onUpdateLogs: (newLogs: PeriodLog[]) => void;
  onUpdateSettings: (newSettings: CycleSettings) => void;
  onTriggerDiscreetCalculator: () => void;
  onDeleteLog?: (date: string, id?: string) => void;
}

export const PeriodTracker: React.FC<PeriodTrackerProps> = ({
  user,
  logs,
  cycleSettings,
  onUpdateLogs,
  onUpdateSettings,
  onTriggerDiscreetCalculator,
  onDeleteLog,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Form states for selected day
  const currentLog = logs.find((l) => l.date === selectedDate);
  const [flow, setFlow] = useState<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>(
    currentLog?.flow || 'none'
  );
  const [cramps, setCramps] = useState<'none' | 'mild' | 'moderate' | 'severe'>(
    currentLog?.cramps || 'none'
  );
  const [selectedMoods, setSelectedMoods] = useState<string[]>(currentLog?.mood || []);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(currentLog?.symptoms || []);
  const [notes, setNotes] = useState<string>(currentLog?.notes || '');
  const [waterCount, setWaterCount] = useState<number>(currentLog?.waterGlasses || 6);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form when selected date changes
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = logs.find((l) => l.date === dateStr);
    if (existing) {
      setFlow(existing.flow);
      setCramps(existing.cramps);
      setSelectedMoods(existing.mood || []);
      setSelectedSymptoms(existing.symptoms || []);
      setNotes(existing.notes || '');
      setWaterCount(existing.waterGlasses || 6);
    } else {
      setFlow('none');
      setCramps('none');
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setNotes('');
      setWaterCount(6);
    }
    setSaveSuccess(false);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PeriodLog = {
      id: currentLog ? currentLog.id : 'log_' + Date.now(),
      date: selectedDate,
      flow,
      cramps,
      mood: selectedMoods,
      symptoms: selectedSymptoms,
      notes,
      waterGlasses: waterCount,
    };

    const filtered = logs.filter((l) => l.date !== selectedDate);
    const updated = [...filtered, newLog];
    onUpdateLogs(updated);

    // If flow is medium or heavy, optionally update lastPeriodStartDate
    if (flow === 'medium' || flow === 'heavy') {
      const logDate = new Date(selectedDate).getTime();
      const lastStart = new Date(cycleSettings.lastPeriodStartDate).getTime();
      if (Math.abs(logDate - lastStart) > 15 * 24 * 60 * 60 * 1000) {
        onUpdateSettings({ ...cycleSettings, lastPeriodStartDate: selectedDate });
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteLog = () => {
    if (!currentLog) return;
    if (onDeleteLog) {
      onDeleteLog(selectedDate, currentLog.id);
    } else {
      onUpdateLogs(logs.filter((l) => l.date !== selectedDate));
    }
    setFlow('none');
    setCramps('none');
    setSelectedMoods([]);
    setSelectedSymptoms([]);
    setNotes('');
    setWaterCount(6);
  };

  // Cycle calculations
  const lastStart = new Date(cycleSettings.lastPeriodStartDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentCycleDay = ((diffDays % cycleSettings.averageCycleDays) + cycleSettings.averageCycleDays) % cycleSettings.averageCycleDays + 1;
  const daysUntilNextPeriod = cycleSettings.averageCycleDays - currentCycleDay;

  // Determine Current Phase
  let currentPhase = 'Menstrual Phase';
  let phaseColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  let phaseDesc = 'Rest, replenish iron, warm beverages, and gentle warmth.';

  if (currentCycleDay <= cycleSettings.periodDurationDays) {
    currentPhase = 'Menstrual Phase';
    phaseColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    phaseDesc = 'Your body is shedding the uterine lining. Rest, stay warm, and replenish iron.';
  } else if (currentCycleDay <= 13) {
    currentPhase = 'Follicular Phase';
    phaseColor = 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    phaseDesc = 'Estrogen rises, energy surges! Ideal time for new projects, creativity, and fresh foods.';
  } else if (currentCycleDay <= 16) {
    currentPhase = 'Ovulatory Phase';
    phaseColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    phaseDesc = 'Peak fertility window and highest stamina. Hydrate well and eat antioxidant-rich meals.';
  } else {
    currentPhase = 'Luteal Phase';
    phaseColor = 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    phaseDesc = 'Progesterone dominates. You may experience PMS, bloating, or cravings. Focus on magnesium and complex carbs.';
  }

  // Age-based guidance
  const isTeen = user.age <= 19;

  // Calendar rendering helper & Phase predictor for any date
  const getPhaseForDate = (dateStr: string) => {
    const log = logs.find((l) => l.date === dateStr);
    const hasFlow = log && log.flow && log.flow !== 'none';
    const hasSymptomsOrNotes = log && (log.cramps !== 'none' || (log.mood && log.mood.length > 0) || (log.symptoms && log.symptoms.length > 0) || (log.notes && log.notes.trim() !== ''));

    const lastStart = new Date(cycleSettings.lastPeriodStartDate + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.floor((target.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
    const cDay = ((diffDays % cycleSettings.averageCycleDays) + cycleSettings.averageCycleDays) % cycleSettings.averageCycleDays + 1;

    let phaseName = 'Normal Day';
    let cellBg = 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/60 text-stone-300';
    let iconSymbol = null;

    if (hasFlow) {
      phaseName = 'Recorded Flow';
      cellBg = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-sm';
      iconSymbol = '💧';
    } else if (cDay <= cycleSettings.periodDurationDays) {
      phaseName = 'Predicted Period';
      cellBg = 'bg-rose-900/30 border-rose-600/50 text-rose-200';
      iconSymbol = '🌸';
    } else {
      const ovulationDay = cycleSettings.averageCycleDays - 14;
      if (cDay === ovulationDay) {
        phaseName = 'Ovulation Day';
        cellBg = 'bg-purple-950/60 border-purple-500/60 text-purple-200';
        iconSymbol = '✨';
      } else if (cDay >= ovulationDay - 4 && cDay <= ovulationDay + 1) {
        phaseName = 'Fertile Window';
        cellBg = 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200';
        iconSymbol = '🌿';
      }
    }

    if (hasSymptomsOrNotes && !hasFlow && !iconSymbol) {
      iconSymbol = '📝';
    }

    return { cDay, phaseName, cellBg, iconSymbol, hasLog: !!log };
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const moodsList = ['Happy', 'Calm', 'Sensitive', 'Anxious', 'Irritable', 'Exhausted', 'Emotional'];
  const symptomsList = ['Bloating', 'Backache', 'Headache', 'Acne', 'Breast Tenderness', 'Cravings', 'Nausea'];

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-rose-950/40 to-stone-900 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${phaseColor}`}>
              Day {currentCycleDay} of {cycleSettings.averageCycleDays} • {currentPhase}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300">
              Calibrated for Age {user.age}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">
            {daysUntilNextPeriod > 0
              ? `Next Period in ~${daysUntilNextPeriod} Days`
              : 'Period Expected Today'}
          </h1>
          <p className="text-xs text-stone-300 max-w-md">{phaseDesc}</p>
        </div>

        {/* Discreet Disguise Quick Trigger */}
        <button
          onClick={onTriggerDiscreetCalculator}
          className="px-4 py-2.5 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          title="Someone peeking? Disguise instantly!"
        >
          <EyeOff className="w-4 h-4 text-rose-400" />
          <span>Quick Disguise (Calculator)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CALENDAR (5 cols on large) */}
        <div className="lg:col-span-5 rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>
                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </h2>
            <div className="flex gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stone-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysArray.map((day, idx) => {
              if (!day) return <div key={idx} className="h-10" />;

              const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const phaseInfo = getPhaseForDate(dayDateStr);
              const isSelected = selectedDate === dayDateStr;
              const isCurrentDay =
                dayDateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDate(dayDateStr)}
                  title={`${dayDateStr}: ${phaseInfo.phaseName} (Day ${phaseInfo.cDay})`}
                  className={`relative h-11 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'ring-2 ring-rose-400 shadow-md bg-rose-600 text-white font-bold border-rose-500'
                      : isCurrentDay
                      ? 'ring-1 ring-rose-400/80 ' + phaseInfo.cellBg
                      : phaseInfo.cellBg
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    <span className="text-[11px]">{day}</span>
                    {phaseInfo.iconSymbol && <span className="text-[10px]">{phaseInfo.iconSymbol}</span>}
                  </div>
                  <span className="text-[8px] opacity-75 truncate max-w-[32px]">
                    {phaseInfo.phaseName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Legend */}
          <div className="pt-3 border-t border-stone-800 space-y-1.5">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Calendar Phase Legend</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Recorded Flow (💧)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/60 border border-rose-500" /> Predicted Period (🌸)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Fertile Window (🌿)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Ovulation Day (✨)
              </span>
            </div>
          </div>
        </div>

        {/* LOGGING FORM FOR SELECTED DATE (7 cols on large) */}
        <div className="lg:col-span-7 rounded-3xl border border-stone-800 bg-stone-900/90 p-5 md:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-rose-100">
                Log for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-stone-400">Track your flow, pain level, and emotional wellness.</p>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveLog} className="space-y-4">
            {/* 1. Flow Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-rose-400" /> Menstrual Flow
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['none', 'spotting', 'light', 'medium', 'heavy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFlow(lvl)}
                    className={`py-2 px-1 text-xs rounded-xl capitalize font-medium transition cursor-pointer text-center ${
                      flow === lvl
                        ? 'bg-rose-600 text-white font-bold shadow'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Cramps / Pelvic Pain */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Cramp Severity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['none', 'mild', 'moderate', 'severe'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCramps(c)}
                    className={`py-2 text-xs rounded-xl capitalize font-medium transition cursor-pointer text-center ${
                      cramps === c
                        ? 'bg-amber-600 text-white font-bold shadow'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Moods */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Mood & Emotional State
              </label>
              <div className="flex flex-wrap gap-1.5">
                {moodsList.map((m) => {
                  const active = selectedMoods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleArrayItem(selectedMoods, setSelectedMoods, m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-purple-600 text-white font-semibold shadow'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Physical Symptoms */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Physical Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {symptomsList.map((s) => {
                  const active = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleArrayItem(selectedSymptoms, setSelectedSymptoms, s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        active
                          ? 'bg-rose-700 text-white font-semibold shadow'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Hydration counter & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Water Hydration</span>
                  <span className="text-cyan-200">{waterCount} glasses</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                    className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-cyan-300 font-mono text-sm bg-stone-800/80 py-2 rounded-xl">
                    💧 {waterCount * 250} ml
                  </div>
                  <button
                    type="button"
                    onClick={() => setWaterCount(waterCount + 1)}
                    className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Private Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. used heating pad, took nap"
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Submit & Delete */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-[0.99] cursor-pointer"
              >
                {currentLog ? 'Update Day Log' : 'Save Day Log'}
              </button>
              {currentLog && (
                <button
                  type="button"
                  onClick={handleDeleteLog}
                  className="px-4 py-3 rounded-2xl bg-stone-800 hover:bg-red-950/80 border border-stone-700 hover:border-red-700/60 text-stone-300 hover:text-red-200 text-xs font-semibold transition cursor-pointer"
                  title="Delete log for this date"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
