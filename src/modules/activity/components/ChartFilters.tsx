'use client'

import { useState } from 'react'
import { formatShortDateText, formatShortDateTextWithYear } from "@/shared/utils/date"
import { DateRange } from "react-day-picker"
import DateRangeModal from './barchart/DateRangeModal'
import { FILTERS } from '@/constants/stats'

interface ChartFiltersProps {
  selected: string
  onChange: (value: string) => void
  range?: DateRange
  onRangeChange?: (range: DateRange | undefined) => void
}

export default function ChartFilters({ selected, onChange, range, onRangeChange }: ChartFiltersProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const now = new Date()
  const from = new Date(now)

  switch (selected) {
    case '7d':   from.setDate(now.getDate() - 7); break
    case 'month': from.setDate(1); break
    case '90d':  from.setDate(now.getDate() - 90); break
    case 'year': from.setFullYear(now.getFullYear() - 1); break
    default:     from.setDate(1)
  }

  const showYear = selected === 'year'

  const handleApplyRange = (newRange: DateRange) => {
    onChange('custom')
    onRangeChange?.(newRange)
  }

  return (
    <>
      <div className="w-full">
        <div className="flex gap-2 justify-center flex-wrap">
          {FILTERS.map((filter) => (
            
            <button
              key={filter.value}
              onClick={() => {
                if (filter.value === 'custom') {
                  setModalOpen(true)
                } else {
                  onChange(filter.value)
                  onRangeChange?.(undefined)
                }
            }}
              className={`flex items-center gap-1 px-2 md:px-3 py-1 border rounded-xl text-xs md:text-sm duration-200 ease-out cursor-pointer ${
                selected === filter.value
                  ? 'bg-white border-white text-black font-medium'
                  : 'border-gray-2 hover:bg-gray-2'
              }`}
            > 
              {filter.icon && <filter.icon size={13} />}
              {filter.label}
            </button>
          ))}
        </div>

        {selected === 'custom' && range?.from && range?.to ? (
          <div
            className="text-xs text-gray-11 flex items-center justify-center mt-4 gap-1 cursor-pointer"
          >
            {formatShortDateTextWithYear(range.from)} {' - '} {formatShortDateTextWithYear(range.to)}
          </div>
        ) : selected !== 'custom' ? (
          <div className="text-xs text-gray-11 flex items-center justify-center mt-4 gap-1">
            {showYear ? formatShortDateTextWithYear(from) : formatShortDateText(from)}
            {' - '}
            {showYear ? formatShortDateTextWithYear(now) : formatShortDateText(now)}
          </div>
        ) : null}
      </div>

      <DateRangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        range={range}
        onApply={handleApplyRange}
      />
    </>
  )
}