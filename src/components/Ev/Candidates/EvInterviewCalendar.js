/* src/components/Ev/Candidates/EvInterviewCalendar.js | Compact month picker + business-hours slot groups | Sree | 2026-07-01 */

"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  addMonths,
  getDayAvailability,
  monthGrid,
  monthKeyOf,
  toDateKey,
  weekdayLabels,
  formatDayLong,
  SLOT_GROUP_ORDER,
} from "@/lib/EvInterview";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Deterministic scheduler: a compact month grid (past + fully-booked days disabled, dots = seeded existing
  interviews) driving a business-hours slot list grouped Morning/Afternoon/Evening. Conflicting slots are
  disabled, not hidden. All availability comes from EvInterval's getDayAvailability(now, duration, seed).
  Controlled — the sheet owns month cursor, selected date, and selected slot.
*/
function NavButton({ icon: Icon, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-4" />
    </button>
  );
}

function EvInterviewCalendar({ now, seed = "", monthKey, onMonthChange, selectedDateKey, onSelectDate, durationMin, selectedSlot, onSelectSlot }) {
  const todayMonthKey = useMemo(() => monthKeyOf(new Date(now)), [now]);
  const canGoPrev = monthKey > todayMonthKey;
  const monthLabel = useMemo(() => {
    const dt = new Date(now);
    const [y, m] = monthKey.split("-").map(Number);
    dt.setFullYear(y, m - 1, 1);
    return dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [monthKey, now]);

  // Per-day availability for the visible grid (deterministic → cheap to recompute).
  const days = useMemo(() => {
    return monthGrid(monthKey).map((date) => {
      const key = toDateKey(date);
      const av = getDayAvailability(key, { now, durationMin, seed });
      return {
        key,
        date: date.getDate(),
        inMonth: date.getMonth() === new Date(`${monthKey}T00:00:00`).getMonth(),
        disabled: av.isPast || av.availableCount === 0,
        dots: Math.min(av.bookedIntervals.length, 3),
      };
    });
  }, [monthKey, now, durationMin, seed]);

  const day = useMemo(
    () => (selectedDateKey ? getDayAvailability(selectedDateKey, { now, durationMin, seed }) : null),
    [selectedDateKey, now, durationMin, seed],
  );

  const grouped = useMemo(() => {
    if (!day) return [];
    return SLOT_GROUP_ORDER.map((group) => ({ group, slots: day.slots.filter((s) => s.group === group) })).filter((g) => g.slots.length);
  }, [day]);

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[var(--fx-text)]">Interview Calendar</p>
          <p className="text-[12px] text-[var(--fx-text-muted)]">Choose a date, then pick a slot.</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-1.5 py-1">
          <NavButton icon={ChevronLeft} onClick={() => onMonthChange?.(addMonths(monthKey, -1))} disabled={!canGoPrev} label="Previous month" />
          <span className="min-w-[116px] text-center text-[13px] font-medium text-[var(--fx-text)]">{monthLabel}</span>
          <NavButton icon={ChevronRight} onClick={() => onMonthChange?.(addMonths(monthKey, 1))} label="Next month" />
        </div>
      </div>

      {/* Weekday header + day grid */}
      <div>
        <div className="grid grid-cols-7 gap-1 pb-1.5">
          {weekdayLabels.map((label) => (
            <div key={label} className="text-center text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const isSelected = d.key === selectedDateKey;
            return (
              <button
                key={d.key}
                type="button"
                disabled={d.disabled}
                onClick={() => onSelectDate?.(d.key)}
                className={cn(
                  "flex h-[46px] flex-col items-center justify-center gap-1 rounded-[8px] border text-[13px] font-medium transition-colors",
                  isSelected
                    ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
                    : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
                  !d.inMonth && !isSelected && "text-[var(--fx-text-muted)] opacity-70",
                  d.disabled && "cursor-not-allowed border-transparent bg-transparent text-[var(--fx-text-disabled)] opacity-50 hover:bg-transparent",
                )}
              >
                <span className="text-[15px] font-semibold leading-none">{d.date}</span>
                <span className="flex h-[5px] items-center gap-[3px]">
                  {Array.from({ length: d.dots }).map((_, i) => (
                    <span key={i} className={cn("size-[4px] rounded-full", isSelected ? "bg-[var(--fx-primary)]" : "bg-[color:color-mix(in_srgb,var(--fx-primary)_55%,transparent)]")} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots — bound in a subtle sub-panel so it reads as a group, not a detached list. */}
      <div className="space-y-2.5 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] font-semibold text-[var(--fx-text)]">Available Time Slots</p>
          <p className="text-[12px] text-[var(--fx-text-muted)]">{day ? formatDayLong(day.dateKey) : "Select a date"}</p>
        </div>

        {day && day.availableCount === 0 ? (
          <p className="rounded-[8px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-3.5 text-center text-[13px] text-[var(--fx-text-muted)]">
            No available slots on this day. Try another date.
          </p>
        ) : (
          <div className="space-y-2.5">
            {grouped.map(({ group, slots }) => (
              <div key={group} className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((slot) => {
                    const isActive = selectedSlot === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={slot.disabled}
                        onClick={() => onSelectSlot?.(slot.start)}
                        className={cn(
                          "inline-flex h-[30px] w-[68px] items-center justify-center rounded-[6px] border text-[12px] font-medium transition-colors",
                          slot.disabled
                            ? "cursor-not-allowed border-[var(--fx-border)] bg-[var(--fx-bg-soft)] text-[var(--fx-text-disabled)] line-through opacity-55"
                            : isActive
                              ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
                              : "border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Existing-interviews peek — only after a date is picked, only if the day has any. */}
        {day && day.bookedIntervals.length ? (
          <div className="space-y-1.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">Existing interviews on this day</p>
            {day.bookedIntervals.map((item) => (
              <div key={item.start} className="flex items-center justify-between gap-3 text-[12px]">
                <span className="font-medium text-[var(--fx-text)]">{item.timeLabel}</span>
                <span className="truncate text-[var(--fx-text-muted)]">{item.round} · {item.interviewer}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvInterviewCalendar };
/* - - - - - - - - - - - - - - - - */
