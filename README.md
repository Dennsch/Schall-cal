# Schall Family Calendar

A warm, wall-calendar-style family organizer that runs on a Samsung Galaxy Tab A (SM-T350) as a dedicated kitchen display. Syncs with Google Calendar to show events for 3 family members + a shared family calendar in a column layout — just like the physical Boynton calendar it replaces.

## Features

- **Column layout** matching physical family wall calendars — each person gets their own column
- **Google Calendar sync** — pulls events from 4 Google calendars every 5 minutes
- **Seasonal themes** — header colors and decorations change every month
- **Auto-scrolls to today** on load
- **Night dimming** — screen brightness drops to 30% from 10 PM – 6 AM to save battery
- **Keep-awake** — screen stays on permanently (it's a wall display)
- **Demo mode** — works without Google API keys using sample data
- **Optimized for SM-T350** — 1024x768 landscape, minimal repaints, thin scrollbars

## Quick Start (Demo Mode)

No Google API setup required — the app runs with sample data if no API keys are configured:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. The calendar shows demo events immediately.

## Google Calendar Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Schall Calendar")
3. Enable the **Google Calendar API**:
   - APIs & Services → Library → search "Calendar API" → Enable

### 2. Create Credentials

1. APIs & Services → Credentials → Create Credentials → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Add authorized JavaScript origins:
   - `http://localhost:5173` (dev)
   - `https://localhost` (Capacitor)
4. Also create an **API Key** (APIs & Services → Credentials → Create → API Key)
5. Restrict the API key to "Google Calendar API" only

### 3. Configure the App

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_GOOGLE_API_KEY=AIzaSy...your-api-key
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Calendar IDs — find these in Google Calendar settings → "Integrate calendar"
VITE_CALENDAR_MEMBER1=dennis@gmail.com
VITE_CALENDAR_MEMBER2=partner@gmail.com
VITE_CALENDAR_MEMBER3=kid@gmail.com
VITE_CALENDAR_FAMILY=family123@group.calendar.google.com
```

### 4. Share Calendars

Each person must share their Google Calendar with the account that will be signed in on the tablet:
- Google Calendar → Settings → (calendar) → "Share with specific people"
- Add the tablet account with "See all event details" permission

## Customizing Family Members

Edit `src/types/calendar.ts` to change names, colors, and emoji:

```typescript
export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'member1', name: 'Dennis', color: '#4A90D9', emoji: '👨', calendarId: '' },
  { id: 'member2', name: 'Partner', color: '#E8636F', emoji: '👩', calendarId: '' },
  { id: 'member3', name: 'Kid',     color: '#5EC269', emoji: '🧒', calendarId: '' },
  { id: 'family',  name: 'Family',  color: '#F5A623', emoji: '🏠', calendarId: '' },
];
```

## Building the APK

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed
- Java 17+ SDK

### Steps

```bash
# 1. Build web assets + initialize Android project
npm run android:init

# 2. Build & sync to Android
npm run android:sync

# 3. Open in Android Studio
npm run android:open
```

In Android Studio:
1. Let Gradle sync finish
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. The APK will be in `android/app/build/outputs/apk/debug/`

### Installing on the SM-T350

```bash
# Via USB (with developer mode enabled)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or transfer the APK file to the tablet and open it.

## Tablet Setup Tips (SM-T350)

1. **Lock screen rotation** to landscape
2. **Disable auto-sleep** in Settings → Display → Screen timeout → "Never" (or the app's keep-awake handles it)
3. **Set as home app** (optional): Settings → Home → select "Schall Calendar" so it opens on boot
4. **Disable notifications** for other apps to prevent popups
5. **Keep plugged in** — even with battery optimizations, an always-on display needs power. Use a short USB cable to mount near a kitchen outlet
6. **Guided Access / Screen Pinning**: Settings → Security → Screen pinning → ON, then pin the calendar app

## Battery Optimization Features

- Screen dims to 30% brightness automatically at night (10 PM – 6 AM)
- Events refresh every 5 minutes (not continuously)
- CSS animations disabled when `prefers-reduced-motion` is set
- No background GPS, Bluetooth, or sensor usage
- Minimal DOM updates — only re-renders on data change

## Project Structure

```
src/
  components/
    App.tsx          — Main layout, month navigation, night mode
    App.css          — Global styles, tablet optimization
    CalendarGrid.tsx — Day rows × member columns grid
    CalendarGrid.css — Grid styling, event chips
    MonthHeader.tsx  — Seasonal header with month/year and navigation
    MonthHeader.css  — Header styles, floating decorations
  hooks/
    useCalendar.ts   — Event fetching state management
  services/
    config.ts        — Google API + calendar ID config from env
    googleCalendar.ts— GAPI auth, event fetching, demo data
    platform.ts      — Capacitor native init (keep-awake, status bar)
  types/
    calendar.ts      — TypeScript types + family member definitions
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build locally
```

## License

Private / Family use.
