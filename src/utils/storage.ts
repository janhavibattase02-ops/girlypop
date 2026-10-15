import { UserProfile, PeriodLog, CycleSettings, ThemeMode } from '../types';

const USER_KEY = 'girlypop_user_profile';
const PERIOD_LOGS_KEY = 'girlypop_period_logs';
const CYCLE_SETTINGS_KEY = 'girlypop_cycle_settings';
const THEME_KEY = 'girlypop_theme_mode';
const APP_LOCKED_KEY = 'girlypop_is_locked';

export const DEFAULT_USER: UserProfile = {
  phone: '+1 (555) 923-4581',
  name: 'Maya',
  age: 19,
  pin: '1234',
  isLoggedIn: false,
  onboardedAt: new Date().toISOString(),
  emergencyMessageTemplate: "EMERGENCY: I feel unsafe. Here is my live GPS location! Please check on me immediately.",
  trustedContacts: [
    {
      id: 'c1',
      name: 'Mom',
      phone: '+1 (555) 302-8891',
      relationship: 'Mother',
      isEmergencyPrimary: true,
    },
    {
      id: 'c2',
      name: 'Chloe (Roommate)',
      phone: '+1 (555) 441-2093',
      relationship: 'Bestie',
      isEmergencyPrimary: true,
    },
    {
      id: 'c3',
      name: 'Campus Safety / Police',
      phone: '911',
      relationship: 'Emergency Authority',
      isEmergencyPrimary: false,
    },
  ],
};

export const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  averageCycleDays: 28,
  periodDurationDays: 5,
  lastPeriodStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export const INITIAL_PERIOD_LOGS: PeriodLog[] = [
  {
    id: 'l1',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    flow: 'heavy',
    cramps: 'moderate',
    mood: ['Sensitive', 'Tired'],
    symptoms: ['Bloating', 'Backache'],
    notes: 'Started morning with warm ginger tea and heating pad.',
    waterGlasses: 7,
  },
  {
    id: 'l2',
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    flow: 'medium',
    cramps: 'mild',
    mood: ['Calm'],
    symptoms: ['Mild cramping'],
    notes: 'Felt much better after gentle walk.',
    waterGlasses: 8,
  },
];

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return DEFAULT_USER;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function getPeriodLogs(): PeriodLog[] {
  try {
    const raw = localStorage.getItem(PERIOD_LOGS_KEY);
    if (!raw) return INITIAL_PERIOD_LOGS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PERIOD_LOGS;
  }
}

export function savePeriodLogs(logs: PeriodLog[]): void {
  localStorage.setItem(PERIOD_LOGS_KEY, JSON.stringify(logs));
}

export function getCycleSettings(): CycleSettings {
  try {
    const raw = localStorage.getItem(CYCLE_SETTINGS_KEY);
    if (!raw) return DEFAULT_CYCLE_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CYCLE_SETTINGS;
  }
}

export function saveCycleSettings(settings: CycleSettings): void {
  localStorage.setItem(CYCLE_SETTINGS_KEY, JSON.stringify(settings));
}

export function getThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (raw === 'olive' || raw === 'beige' || raw === 'dark') return raw;
    return 'olive';
  } catch {
    return 'olive';
  }
}

export function saveThemeMode(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getAppLockedState(): boolean {
  return localStorage.getItem(APP_LOCKED_KEY) === 'true';
}

export function setAppLockedState(locked: boolean): void {
  localStorage.setItem(APP_LOCKED_KEY, locked ? 'true' : 'false');
}

// Simple reversible encryption cipher for client backups
export function encryptBackupPayload(data: object, passcode: string): string {
  const jsonStr = JSON.stringify(data);
  let salt = 0;
  for (let i = 0; i < passcode.length; i++) {
    salt += passcode.charCodeAt(i);
  }
  let encoded = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ (salt % 255);
    encoded += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(encoded)));
}

export function decryptBackupPayload(encrypted: string, passcode: string): any {
  try {
    const decoded = decodeURIComponent(escape(atob(encrypted)));
    let salt = 0;
    for (let i = 0; i < passcode.length; i++) {
      salt += passcode.charCodeAt(i);
    }
    let original = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ (salt % 255);
      original += String.fromCharCode(charCode);
    }
    return JSON.parse(original);
  } catch (e) {
    throw new Error('Invalid encryption passcode or corrupted backup payload.');
  }
}
