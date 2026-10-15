import { supabase } from './supabaseClient';
import { UserProfile, PeriodLog, CycleSettings, Contact } from './types';
import {
  getUserProfile as getLocalUserProfile,
  saveUserProfile as saveLocalUserProfile,
  getPeriodLogs as getLocalPeriodLogs,
  savePeriodLogs as saveLocalPeriodLogs,
  getCycleSettings as getLocalCycleSettings,
  saveCycleSettings as saveLocalCycleSettings,
} from './utils/storage';

/**
 * Supabase Data Service
 * Provides clean CRUD functions for:
 * - User Profiles (profiles)
 * - Cycle Settings (cycle_settings)
 * - Period Logs (period_logs)
 * - Trusted Contacts (trusted_contacts)
 *
 * Implements optimistic local caching as fallback when tables are being initialized.
 */

// Helper to get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 1. PROFILES: Load & Save
// -------------------------------------------------------------

export async function fetchUserProfileFromDb(fallbackProfile: UserProfile): Promise<UserProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallbackProfile;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) {
      return fallbackProfile;
    }

    const merged: UserProfile = {
      ...fallbackProfile,
      name: data.name || fallbackProfile.name,
      phone: data.phone || fallbackProfile.phone,
      age: data.age || fallbackProfile.age,
      pin: data.pin || fallbackProfile.pin,
      emergencyMessageTemplate: data.emergency_message_template || fallbackProfile.emergencyMessageTemplate,
    };

    saveLocalUserProfile(merged);
    return merged;
  } catch (err) {
    console.warn('Supabase fetchUserProfile error:', err);
    return fallbackProfile;
  }
}

export async function saveUserProfileToDb(profile: UserProfile): Promise<void> {
  // Always update local cache first for responsiveness
  saveLocalUserProfile(profile);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        phone: profile.phone,
        name: profile.name,
        age: profile.age,
        pin: profile.pin,
        emergency_message_template: profile.emergencyMessageTemplate,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('Supabase saveUserProfile error:', err);
  }
}

// -------------------------------------------------------------
// 2. CYCLE SETTINGS: Load & Save
// -------------------------------------------------------------

export async function fetchCycleSettingsFromDb(fallback: CycleSettings): Promise<CycleSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;

    const { data, error } = await supabase
      .from('cycle_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return fallback;
    }

    const settings: CycleSettings = {
      averageCycleDays: data.average_cycle_days ?? fallback.averageCycleDays,
      periodDurationDays: data.period_duration_days ?? fallback.periodDurationDays,
      lastPeriodStartDate: data.last_period_start_date || fallback.lastPeriodStartDate,
    };

    saveLocalCycleSettings(settings);
    return settings;
  } catch (err) {
    console.warn('Supabase fetchCycleSettings error:', err);
    return fallback;
  }
}

export async function saveCycleSettingsToDb(settings: CycleSettings): Promise<void> {
  saveLocalCycleSettings(settings);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('cycle_settings')
      .upsert({
        user_id: user.id,
        average_cycle_days: settings.averageCycleDays,
        period_duration_days: settings.periodDurationDays,
        last_period_start_date: settings.lastPeriodStartDate,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
  } catch (err) {
    console.warn('Supabase saveCycleSettings error:', err);
  }
}

// -------------------------------------------------------------
// 3. PERIOD LOGS: CRUD (Load, Create, Update, Delete)
// -------------------------------------------------------------

export async function fetchPeriodLogsFromDb(fallback: PeriodLog[]): Promise<PeriodLog[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;

    const { data, error } = await supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error || !data) {
      return fallback;
    }

    const mapped: PeriodLog[] = data.map((row: any) => ({
      id: row.id,
      date: row.date,
      flow: row.flow || 'none',
      cramps: row.cramps || 'none',
      mood: Array.isArray(row.mood) ? row.mood : [],
      symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
      notes: row.notes || '',
      waterGlasses: row.water_glasses ?? 6,
    }));

    // Cache locally
    saveLocalPeriodLogs(mapped);
    return mapped;
  } catch (err) {
    console.warn('Supabase fetchPeriodLogs error:', err);
    return fallback;
  }
}

export async function createOrUpdatePeriodLogInDb(log: PeriodLog): Promise<void> {
  // Update local storage cache
  const local = getLocalPeriodLogs();
  const filtered = local.filter((l) => l.date !== log.date);
  saveLocalPeriodLogs([...filtered, log]);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('period_logs')
      .upsert({
        id: log.id,
        user_id: user.id,
        date: log.date,
        flow: log.flow,
        cramps: log.cramps,
        mood: log.mood || [],
        symptoms: log.symptoms || [],
        notes: log.notes || '',
        water_glasses: log.waterGlasses ?? 6,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date',
      });
  } catch (err) {
    console.warn('Supabase savePeriodLog error:', err);
  }
}

export async function deletePeriodLogFromDb(logDate: string, logId?: string): Promise<void> {
  // Update local storage
  const local = getLocalPeriodLogs();
  saveLocalPeriodLogs(local.filter((l) => l.date !== logDate));

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from('period_logs').delete().eq('user_id', user.id);
    if (logId) {
      query = query.eq('id', logId);
    } else {
      query = query.eq('date', logDate);
    }
    await query;
  } catch (err) {
    console.warn('Supabase deletePeriodLog error:', err);
  }
}

// -------------------------------------------------------------
// 4. TRUSTED CONTACTS: CRUD (Load, Create, Update, Delete)
// -------------------------------------------------------------

export async function fetchTrustedContactsFromDb(fallback: Contact[]): Promise<Contact[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallback;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      relationship: row.relationship,
      isEmergencyPrimary: row.is_emergency_primary ?? true,
    }));
  } catch (err) {
    console.warn('Supabase fetchTrustedContacts error:', err);
    return fallback;
  }
}

export async function createTrustedContactInDb(contact: Contact): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('trusted_contacts')
      .upsert({
        id: contact.id,
        user_id: user.id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        is_emergency_primary: contact.isEmergencyPrimary,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('Supabase createTrustedContact error:', err);
  }
}

export async function updateTrustedContactInDb(contact: Contact): Promise<void> {
  return createTrustedContactInDb(contact);
}

export async function deleteTrustedContactFromDb(contactId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('trusted_contacts')
      .delete()
      .eq('user_id', user.id)
      .eq('id', contactId);
  } catch (err) {
    console.warn('Supabase deleteTrustedContact error:', err);
  }
}
