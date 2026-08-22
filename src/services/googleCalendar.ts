import type { CalendarEvent } from '../types/calendar';

export async function fetchAllEvents(
  date: Date,
): Promise<CalendarEvent[]> {
  const response = await fetch(
    `/api/calendar?date=${encodeURIComponent(date.toISOString())}`,
  );

  if (!response.ok) {
    throw new Error(`Calendar API returned ${response.status}`);
  }

  const data = await response.json();

  return data.events.map((item: any) => ({
    id: item.id,
    title: item.title,
    start: new Date(item.start),
    end: new Date(item.end),
    allDay: item.allDay,
    memberId: item.memberId,
    color: item.color,
    description: item.description,
    location: item.location,
  }));
}