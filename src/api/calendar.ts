import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const CALENDARS = {
  member1: process.env.CALENDAR_MEMBER1!,
  member2: process.env.CALENDAR_MEMBER2!,
  member3: process.env.CALENDAR_MEMBER3!,
  family: process.env.CALENDAR_FAMILY!,
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const date = req.query.date
      ? new Date(String(req.query.date))
      : new Date();

    const timeMin = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ).toISOString();

    const timeMax = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
    ).toISOString();

    const calendars = Object.entries(CALENDARS)
      .filter(([, calendarId]) => !!calendarId);

    const results = await Promise.all(
      calendars.map(async ([memberId, calendarId]) => {
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250,
        });

        return (response.data.items ?? []).map((item) => ({
          id: item.id,
          title: item.summary || '(No title)',
          start: item.start?.dateTime || item.start?.date,
          end: item.end?.dateTime || item.end?.date,
          allDay: !item.start?.dateTime,
          memberId,
          color: item.colorId,
        }));
      }),
    );

    return res.status(200).json({
      events: results.flat(),
    });
  } catch (error) {
    console.error('Calendar API error:', error);

    return res.status(500).json({
      error: 'Failed to load calendar events',
    });
  }
}