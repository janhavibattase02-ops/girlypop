export type ThemeMode = 'olive' | 'beige' | 'dark' | 'cherry';

export type DiscreetMode = 'none' | 'calculator' | 'notes';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergencyPrimary: boolean;
}

export interface UserProfile {
  phone: string;
  name: string;
  age: number;
  pin: string;
  trustedContacts: Contact[];
  isLoggedIn: boolean;
  onboardedAt: string;
  emergencyMessageTemplate?: string;
}

export interface PeriodLog {
  id: string;
  date: string; // YYYY-MM-DD
  flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  cramps: 'none' | 'mild' | 'moderate' | 'severe';
  mood: string[]; // e.g. 'happy', 'anxious', 'irritable', 'calm', 'exhausted'
  symptoms: string[]; // e.g. 'bloating', 'headache', 'acne', 'cravings', 'backache'
  notes?: string;
  waterGlasses?: number;
}

export interface CycleSettings {
  averageCycleDays: number;
  periodDurationDays: number;
  lastPeriodStartDate: string; // YYYY-MM-DD
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
  speed: number | null;
  heading: number | null;
  address?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: 'emergency' | 'period' | 'hygiene' | 'general';
}
