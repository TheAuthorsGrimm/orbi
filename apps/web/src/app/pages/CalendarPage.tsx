import { useState } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { Button, Badge } from '@figma/astraui';
import { ChevronLeft, ChevronRight, Plus, Clock, CalendarDays } from 'lucide-react';

type EventDisplayType = 'task' | 'focus' | 'google' | 'personal' | 'orbi';

interface DisplayEvent {
  id: string;
  title: string;
  startHour: number;
  endHour: number;
  type: EventDisplayType;
  date: number;
}

// Gradient event styles
const EVENT_STYLES: Record<EventDisplayType, { bg: string; color: string }> = {
  task:     { bg: 'linear-gradient(135deg, #3730a3, #5250f3)', color: '#fff' },
  focus:    { bg: 'linear-gradient(135deg, #92400e, #d97706)', color: '#fff' },
  google:   { bg: 'linear-gradient(135deg, #064e3b, #059669)', color: '#fff' },
  personal: { bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#c4b5fd' },
  orbi:     { bg: 'linear-gradient(135deg, #3730a3, #5250f3)', color: '#fff' },
};

const LEGEND = [
  { type: 'task',     label: 'Orbi Task',        dot: '#5250f3' },
  { type: 'focus',    label: 'Focus Block',       dot: '#d97706' },
  { type: 'google',   label: 'Google Calendar',   dot: '#059669' },
  { type: 'personal', label: 'Personal',          dot: '#7c3aed' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const CARD_PURPLE = {
  background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
  border: '1px solid rgba(82,80,243,0.25)',
};

export function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const { events: apiEvents } = useCalendar(currentYear, currentMonth);

  // Map API events to display shape
  const EVENTS: DisplayEvent[] = apiEvents.map(e => {
    const start = new Date(e.startAt);
    const end = new Date(e.endAt);
    return {
      id: e.id,
      title: e.title,
      startHour: start.getHours() + start.getMinutes() / 60,
      endHour: end.getHours() + end.getMinutes() / 60,
      type: (e.source === 'google' ? 'google' : e.linkedTaskId ? 'task' : 'orbi') as EventDisplayType,
      date: start.getDate(),
    };
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const selectedEvents = EVENTS.filter(e => e.date === selectedDay);
  const hasEvents = (day: number) => EVENTS.some(e => e.date === day);
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

  return (
    <div className="p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">Calendar</h1>
          <p className="text-label-sm text-text-secondary">May 2026 · Google Calendar synced</p>
        </div>
        <div className="flex gap-md items-center">
          <Badge label="Google Synced" variant="success" />
          <Button variant="primary" iconStart={<Plus size={16} />} size="small">Add Event</Button>
        </div>
      </div>

      <div className="flex gap-xl">
        {/* ── Mini Calendar ── */}
        <div className="rounded-corner-lg p-xl flex flex-col gap-lg flex-shrink-0" style={{ ...CARD_PURPLE, width: 300 }}>
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="text-text-secondary hover:text-text-primary transition-colors p-xs">
              <ChevronLeft size={18} />
            </button>
            <span className="text-label text-text-primary">{MONTHS[currentMonth]} {currentYear}</span>
            <button onClick={nextMonth} className="text-text-secondary hover:text-text-primary transition-colors p-xs">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-xs">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-label-sm text-text-tertiary py-xs">{d}</div>
            ))}
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasDot = hasEvents(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="relative aspect-square flex flex-col items-center justify-center rounded-corner-md transition-all"
                  style={{
                    fontSize: '0.9rem',
                    background: isSelected
                      ? 'linear-gradient(135deg, #5250f3, #0d9488)'
                      : isToday
                      ? 'rgba(82,80,243,0.2)'
                      : 'transparent',
                    color: isSelected ? '#fff' : isToday ? '#a5b4fc' : 'rgba(255,255,255,0.75)',
                    border: isSelected ? 'none' : isToday ? '1px solid rgba(82,80,243,0.4)' : '1px solid transparent',
                  }}
                >
                  {day}
                  {hasDot && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#5250f3' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-sm pt-md" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-label-sm text-text-tertiary">Event types</p>
            {LEGEND.map(item => (
              <div key={item.type} className="flex items-center gap-md">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                <span className="text-label-sm text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Day View ── */}
        <div
          className="flex-1 rounded-corner-lg p-xl flex flex-col gap-lg overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0a0e1a 0%, #080814 100%)', border: '1px solid rgba(82,80,243,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <CalendarDays size={18} className="text-text-secondary" />
              <h2 className="text-label text-text-primary">
                {DAYS_OF_WEEK[new Date(currentYear, currentMonth, selectedDay).getDay()]}, {MONTHS[currentMonth]} {selectedDay}
              </h2>
            </div>
            {selectedEvents.length > 0 && (
              <Badge label={`${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`} variant="default" />
            )}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              {HOURS.map(hour => {
                const eventsAtHour = selectedEvents.filter(e => Math.floor(e.startHour) === hour);
                return (
                  <div key={hour} className="flex gap-md" style={{ minHeight: 56 }}>
                    <div className="text-label-sm text-text-tertiary w-14 pt-sm flex-shrink-0 text-right">
                      {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                    </div>
                    <div className="flex-1 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {eventsAtHour.map(event => (
                        <div
                          key={event.id}
                          className="absolute left-0 right-0 mx-xs rounded-corner-md px-md py-xs cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            top: `${(event.startHour % 1) * 56}px`,
                            height: `${(event.endHour - event.startHour) * 56}px`,
                            minHeight: 28,
                            background: EVENT_STYLES[event.type].bg,
                            color: EVENT_STYLES[event.type].color,
                          }}
                        >
                          <span className="text-label-sm truncate block">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedEvents.length === 0 && (
            <div className="flex flex-col items-center gap-md py-2xl text-center">
              <Clock size={28} className="text-text-tertiary" />
              <p className="text-label-sm text-text-secondary">No events on this day</p>
              <Button variant="neutral" size="small" iconStart={<Plus size={16} />}>Add event</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
