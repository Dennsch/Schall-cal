// Google Calendar API configuration
// These values come from your Google Cloud Console project

export const GOOGLE_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/calendar.readonly',
};

// Calendar IDs from environment variables
export const CALENDAR_IDS = {
  member1: import.meta.env.VITE_CALENDAR_MEMBER1 || 'primary',
  member2: import.meta.env.VITE_CALENDAR_MEMBER2 || '',
  member3: import.meta.env.VITE_CALENDAR_MEMBER3 || '',
  family: import.meta.env.VITE_CALENDAR_FAMILY || '',
};
