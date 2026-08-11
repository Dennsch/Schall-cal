import type { CalendarEvent } from '../types/calendar';
import { GOOGLE_CONFIG, CALENDAR_IDS } from './config';
import { startOfMonth, endOfMonth } from 'date-fns';

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

declare global {
  interface Window {
    google: typeof google;
    gapi: any;
  }
}

// Load the GAPI script
function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.apiKey,
            discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
          });
          gapiLoaded = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load Google Identity Services
function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gisLoaded) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function initGoogleApi(): Promise<void> {
  await Promise.all([loadGapiScript(), loadGisScript()]);
}

export function createTokenClient(
  onSuccess: () => void,
  onError: (err: string) => void
): void {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.clientId,
    scope: GOOGLE_CONFIG.scopes,
    callback: (response) => {
      if (response.error) {
        onError(response.error);
        return;
      }
      onSuccess();
    },
  });
}

export function requestAccess(): void {
  if (tokenClient) {
    // Check if we have a token already
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }
}

export function isSignedIn(): boolean {
  return window.gapi?.client?.getToken() !== null;
}

export function signOut(): void {
  const token = window.gapi.client.getToken();
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken(null);
  }
}

// Fetch events for a specific calendar
async function fetchCalendarEvents(
  calendarId: string,
  memberId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  if (!calendarId) return [];

  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const items = response.result.items || [];
    return items.map((item: any) => ({
      id: item.id || crypto.randomUUID(),
      title: item.summary || '(No title)',
      start: new Date(item.start?.dateTime || item.start?.date || ''),
      end: new Date(item.end?.dateTime || item.end?.date || ''),
      allDay: !item.start?.dateTime,
      memberId,
      color: item.colorId,
    }));
  } catch (err) {
    console.error(`Error fetching calendar ${calendarId}:`, err);
    return [];
  }
}

// Fetch all family events for a month
export async function fetchAllEvents(
  date: Date
): Promise<CalendarEvent[]> {
  const timeMin = startOfMonth(date);
  const timeMax = endOfMonth(date);

  const calendarMap: Record<string, string> = {
    member1: CALENDAR_IDS.member1,
    member2: CALENDAR_IDS.member2,
    member3: CALENDAR_IDS.member3,
    family: CALENDAR_IDS.family,
  };

  const promises = Object.entries(calendarMap)
    .filter(([, calId]) => calId)
    .map(([memberId, calId]) =>
      fetchCalendarEvents(calId, memberId, timeMin, timeMax)
    );

  const results = await Promise.all(promises);
  return results.flat();
}

// Generate demo events for preview mode
export function generateDemoEvents(date: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  const demoData = [
    { memberId: 'member1', title: 'Team Standup', days: [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29], allDay: false },
    { memberId: 'member1', title: 'Dentist', days: [7], allDay: false },
    { memberId: 'member1', title: 'Gym', days: [2, 4, 9, 11, 16, 18, 23, 25], allDay: false },
    { memberId: 'member2', title: 'Yoga', days: [1, 8, 15, 22, 29], allDay: false },
    { memberId: 'member2', title: 'Book Club', days: [12], allDay: false },
    { memberId: 'member2', title: 'Lunch w/ Sarah', days: [5], allDay: false },
    { memberId: 'member2', title: 'Hair Appt', days: [20], allDay: false },
    { memberId: 'member3', title: 'Soccer', days: [3, 10, 17, 24], allDay: false },
    { memberId: 'member3', title: 'Piano Lesson', days: [2, 9, 16, 23, 30], allDay: false },
    { memberId: 'member3', title: 'Playdate', days: [6, 14], allDay: false },
    { memberId: 'member3', title: 'School Play', days: [19], allDay: false },
    { memberId: 'family', title: 'Family Dinner', days: [7, 21], allDay: false },
    { memberId: 'family', title: 'BBQ @ Grandma\'s', days: [13], allDay: true },
    { memberId: 'family', title: 'Movie Night', days: [4, 18], allDay: false },
    { memberId: 'family', title: 'Camping Trip', days: [27, 28], allDay: true },
    { memberId: 'family', title: 'Grocery Run', days: [1, 8, 15, 22, 29], allDay: false },
  ];

  for (const item of demoData) {
    for (const day of item.days) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (day > daysInMonth) continue;
      events.push({
        id: `demo-${item.memberId}-${day}-${item.title}`,
        title: item.title,
        start: new Date(year, month, day, 9, 0),
        end: new Date(year, month, day, 10, 0),
        allDay: item.allDay,
        memberId: item.memberId,
      });
    }
  }

  return events;
}
