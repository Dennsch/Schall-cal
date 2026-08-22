import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';
import './EventPopover.css';

interface EventPopoverProps {
  event: CalendarEvent;
  memberName: string;
  color: string;
  onClose: () => void;
}

export function EventPopover({ event, memberName, color, onClose }: EventPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on tap outside or Escape
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const timeText = event.allDay
    ? 'All day'
    : `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

  return (
    <div className="event-popover-backdrop">
      <div
        className="event-popover"
        ref={ref}
        role="dialog"
        aria-label={event.title}
        style={{ '--popover-color': color } as React.CSSProperties}
      >
        <div className="popover-header" />
        <button className="popover-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 className="popover-title">{event.title}</h3>

        <div className="popover-meta">
          <div className="popover-row">
            <span className="popover-icon">🕒</span>
            <span className="popover-text">
              {timeText}
              {!event.allDay && (
                <span className="popover-subtext">
                  {' '}
                  · {format(event.start, 'EEEE d MMMM')}
                </span>
              )}
            </span>
          </div>

          <div className="popover-row">
            <span className="popover-icon">👤</span>
            <span className="popover-text">{memberName}</span>
          </div>

          {event.location && (
            <div className="popover-row">
              <span className="popover-icon">📍</span>
              <span className="popover-text">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="popover-description">{event.description}</p>
        )}
      </div>
    </div>
  );
}
