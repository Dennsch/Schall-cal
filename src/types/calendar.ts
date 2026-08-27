import dennisImg from '../images/Dennis-c.png';
import angelaImg from '../images/Angela-c.png';
import taronImg from '../images/Taron-c.png';
import familyImg from '../images/family.png';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  emoji: string;
  image: string;
  calendarId: string; // Google Calendar ID
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  memberId: string; // which family member this belongs to
  color?: string;
  description?: string;
  location?: string;
}

export interface DayEvents {
  date: Date;
  events: Map<string, CalendarEvent[]>; // memberId -> events
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'member3',
    name: 'Taron',
    color: '#5EC269',
    emoji: '🧒',
    image: taronImg,
    calendarId: '',
  },
  {
    id: 'member2',
    name: 'Angela',
    color: '#E8636F',
    emoji: '👩',
    image: angelaImg,
    calendarId: '',
  },
  {
    id: 'member1',
    name: 'Dennis',
    color: '#4A90D9',
    emoji: '👨',
    image: dennisImg,
    calendarId: '', // Set in .env
  },
  {
    id: 'family',
    name: 'Family',
    color: '#F5A623',
    emoji: '🏠',
    image: familyImg,
    calendarId: '',
  },
];
