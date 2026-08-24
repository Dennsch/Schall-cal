import { useMemo, useEffect, useState, useCallback } from 'react';
import { format, isToday, isWeekend } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';
import type { ThemeId } from '../types/theme';
import { FAMILY_MEMBERS } from '../types/calendar';
import { EventPopover } from './EventPopover';
import './CalendarGrid.css';

interface CalendarGridProps {
  days: Date[];
  events: CalendarEvent[];
  loading: boolean;
  theme: ThemeId;
}

function useIsPortrait() {
  const [portrait, setPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => setPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return portrait;
}

export function CalendarGrid({ days, events, loading, theme }: CalendarGridProps) {
  const isPortrait = useIsPortrait();

  // Popover state: the selected event + which member it belongs to
  const [selected, setSelected] = useState<{ event: CalendarEvent; color: string } | null>(null);

  const openPopover = useCallback((event: CalendarEvent, color: string) => {
    setSelected({ event, color });
  }, []);

  const closePopover = useCallback(() => setSelected(null), []);

  const eventMap = useMemo(() => {
    const map = new Map<string, Map<string, CalendarEvent[]>>();
    for (const event of events) {
      const dayKey = format(event.start, 'yyyy-MM-dd');
      if (!map.has(dayKey)) map.set(dayKey, new Map());
      const dayMap = map.get(dayKey)!;
      if (!dayMap.has(event.memberId)) dayMap.set(event.memberId, []);
      dayMap.get(event.memberId)!.push(event);
    }
    return map;
  }, [events]);

  // Split members into two rows for portrait: [0,1] top, [2,3] bottom
  const topMembers = FAMILY_MEMBERS.slice(0, 2);
  const bottomMembers = FAMILY_MEMBERS.slice(2);

  return (
    <div
      className={`calendar-grid theme-${theme} ${isPortrait ? 'portrait' : 'landscape'}`}
      role="grid"
      aria-label="Family Calendar"
    >
      {/* ── Column headers ── */}
      {isPortrait ? (
        <div className="grid-header portrait-header">
          <div className="header-date-col">
            <span className="header-hash">#</span>
            <span className="header-day">Day</span>
          </div>
          {/* Top row: first 2 members */}
          {topMembers.map((member) => (
            <div
              key={member.id}
              className="header-member-col"
              style={{ '--member-color': member.color } as React.CSSProperties}
            >
              <span className="member-emoji">{member.emoji}</span>
              <span className="member-name">{member.name}</span>
            </div>
          ))}
          {/* Bottom row header: blank date placeholder + last 2 members */}
          <div className="header-date-col header-date-col--sub" />
          {bottomMembers.map((member) => (
            <div
              key={member.id}
              className="header-member-col header-member-col--sub"
              style={{ '--member-color': member.color } as React.CSSProperties}
            >
              <span className="member-emoji">{member.emoji}</span>
              <span className="member-name">{member.name}</span>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* ── Day rows ── */}
      <div className={`grid-body ${loading ? 'loading' : ''}`}>
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventMap.get(dayKey);
          const today = isToday(day);
          const weekend = isWeekend(day);
          const rowClass = `grid-row ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}`;

          if (isPortrait) {
            return (
              <div key={dayKey} className={`${rowClass} portrait-day`} role="row">
                {/* Sub-row 1: date + first 2 members */}
                <div className="portrait-subrow portrait-subrow--top">
                  <div className="row-date-col">
                    <span className="date-number">{format(day, 'd')}</span>
                    <span className="date-day-name">{format(day, 'EEE')}</span>
                  </div>
                  {topMembers.map((member) => (
                    <div
                      key={member.id}
                      className="row-member-col"
                      style={{ '--member-color': member.color } as React.CSSProperties}
                      role="gridcell"
                    >
                      {(dayEvents?.get(member.id) || []).map((event) => (
                        <EventChip key={event.id} event={event} color={member.color} theme={theme} onOpen={openPopover} />
                      ))}
                    </div>
                  ))}
                </div>
                {/* Sub-row 2: spacer + last 2 members */}
                <div className="portrait-subrow portrait-subrow--bottom">
                  <div className="row-date-col row-date-col--spacer" />
                  {bottomMembers.map((member) => (
                    <div
                      key={member.id}
                      className="row-member-col"
                      style={{ '--member-color': member.color } as React.CSSProperties}
                      role="gridcell"
                    >
                      {(dayEvents?.get(member.id) || []).map((event) => (
                        <EventChip key={event.id} event={event} color={member.color} theme={theme} onOpen={openPopover} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={dayKey} className={rowClass} role="row">
              <div className="row-date-col">
                <span className="date-number">{format(day, 'd')}</span>
                <span className="date-day-name">{format(day, 'EEE')}</span>
              </div>
              {FAMILY_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="row-member-col"
                  style={{ '--member-color': member.color } as React.CSSProperties}
                  role="gridcell"
                >
                  {(dayEvents?.get(member.id) || []).map((event) => (
                    <EventChip key={event.id} event={event} color={member.color} theme={theme} onOpen={openPopover} />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Event details popover */}
      {selected && (
        <EventPopover
          event={selected.event}
          color={selected.color}
          memberName={
            FAMILY_MEMBERS.find((m) => m.id === selected.event.memberId)?.name ?? ''
          }
          onClose={closePopover}
        />
      )}
    </div>
  );
}

function EventChip({
  event,
  color,
  theme,
  onOpen,
}: {
  event: CalendarEvent;
  color: string;
  theme: ThemeId;
  onOpen: (event: CalendarEvent, color: string) => void;
}) {
  const chipClass = [
    'event-chip',
    'clickable',
    event.allDay ? 'all-day' : '',
    `chip-${theme}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={chipClass}
      style={{ '--chip-color': color } as React.CSSProperties}
      onClick={() => onOpen(event, color)}
      aria-label={`${event.title} — show details`}
    >
      <span className="event-title">{event.title}</span>
    </button>
  );
}
