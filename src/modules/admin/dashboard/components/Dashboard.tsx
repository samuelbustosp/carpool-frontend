'use client'

import { useState } from "react"
import TripSection from "./trips/TripSection"
import SectionTabs from "./SectionsTabs"
import UserSection from "./users/UserSection"
import GeneralSection from "./generals/GeneralSection"
import ChartFilters from "@/modules/activity/components/ChartFilters"
import { DateRange } from "react-day-picker"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("general")
  const [filter, setFilter] = useState("month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  return (
    <div className="space-y-4">
       
      <SectionTabs
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <ChartFilters
        selected={filter}
        onChange={setFilter}
        range={customRange}
        onRangeChange={setCustomRange}
      />

      <div>
        {activeSection === "general" && (
          <GeneralSection
            filter={filter}
            customRange={customRange}
          />
        )}

        {activeSection === "trips" && (
          <TripSection 
            filter={filter}
            customRange={customRange}
          />
        )}
        
        {activeSection === "users" && (
          <UserSection
            filter={filter}
            customRange={customRange}
          />
        )}
      </div>
    </div>
  )
}