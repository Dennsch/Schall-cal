// Google Calendar API configuration
// These values come from your Google Cloud Console project

export const GOOGLE_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  // No discoveryDocs — we call the Calendar REST API directly via gapi.client.request()
  // so the API key only ever hits calendar-json.googleapis.com (which the key allows).
  scopes: 'https://www.googleapis.com/auth/calendar.readonly',
};

// Calendar IDs from environment variables
export const CALENDAR_IDS = {
  member1: import.meta.env.VITE_CALENDAR_MEMBER1 || 'primary',
  member2: import.meta.env.VITE_CALENDAR_MEMBER2 || '',
  member3: import.meta.env.VITE_CALENDAR_MEMBER3 || '',
  family: import.meta.env.VITE_CALENDAR_FAMILY || '',
};
