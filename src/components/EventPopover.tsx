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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6" />
      <line x1="16" y1="2.5" x2="16" y2="6" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  );
}

export function EventPopover({ event, memberName, onClose }: EventPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-close after 15 seconds — the calendar is a glanceable wall display,
  // no need for anyone to remember to dismiss it
  useEffect(() => {
    const timer = setTimeout(onClose, 15_000);
    return () => clearTimeout(timer);
  }, [onClose]);

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
    : format(event.start, 'h:mm a');

  return (
    <div className="event-popover-backdrop" onClick={onClose}>
      <div
        className="event-popover"
        ref={ref}
        role="dialog"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popover-header">
          <h3 className="popover-title">{event.title}</h3>
          <button className="popover-x" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="popover-body">
          <div className="popover-row">
            <span className="popover-icon-circle"><CalendarIcon /></span>
            <div className="popover-row-text">
              <span className="popover-primary">
                {format(event.start, 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="popover-secondary">
                {timeText}
                {!event.allDay && event.end && ` – ${format(event.end, 'h:mm a')}`}
              </span>
            </div>
          </div>

          <div className="popover-row">
            <span className="popover-icon-circle"><PersonIcon /></span>
            <div className="popover-row-text">
              <span className="popover-primary">{memberName}</span>
            </div>
          </div>

          {event.location && (
            <div className="popover-row">
              <span className="popover-icon-circle"><PinIcon /></span>
              <div className="popover-row-text">
                <span className="popover-primary">{event.location}</span>
              </div>
            </div>
          )}

          {event.description && (
            <div className="popover-row">
              <span className="popover-icon-circle"><NotesIcon /></span>
              <div className="popover-row-text">
                <span className="popover-secondary popover-description-text">
                  {event.description}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="popover-footer">
          <button className="popover-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
