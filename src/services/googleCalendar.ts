import type { CalendarEvent } from '../types/calendar';
import { GOOGLE_CONFIG, CALENDAR_IDS } from './config';
import { startOfMonth, endOfMonth } from 'date-fns';

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

// localStorage keys
const TOKEN_KEY  = 'schall-cal-token';
const EXPIRY_KEY = 'schall-cal-token-expiry';
const HINT_KEY   = 'schall-cal-login-hint';

declare global {
  interface Window {
    google: typeof google;
    gapi: any;
  }
}

// ── Token persistence ──────────────────────────────────────────────────────

function saveToken(token: string, expiresIn: number, hint?: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // Store expiry as absolute ms timestamp, with a 60s safety margin
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + (expiresIn - 60) * 1000));
    if (hint) localStorage.setItem(HINT_KEY, hint);
  } catch { /* ignore */ }
}

export function loadStoredToken(): { token: string; hint: string } | null {
  try {
    const token  = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!token || !expiry) return null;
    if (Date.now() > Number(expiry)) {
      // Expired — clear and require sign-in
      clearStoredToken();
      return null;
    }
    return { token, hint: localStorage.getItem(HINT_KEY) || '' };
  } catch {
    return null;
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  } catch { /* ignore */ }
}

export function getSavedLoginHint(): string {
  try { return localStorage.getItem(HINT_KEY) || ''; } catch { return ''; }
}

// ── Script loading ─────────────────────────────────────────────────────────

function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) { resolve(); return; }
    
    // Check if gapi is already loaded (edge case for hot reload)
    if (typeof window.gapi !== 'undefined' && window.gapi.client) {
      gapiLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = '/gapi.js';
    script.onload = () => {
      if (!window.gapi) {
        reject(new Error('gapi script loaded but window.gapi is undefined'));
        return;
      }
      window.gapi.load('client', async () => {
        try {
          // Double-check that gapi.client is now available
          if (!window.gapi.client) {
            reject(new Error('gapi.client is not available after loading'));
            return;
          }
          
          await window.gapi.client.init({ apiKey: GOOGLE_CONFIG.apiKey });
          gapiLoaded = true;
          resolve();
        } catch (err) { reject(err); }
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gisLoaded) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => { gisLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function initGoogleApi(): Promise<void> {
  await Promise.all([loadGapiScript(), loadGisScript()]);
}

// ── Auth ───────────────────────────────────────────────────────────────────

export function createTokenClient(
  onSuccess: () => void,
  onError: (err: string) => void
): void {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.clientId,
    scope: GOOGLE_CONFIG.scopes,
    // Pre-fill the account email if we know it, skipping the account picker
    login_hint: getSavedLoginHint(),
    callback: (response: any) => {
      if (response.error) {
        onError(response.error);
        return;
      }
      // Persist the token so reloads don't require sign-in
      saveToken(response.access_token, Number(response.expires_in), response.login_hint);
      // Inject into gapi so API calls use it immediately
      window.gapi.client.setToken({ access_token: response.access_token });
      onSuccess();
    },
  });
}

// Show the account picker / consent screen
export function requestAccess(): void {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

// Restore a previously saved token into gapi without any popup
export function restoreToken(token: string): void {
  window.gapi.client.setToken({ access_token: token });
  if (!window.gapi || !window.gapi.client) {
    console.error('Cannot restore token: gapi.client is not available');
    return;
  }
}

export function signOut(): void {
  const token = window.gapi.client.getToken();
  if (!window.gapi || !window.gapi.client) {
    console.error('Cannot sign out: gapi.client is not available');
    clearStoredToken();
    return;
  }
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token);
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(token.access_token);
    }
  }
  clearStoredToken();
}

// ── Calendar fetching ──────────────────────────────────────────────────────

async function fetchCalendarEvents(
  calendarId: string,
  memberId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  if (!calendarId) return [];

  const response = await window.gapi.client.request({
  if (!window.gapi || !window.gapi.client) {
    console.error('Cannot fetch events: gapi.client is not available');
    return [];
  }

    path: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    params: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    },
  });

  const items = response.result.items || [];
  return items.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    title: item.summary || '(No title)',
    start: new Date(item.start?.dateTime || item.start?.date || ''),
    end:   new Date(item.end?.dateTime   || item.end?.date   || ''),
    allDay: !item.start?.dateTime,
    memberId,
    color: item.colorId,
  }));
}

export async function fetchAllEvents(date: Date): Promise<CalendarEvent[]> {
  const timeMin = startOfMonth(date);
  const timeMax = endOfMonth(date);

  const calendarMap: Record<string, string> = {
    member1: CALENDAR_IDS.member1,
    member2: CALENDAR_IDS.member2,
    member3: CALENDAR_IDS.member3,
    family:  CALENDAR_IDS.family,
  };

  const promises = Object.entries(calendarMap)
    .filter(([, calId]) => calId)
    .map(([memberId, calId]) =>
      fetchCalendarEvents(calId, memberId, timeMin, timeMax).catch((err) => {
        console.error(`Skipping calendar ${memberId} (${calId}):`, err);
        return [] as CalendarEvent[];
      })
    );

  return (await Promise.all(promises)).flat();
}

// ── Demo events ────────────────────────────────────────────────────────────

export function generateDemoEvents(date: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  const demoData = [
    { memberId: 'member1', title: 'Team Standup',    days: [1,3,5,8,10,12,15,17,19,22,24,26,29], allDay: false },
    { memberId: 'member1', title: 'Dentist',          days: [7],                                   allDay: false },
    { memberId: 'member1', title: 'Gym',              days: [2,4,9,11,16,18,23,25],                allDay: false },
    { memberId: 'member2', title: 'Yoga',             days: [1,8,15,22,29],                        allDay: false },
    { memberId: 'member2', title: 'Book Club',        days: [12],                                  allDay: false },
    { memberId: 'member2', title: 'Lunch w/ Sarah',   days: [5],                                   allDay: false },
    { memberId: 'member2', title: 'Hair Appt',        days: [20],                                  allDay: false },
    { memberId: 'member3', title: 'Soccer',           days: [3,10,17,24],                          allDay: false },
    { memberId: 'member3', title: 'Piano Lesson',     days: [2,9,16,23,30],                        allDay: false },
    { memberId: 'member3', title: 'Playdate',         days: [6,14],                                allDay: false },
    { memberId: 'member3', title: 'School Play',      days: [19],                                  allDay: false },
    { memberId: 'family',  title: 'Family Dinner',    days: [7,21],                                allDay: false },
    { memberId: 'family',  title: "BBQ @ Grandma's",  days: [13],                                  allDay: true  },
    { memberId: 'family',  title: 'Movie Night',      days: [4,18],                                allDay: false },
    { memberId: 'family',  title: 'Camping Trip',     days: [27,28],                               allDay: true  },
    { memberId: 'family',  title: 'Grocery Run',      days: [1,8,15,22,29],                        allDay: false },
  ];

  for (const item of demoData) {
    for (const day of item.days) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (day > daysInMonth) continue;
      events.push({
        id: `demo-${item.memberId}-${day}-${item.title}`,
        title: item.title,
        start: new Date(year, month, day, 9, 0),
        end:   new Date(year, month, day, 10, 0),
        allDay: item.allDay,
        memberId: item.memberId,
      });
    }
  }

  return events;
}
