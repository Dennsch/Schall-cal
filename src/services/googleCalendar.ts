import type { CalendarEvent } from '../types/calendar';

// Parse a date-only string ("YYYY-MM-DD") as a LOCAL date so it doesn't get
// shifted a day by the UTC parsing of `new Date("YYYY-MM-DD")`.
function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export async function fetchAllEvents(
  date: Date,
): Promise<CalendarEvent[]> {
  const response = await fetch(
    `/api/calendar?year=${date.getFullYear()}&month=${date.getMonth()}`,
  );

  if (!response.ok) {
    throw new Error(`Calendar API returned ${response.status}`);
  }

  const data = await response.json();

  return data.events.map((item: any) => ({
    id: item.id,
    title: item.title,
    start: item.allDay ? parseLocalDate(item.start) : new Date(item.start),
    end: item.allDay ? parseLocalDate(item.end) : new Date(item.end),
    allDay: item.allDay,
    memberId: item.memberId,
    color: item.color,
    description: item.description,
    location: item.location,
  }));
}