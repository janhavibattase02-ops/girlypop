import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Calendar,
  Apple,
  Heart,
  Stethoscope,
  Lock,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  Shield,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

export type ActiveTab =
  | 'safety'
  | 'assistant'
  | 'period'
  | 'nutrition'
  | 'hygiene'
  | 'medical'
  | 'security';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  onSelectTheme: (t: ThemeMode) => void;
  onTriggerDisguise: () => void;
  onLockApp: () => void;
  onLogout: () => void;
  user: UserProfile;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onSelectTheme,
  onTriggerDisguise,
  onLockApp,
  onLogout,
  user,
}) => {
  const tabs = [
    { id: 'safety' as ActiveTab, label: 'Safety OS', icon: ShieldAlert, highlight: true },
    { id: 'assistant' as ActiveTab, label: 'GirlyPop AI', icon: Sparkles },
    { id: 'period' as ActiveTab, label: 'Period Tracker', icon: Calendar },
    { id: 'nutrition' as ActiveTab, label: 'Healthy Food', icon: Apple },
    { id: 'hygiene' as ActiveTab, label: 'Vaginal & Hygiene', icon: Heart },
    { id: 'medical' as ActiveTab, label: 'Medical Guide', icon: Stethoscope },
    { id: 'security' as ActiveTab, label: 'PIN & Backups', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#c8d8c3]/80 backdrop-blur-xl bg-[#e6efe3]/90 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* App Logo & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('safety')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e88dad] via-[#f0a6be] to-[#9b5de5] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition border border-white/40">
              <span className="text-xl">🍒</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-serif font-black tracking-tight text-[#2b1f24]">
                  GirlyPop
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#e88dad]/20 text-[#735562] font-sans font-bold border border-[#e88dad]/30">
                  OS
                </span>
              </div>
              <div className="text-[10px] text-[#735562] font-medium">
                Safe • Discreet • Wellness (Age {user.age})
              </div>
            </div>
          </button>
        </div>

        {/* Right Tools: 3 Modes (Pastel, Beige, Dark) + Disguise + Lock + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 3 Theme Selector */}
          <div className="flex items-center p-1 rounded-2xl bg-white/80 border border-[#ebd5dd] text-xs shadow-xs">
            {/* Pastel Rose & Lavender Mode */}
            <button
              onClick={() => onSelectTheme('olive')}
              className={`px-2 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px] font-semibold ${
                theme === 'olive'
                  ? 'bg-[#e88dad] text-white shadow font-bold'
                  : 'text-[#735562] hover:text-[#2b1f24]'
              }`}
              title="Pastel Rose & Lavender Mode"
            >
              <span>🍒</span>
              <span className="hidden md:inline">Pastel</span>
            </button>

            {/* Beige Mode */}
            <button
              onClick={() => onSelectTheme('beige')}
              className={`px-2 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px] font-semibold ${
                theme === 'beige'
                  ? 'bg-[#efe7dc] text-[#252f19] shadow font-bold'
                  : 'text-[#4e6847] hover:text-[#24331e]'
              }`}
              title="Beige Mode"
            >
              <Sun className="w-3 h-3 text-amber-600" />
              <span className="hidden md:inline">Beige</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => onSelectTheme('dark')}
              className={`px-2 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px] font-semibold ${
                theme === 'dark'
                  ? 'bg-stone-900 text-[#b4e6a4] shadow font-bold'
                  : 'text-[#4e6847] hover:text-[#24331e]'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3 h-3" />
              <span className="hidden md:inline">Dark</span>
            </button>
          </div>

          {/* Quick Disguise Button */}
          <button
            onClick={onTriggerDisguise}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/85 hover:bg-white text-[#2f4227] border border-[#c5d7c0] text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Immediate Calculator Disguise (Hides sensitive health data)"
          >
            <EyeOff className="w-3.5 h-3.5 text-[#5c8052]" />
            <span className="hidden sm:inline text-[11px] font-semibold">Disguise</span>
          </button>

          {/* Lock App Button */}
          <button
            onClick={onLockApp}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/85 hover:bg-white text-[#2f4227] border border-[#c5d7c0] text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Lock with 4-Digit PIN"
          >
            <Lock className="w-3.5 h-3.5 text-[#5c8052]" />
            <span className="hidden sm:inline text-[11px] font-semibold">Lock</span>
          </button>

          {/* Log Out / Return to Landing Page for Supabase Testing */}
          <button
            onClick={onLogout}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/70 hover:bg-white text-[#526a4a] hover:text-red-600 border border-[#c5d7c0] text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
            title="Log Out & Return to Landing / Login Page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[10px] font-semibold">Landing</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-6xl mx-auto px-4 overflow-x-auto flex gap-1.5 no-scrollbar pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? tab.highlight
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/30 ring-1 ring-red-400'
                    : 'bg-[#e88dad] text-white shadow-sm ring-1 ring-[#f4a6be]'
                  : 'text-[#735562] hover:text-[#2b1f24] hover:bg-white/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-red-500' : 'text-[#e88dad]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
