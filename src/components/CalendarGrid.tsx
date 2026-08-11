import { useMemo } from 'react';
import { format, isToday, isWeekend } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';
import { FAMILY_MEMBERS } from '../types/calendar';
import './CalendarGrid.css';

interface CalendarGridProps {
  days: Date[];
  events: CalendarEvent[];
  loading: boolean;
}

export function CalendarGrid({ days, events, loading }: CalendarGridProps) {
  // Group events by day and member
  const eventMap = useMemo(() => {
    const map = new Map<string, Map<string, CalendarEvent[]>>();
    for (const event of events) {
      const dayKey = format(event.start, 'yyyy-MM-dd');
      if (!map.has(dayKey)) {
        map.set(dayKey, new Map());
      }
      const dayMap = map.get(dayKey)!;
      if (!dayMap.has(event.memberId)) {
        dayMap.set(event.memberId, []);
      }
      dayMap.get(event.memberId)!.push(event);
    }
    return map;
  }, [events]);

  return (
    <div className="calendar-grid" role="grid" aria-label="Family Calendar">
      {/* Column headers */}
      <div className="grid-header">
        <div className="header-date-col">
          <span className="header-hash">#</span>
          <span className="header-day">Day</span>
        </div>
        {FAMILY_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="header-member-col"
            style={{ '--member-color': member.color } as React.CSSProperties}
          >
            <span className="member-emoji">{member.emoji}</span>
            <span className="member-name">{member.name}</span>
          </div>
        ))}
      </div>

      {/* Day rows */}
      <div className={`grid-body ${loading ? 'loading' : ''}`}>
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventMap.get(dayKey);
          const today = isToday(day);
          const weekend = isWeekend(day);

          return (
            <div
              key={dayKey}
              className={`grid-row ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}`}
              role="row"
            >
              {/* Date column */}
              <div className="row-date-col">
                <span className="date-number">{format(day, 'd')}</span>
                <span className="date-day-name">{format(day, 'EEEE')}</span>
              </div>

              {/* Member columns */}
              {FAMILY_MEMBERS.map((member) => {
                const memberEvents = dayEvents?.get(member.id) || [];
                return (
                  <div
                    key={member.id}
                    className="row-member-col"
                    style={{ '--member-color': member.color } as React.CSSProperties}
                    role="gridcell"
                  >
                    {memberEvents.map((event) => (
                      <EventChip
                        key={event.id}
                        event={event}
                        color={member.color}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventChip({ event, color }: { event: CalendarEvent; color: string }) {
  return (
    <div
      className={`event-chip ${event.allDay ? 'all-day' : ''}`}
      style={{ '--chip-color': color } as React.CSSProperties}
      title={`${event.title}${event.allDay ? ' (All Day)' : ''}`}
    >
      <span className="event-title">{event.title}</span>
    </div>
  );
}
