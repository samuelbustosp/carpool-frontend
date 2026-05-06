import { DAYS, MONTHS } from "@/constants/calendar"
import { ChevronLeft, ChevronRight } from "lucide-react"



function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function between(d: Date, a: Date, b: Date) {
  const t = d.getTime()
  return t > Math.min(a.getTime(), b.getTime()) && t < Math.max(a.getTime(), b.getTime())
}


export default function MiniCalendar({
  baseDate,
  startDate,
  endDate,
  onDayClick,
  onPrev,
  onNext,
}: {
  baseDate: Date
  startDate: Date | null
  endDate: Date | null
  onDayClick: (d: Date) => void
  onPrev: () => void
  onNext: () => void
}) {
  const y = baseDate.getFullYear()
  const m = baseDate.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(y, m, d))
  while (cells.length < 42) cells.push(null)

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-9 hover:bg-white/10 text-sm transition-colors"
        >
          <ChevronLeft size={12}/>
        </button>
        <span className="text-sm font-medium text-white">{MONTHS[m]} {y}</span>
        <button
          onClick={onNext}
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-9 hover:bg-white/10 text-sm transition-colors"
        >
          <ChevronRight size={12}/>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-11 font-medium py-1">{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className='h-7' />
          const isStart = startDate && sameDay(date, startDate)
          const isEnd = endDate && sameDay(date, endDate)
          const inRange = startDate && endDate && between(date, startDate, endDate)

          return (
            <button
              key={date.getTime()}
              onClick={() => onDayClick(date)}
              className={`text-center text-xs h-7 rounded cursor-pointer w-full transition-colors
                ${isStart || isEnd ? 'bg-white text-black font-medium' : ''}
                ${inRange ? 'bg-white/10 text-white' : ''}
                ${!isStart && !isEnd && !inRange ? 'text-gray-300 hover:bg-white/10' : ''}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}