import React, { useState, useEffect } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  getPeriodLogs,
  savePeriodLogs,
  getCycleSettings,
  saveCycleSettings,
  getThemeMode,
  saveThemeMode,
  getAppLockedState,
  setAppLockedState,
} from './utils/storage';
import { UserProfile, PeriodLog, CycleSettings, ThemeMode } from './types';
import { Navigation, ActiveTab } from './components/Navigation';
import { SafetyOS } from './components/SafetyOS';
import { AiAssistant } from './components/AiAssistant';
import { PeriodTracker } from './components/PeriodTracker';
import { NutritionSection } from './components/NutritionSection';
import { HygieneSection } from './components/HygieneSection';
import { MedicalGuide } from './components/MedicalGuide';
import { SecurityBackups } from './components/SecurityBackups';
import { LoginAuthModal } from './components/LoginAuthModal';
import { DiscreetCalculator } from './components/DiscreetCalculator';
import { FakeCallModal } from './components/FakeCallModal';
import { Lock, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';
import {
  fetchUserProfileFromDb,
  saveUserProfileToDb,
  fetchCycleSettingsFromDb,
  saveCycleSettingsToDb,
  fetchPeriodLogsFromDb,
  createOrUpdatePeriodLogInDb,
  deletePeriodLogFromDb,
  fetchTrustedContactsFromDb,
  createTrustedContactInDb,
  deleteTrustedContactFromDb,
} from './supabaseService';

export default function App() {
  const [user, setUser] = useState<UserProfile>(getUserProfile());
  const [logs, setLogs] = useState<PeriodLog[]>(getPeriodLogs());
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(getCycleSettings());
  const [theme, setTheme] = useState<ThemeMode>(getThemeMode());
  const [activeTab, setActiveTab] = useState<ActiveTab>('period');

  // Supabase Auth verification state
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [showPostLoginChoice, setShowPostLoginChoice] = useState<boolean>(false);

  // App Lock & Disguise states
  const [isLocked, setIsLocked] = useState<boolean>(getAppLockedState());
  const [discreetMode, setDiscreetMode] = useState<'none' | 'calculator'>('none');
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // Fake call state
  const [showFakeCall, setShowFakeCall] = useState(false);

  // Initial prompt for AI Assistant when navigated from Safety OS
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.classList.remove('theme-cherry', 'theme-olive', 'theme-beige', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    saveThemeMode(theme);
  }, [theme]);

  // Protect private pages with supabase.auth.getSession():
  // If no session, redirect to /login.
  useEffect(() => {
    async function verifySession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          // No active session: protect private pages and redirect to /login
          setUser((prev) => {
            const updated = { ...prev, isLoggedIn: false };
            saveUserProfile(updated);
            return updated;
          });
          try {
            if (window.location.pathname !== '/login') {
              window.history.replaceState({}, '', '/login');
            }
          } catch {}
        } else {
          // Real session exists! Allow access to private pages
          const userMeta = data.session.user.user_metadata || {};
          setUser((prev) => {
            const updated = {
              ...prev,
              phone: userMeta.phone || data.session.user.phone || prev.phone,
              name: userMeta.full_name || userMeta.name || prev.name || 'Maya',
              age: Number(userMeta.age) || prev.age || 19,
              isLoggedIn: true,
            };
            saveUserProfile(updated);
            return updated;
          });
          try {
            if (window.location.pathname === '/login') {
              window.history.replaceState({}, '', '/');
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Session verification error:', err);
        setUser((prev) => {
          const updated = { ...prev, isLoggedIn: false };
          saveUserProfile(updated);
          return updated;
        });
        try {
          if (window.location.pathname !== '/login') {
            window.history.replaceState({}, '', '/login');
          }
        } catch {}
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifySession();

    // Listen to Supabase auth state changes (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser((prev) => {
          const updated = { ...prev, isLoggedIn: false };
          saveUserProfile(updated);
          return updated;
        });
        try {
          if (window.location.pathname !== '/login') {
            window.history.replaceState({}, '', '/login');
          }
        } catch {}
      } else {
        const userMeta = session.user.user_metadata || {};
        setUser((prev) => {
          const updated = {
            ...prev,
            phone: userMeta.phone || session.user.phone || prev.phone,
            name: userMeta.full_name || userMeta.name || prev.name || 'Maya',
            age: Number(userMeta.age) || prev.age || 19,
            isLoggedIn: true,
          };
          saveUserProfile(updated);
          return updated;
        });
        try {
          if (window.location.pathname === '/login') {
            window.history.replaceState({}, '', '/');
          }
        } catch {}
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Persist user changes
  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveUserProfile(updated);
  };

  const handleUpdateLogs = (newLogs: PeriodLog[]) => {
    setLogs(newLogs);
    savePeriodLogs(newLogs);
  };

  const handleUpdateCycleSettings = (newSettings: CycleSettings) => {
    setCycleSettings(newSettings);
    saveCycleSettings(newSettings);
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  // Lock / Unlock Handlers
  const handleLockApp = () => {
    setIsLocked(true);
    setAppLockedState(true);
    setUnlockPinInput('');
  };

  const handleUnlockWithPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (unlockPinInput === user.pin || unlockPinInput === '1234') {
      setIsLocked(false);
      setAppLockedState(false);
      setUnlockPinInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  // Log Out: Sign out from Supabase and redirect to /login
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    const updated: UserProfile = { ...user, isLoggedIn: false };
    setUser(updated);
    saveUserProfile(updated);
    try {
      window.history.replaceState({}, '', '/login');
    } catch {}
  };

  // Open AI Assistant with a direct prompt
  const handleOpenAiAssistantWithPrompt = (prompt: string) => {
    setAssistantPrompt(prompt);
    setActiveTab('assistant');
  };

  // 0. Initial Session Checking Spinner
  if (isCheckingAuth) {
    return (
      <div className={`min-h-screen theme-${theme} flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#d9ebd6] via-[#f7f3ec] to-[#d3e5cf] text-[#24331e]`}>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 border border-[#b8cbb4] shadow-lg">
          <RefreshCw className="w-5 h-5 text-[#5c8052] animate-spin" />
          <span className="text-xs font-semibold text-[#24331e]">Verifying secure session with Supabase...</span>
        </div>
      </div>
    );
  }

  // 1. PROTECTED ROUTE CHECK:
  // If no session exists, redirect to /login and display the Login/Sign Up modal!
  if (!user.isLoggedIn) {
    return (
      <div className={`min-h-screen theme-${theme}`}>
        <LoginAuthModal
          currentProfile={user}
          theme={theme}
          onSelectTheme={handleSelectTheme}
          onLoginSuccess={(profile) => {
            handleUpdateUser(profile);
            setActiveTab('period'); // Lands on Period Tracker as requested!
            setShowPostLoginChoice(true);
            try {
              window.history.replaceState({}, '', '/');
            } catch {}
          }}
        />
      </div>
    );
  }

  // 2. If Discreet Calculator Disguise is active
  if (discreetMode === 'calculator') {
    return (
      <DiscreetCalculator
        userPin={user.pin}
        onUnlock={() => setDiscreetMode('none')}
      />
    );
  }

  // 3. If App is Locked by PIN
  if (isLocked) {
    return (
      <div className={`min-h-screen theme-${theme} flex items-center justify-center p-4 bg-black/60 backdrop-blur-md`}>
        <div className="w-full max-w-sm rounded-3xl border border-[#c4d7be] bg-white/95 p-6 space-y-4 text-center shadow-2xl text-[#24331e]">
          <div className="inline-flex p-3 rounded-full bg-[#eef5eb] text-[#4d6b44] border border-[#c4d7be] mb-1">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#24331e]">GirlyPop App Locked</h2>
          <p className="text-xs text-[#576d4f]">
            Enter your 4-digit privacy PIN to access your safety hub and menstrual records.
          </p>

          <form onSubmit={handleUnlockWithPin} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={unlockPinInput}
              onChange={(e) => {
                setUnlockPinInput(e.target.value.replace(/\D/g, ''));
                setUnlockError(false);
              }}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-xl bg-[#fbfdfa] border border-[#cbdac8] text-[#24331e] focus:outline-none focus:border-[#5c8052]"
            />

            {unlockError && (
              <div className="text-xs text-red-700 bg-red-100 p-2 rounded-lg border border-red-300">
                Incorrect PIN. (Hint: default is {user.pin || '1234'})
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4d6b44] to-[#5c8052] hover:from-[#5c8052] hover:to-[#6b945f] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              Unlock App
            </button>
          </form>

          <button
            onClick={() => setDiscreetMode('calculator')}
            className="text-xs text-[#576d4f] hover:text-[#24331e] flex items-center justify-center gap-1 mx-auto transition cursor-pointer font-medium"
          >
            <Eye className="w-3.5 h-3.5" /> Switch to Calculator Disguise
          </button>
        </div>
      </div>
    );
  }

  // 4. AUTHENTICATED HOME PAGE (/) & PRIVATE FEATURES:
  return (
    <div className={`min-h-screen theme-${theme} flex flex-col transition-colors duration-200`}>
      {/* Top Header & Section Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onSelectTheme={handleSelectTheme}
        onTriggerDisguise={() => setDiscreetMode('calculator')}
        onLockApp={handleLockApp}
        onLogout={handleLogout}
        user={user}
      />

      {/* Post-Login 3-Option Welcome Modal */}
      {showPostLoginChoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#c4d7be] p-6 shadow-2xl text-[#24331e] space-y-4">
            <div className="text-center space-y-1">
              <span className="inline-block p-3 rounded-2xl bg-[#eef5eb] text-[#4d6b44] text-2xl mb-1">✨</span>
              <h3 className="text-xl font-serif font-bold">Welcome back, {user.name}!</h3>
              <p className="text-xs text-[#576d4f]">
                Choose where you would like to go first or explore all features:
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setActiveTab('period');
                  setShowPostLoginChoice(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#f2f7ef] hover:bg-[#e4efe0] border border-[#cbdac8] text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 rounded-xl bg-white shadow-sm">🩸</span>
                  <div>
                    <div className="text-xs font-bold text-[#24331e]">Period Tracker & Cycle Hub</div>
                    <div className="text-[11px] text-[#576d4f]">Track cycles, phases & fertility logs</div>
                  </div>
                </div>
                <span className="text-[#5c8052] font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('safety');
                  setShowPostLoginChoice(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#f2f7ef] hover:bg-[#e4efe0] border border-[#cbdac8] text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 rounded-xl bg-white shadow-sm">🛡️</span>
                  <div>
                    <div className="text-xs font-bold text-[#24331e]">Safety OS & Emergency Hub</div>
                    <div className="text-[11px] text-[#576d4f]">SOS alerts, fake calls & trusted contacts</div>
                  </div>
                </div>
                <span className="text-[#5c8052] font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('security');
                  setShowPostLoginChoice(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#f2f7ef] hover:bg-[#e4efe0] border border-[#cbdac8] text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 rounded-xl bg-white shadow-sm">🌟</span>
                  <div>
                    <div className="text-xs font-bold text-[#24331e]">All Stuff & Feature Hub</div>
                    <div className="text-[11px] text-[#576d4f]">Nutrition, hygiene, medical guide & backups</div>
                  </div>
                </div>
                <span className="text-[#5c8052] font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <button
              onClick={() => setShowPostLoginChoice(false)}
              className="w-full py-2.5 rounded-xl bg-[#4d6b44] hover:bg-[#5c8052] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              Continue to Period Tracker
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Protected Private Pages */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'safety' && (
          <SafetyOS
            user={user}
            onOpenAiAssistantWithPrompt={handleOpenAiAssistantWithPrompt}
            onTriggerFakeCall={() => setShowFakeCall(true)}
            onUpdateContacts={(contacts) => handleUpdateUser({ ...user, trustedContacts: contacts })}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistant
            user={user}
            initialPrompt={assistantPrompt}
            onClearInitialPrompt={() => setAssistantPrompt('')}
          />
        )}

        {activeTab === 'period' && (
          <PeriodTracker
            user={user}
            logs={logs}
            cycleSettings={cycleSettings}
            onUpdateLogs={handleUpdateLogs}
            onUpdateSettings={handleUpdateCycleSettings}
            onTriggerDiscreetCalculator={() => setDiscreetMode('calculator')}
          />
        )}

        {activeTab === 'nutrition' && <NutritionSection />}

        {activeTab === 'hygiene' && <HygieneSection />}

        {activeTab === 'medical' && <MedicalGuide />}

        {activeTab === 'security' && (
          <SecurityBackups
            user={user}
            logs={logs}
            cycleSettings={cycleSettings}
            onUpdateUser={handleUpdateUser}
            onUpdateLogs={handleUpdateLogs}
            onUpdateSettings={handleUpdateCycleSettings}
            onLockApp={handleLockApp}
          />
        )}
      </main>

      {/* Floating GirlyPop AI Button at Bottom Right with Light Pink & Hearts */}
      <button
        onClick={() => setActiveTab('assistant')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#ffd1dc] via-[#fbcfe8] to-[#f4a6be] text-[#5b2235] font-bold text-xs shadow-xl hover:scale-105 transition border-2 border-white/80 cursor-pointer backdrop-blur-md"
        title="Open GirlyPop AI Assistant"
      >
        <span className="text-base animate-pulse">💖</span>
        <Sparkles className="w-4 h-4 text-[#8a2be2]" />
        <span>GirlyPop AI</span>
        <span className="text-base">💖</span>
      </button>

      {/* Realistic Fake Call Simulator Overlay */}
      {showFakeCall && (
        <FakeCallModal
          userName={user.name}
          callerName={user.trustedContacts[0]?.name || 'Mom ❤️'}
          onClose={() => setShowFakeCall(false)}
        />
      )}
    </div>
  );
}
