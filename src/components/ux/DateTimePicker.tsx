'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Calendar } from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDateTimeLocal(date: Date, h: number, min: number): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(min)}`;
}

function parseValue(value: string) {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, min] = timePart.split(':').map(Number);
  if ([y, mo, d, h, min].some(isNaN)) return null;
  return { date: new Date(y, mo - 1, d), h, min };
}

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  minDate?: Date;
}

function DrumColumn({
  value,
  count,
  onChange,
}: {
  value: number;
  count: number;
  onChange: (v: number) => void;
}) {
  const ITEM_H = 30;
  const PAD = 1;

  // cantidad de loops renderizados
  const LOOPS = 50;

  const trackRef = useRef<HTMLDivElement>(null);
  const isAdjusting = useRef(false);

  // lista infinita simulada
  const items = Array.from(
    { length: count * LOOPS },
    (_, i) => i % count
  );

  // loop central
  const middleLoop = Math.floor(LOOPS / 2);

  useEffect(() => {
    if (!trackRef.current) return;

    const baseIndex = middleLoop * count + value;

    trackRef.current.scrollTo({
      top: baseIndex * ITEM_H,
    });
  }, []);

  function handleScroll() {
    if (!trackRef.current || isAdjusting.current) return;

    const scrollTop = trackRef.current.scrollTop;

    const rawIndex = Math.round(scrollTop / ITEM_H);

    // valor real
    const normalized = ((rawIndex % count) + count) % count;

    onChange(normalized);

    // recentrar silenciosamente
    const currentLoop = Math.floor(rawIndex / count);

    if (
      currentLoop < 10 ||
      currentLoop > LOOPS - 10
    ) {
      isAdjusting.current = true;

      const centeredIndex =
        middleLoop * count + normalized;

      trackRef.current.scrollTo({
        top: centeredIndex * ITEM_H,
      });

      requestAnimationFrame(() => {
        isAdjusting.current = false;
      });
    }
  }

  return (
    <div
      className="relative w-10"
      style={{
        height: ITEM_H * (PAD * 2 + 1),
      }}
    >
      {/* selección */}
      <div
        className="absolute left-0 right-0 rounded-md bg-white/5 pointer-events-none"
        style={{
          top: ITEM_H * PAD,
          height: ITEM_H,
          zIndex: 0,
        }}
      />

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto"
        style={{
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          zIndex: 1,
        }}
      >
        {/* padding top */}
        {Array.from({ length: PAD }).map((_, i) => (
          <div
            key={`pt${i}`}
            style={{ height: ITEM_H }}
          />
        ))}

        {/* items infinitos */}
        {items.map((num, i) => {
          const dist = Math.min(
            Math.abs(num - value),
            count - Math.abs(num - value)
          );

          const selected = dist === 0;

          return (
            <div
              key={i}
              onClick={() => {
                if (!trackRef.current) return;

                const currentIndex = Math.round(
                  trackRef.current.scrollTop / ITEM_H
                );

                const currentLoop = Math.floor(currentIndex / count);

                const targetIndex =
                  currentLoop * count + num;

                trackRef.current.scrollTo({
                  top: targetIndex * ITEM_H,
                  behavior: 'smooth',
                });

                onChange(num);
              }}
              className="flex items-center justify-center cursor-pointer font-inter tabular-nums select-none"
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'start',

                color: selected
                  ? 'rgba(255,255,255,1)'
                  : 'rgba(255,255,255,0.28)',

                fontSize: selected ? '14px' : '12px',

                fontWeight: selected ? 500 : 400,

                opacity:
                  dist === 0
                    ? 1
                    : dist === 1
                    ? 0.28
                    : 0.08,
              }}
            >
              {String(num).padStart(2, '0')}
            </div>
          );
        })}

        {/* padding bottom */}
        {Array.from({ length: PAD }).map((_, i) => (
          <div
            key={`pb${i}`}
            style={{ height: ITEM_H }}
          />
        ))}
      </div>
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  error,
  label = 'Fecha y hora de salida',
  placeholder = 'Seleccioná fecha y hora',
  minDate,
}: DateTimePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ?? today;

  const parsed = parseValue(value);
  const [view, setView] = useState({
    y: parsed?.date.getFullYear() ?? today.getFullYear(),
    m: parsed?.date.getMonth() ?? today.getMonth(),
  });
  const [selDate, setSelDate] = useState<Date | null>(parsed?.date ?? null);
  const [hour, setHour] = useState(parsed?.h ?? 8);
  const [minute, setMinute] = useState(parsed?.min ?? 0);
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = parseValue(value);
    if (p) {
      setSelDate(p.date);
      setHour(p.h);
      setMinute(p.min);
      setView({ y: p.date.getFullYear(), m: p.date.getMonth() });
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle() {
    if (open) { setOpen(false); return; }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // panel height ~280px
      setOpenUpward(window.innerHeight - rect.bottom < 290);
    }
    setOpen(true);
  }

  function changeMonth(dir: number) {
    setView(v => {
      let m = v.m + dir, y = v.y;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { y, m };
    });
  }

  function handleConfirm() {
    if (!selDate) return;
    onChange(toDateTimeLocal(selDate, hour, minute));
    setOpen(false);
  }

  function handleCancel() {
    const p = parseValue(value);
    if (p) { setSelDate(p.date); setHour(p.h); setMinute(p.min); }
    setOpen(false);
  }

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const prevMonthDays = new Date(view.y, view.m, 0).getDate();

  const displayValue = selDate
    ? `${selDate.getDate()} de ${MONTHS[selDate.getMonth()].toLowerCase()}, ${pad(hour)}:${pad(minute)}`
    : '';

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium font-inter">{label}</label>}

      <div className="relative" ref={panelRef}>
        {/* Trigger */}
        <button
          type="button"
          ref={triggerRef}
          onClick={handleToggle}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded border text-left transition-colors
            ${error ? 'border-red-500' : open
              ? 'border-gray-3 dark:border-gray-4'
              : 'border-gray-5 dark:border-gray-2 hover:border-gray-3 dark:hover:border-gray-4'}
          `}
        >
          <Calendar size={16} className="text-gray-4 dark:text-gray-3 shrink-0" />
          <span className={`flex-1 text-sm font-inter ${displayValue ? '' : 'text-gray-4 dark:text-gray-3'}`}>
            {displayValue || placeholder}
          </span>
          {open
            ? <ChevronUp size={14} className="text-gray-4 dark:text-gray-3 shrink-0" />
            : <ChevronDown size={14} className="text-gray-4 dark:text-gray-3 shrink-0" />
          }
        </button>

        {/* Panel — siempre horizontal: calendario | hora */}
        {open && (
          <div
            className={`
              absolute z-50 left-0
              bg-white dark:bg-gray-8
              border border-gray-5 dark:border-gray-2
              rounded-xl shadow-lg overflow-hidden
              ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}
            `}
            style={{
              width: 'fit-content',
              minWidth: 310,
            }}
          >

            <div className="flex flex-row">

              {/* ── Calendario ── */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Nav mes */}
                <div className="flex items-center justify-between px-1.5 py-1 border-b border-gray-6 dark:border-gray-7">
                  <button type="button" onClick={() => changeMonth(-1)}
                    className="p-1 rounded hover:bg-gray-7 dark:hover:bg-gray-7 transition-colors">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[11px] font-medium font-inter">
                    {MONTHS[view.m]} {view.y}
                  </span>
                  <button type="button" onClick={() => changeMonth(1)}
                    className="p-1 rounded hover:bg-gray-7 dark:hover:bg-gray-7 transition-colors">
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Grilla */}
                <div className="grid grid-cols-7 px-1 pt-1 pb-1">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[8px] font-medium text-gray-4 dark:text-gray-3 py-0.5">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`p${i}`} className="text-center text-[10px] py-0.5 opacity-20">
                      {prevMonthDays - offset + 1 + i}
                    </div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(view.y, view.m, day);
                    d.setHours(0, 0, 0, 0);
                    const isPast = d < min;
                    const isToday = day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                    const isSel = selDate && selDate.getDate() === day && selDate.getMonth() === view.m && selDate.getFullYear() === view.y;
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelDate(new Date(view.y, view.m, day))}
                        className={`
                          text-center text-[9px] py-0 rounded transition-colors font-inter aspect-square
                          ${isPast ? 'opacity-20 cursor-default' : 'cursor-pointer'}
                          ${isSel
                            ? 'bg-dark-1 dark:bg-gray-1 text-white dark:text-gray-8 font-medium'
                            : isToday && !isSel
                              ? 'font-bold text-dark-1 dark:text-gray-1'
                              : !isPast ? 'hover:bg-gray-7 dark:hover:bg-gray-7' : ''
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Separador vertical */}
              <div className="w-px bg-gray-6 dark:bg-gray-7 self-stretch" />

              
              {/* ── Selector hora — drum scroll vertical ── */}
              <div className="flex flex-col items-center justify-center px-2 gap-1 shrink-0 py-1.5 min-w-22.5">
                <span className="text-[8px] font-medium text-gray-4 dark:text-gray-3 uppercase tracking-wide">
                  Hora
                </span>

                <div className="flex items-center gap-1">
                  {/* HH */}
                  <DrumColumn value={hour} count={24} onChange={setHour} />
                  <span className="text-sm font-light text-gray-4 dark:text-gray-3 pb-1">:</span>
                  {/* MM */}
                  <DrumColumn value={minute} count={60} onChange={setMinute} />
                </div>

                <span className="text-[8px] text-gray-4 dark:text-gray-3">24h</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-6 dark:border-gray-7">
              <button type="button" onClick={handleCancel}
                className="px-3 py-1 text-xs font-inter rounded border border-gray-5 dark:border-gray-3 hover:bg-gray-7 dark:hover:bg-gray-7 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleConfirm} disabled={!selDate}
                className="px-3 py-1 text-xs font-inter font-medium rounded bg-dark-1 dark:bg-gray-1 text-white dark:text-gray-8 disabled:opacity-40 disabled:cursor-default hover:opacity-90 transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}