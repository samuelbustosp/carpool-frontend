'use client'

import { SECTIONS } from "@/constants/stats"

interface SectionTabsProps {
  activeSection: string
  setActiveSection: (value: string) => void
}

export default function SectionTabs({
  activeSection,
  setActiveSection,
}: SectionTabsProps) {
  

  const activeIndex = SECTIONS.findIndex(s => s.key === activeSection)

  return (
    <div className="relative inline-flex items-center p-1 bg-gray-8 border border-gray-2/50 rounded-xl w-full">
      
      <div
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-dark-5/50 border border-gray-9/20 transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${SECTIONS.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {SECTIONS.map((section) => {
        const isActive = activeSection === section.key

        return (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`
              relative z-10 flex-1 px-8 py-1.5 cursor-pointer rounded-lg text-sm font-medium transition-colors duration-200
              ${isActive ? "text-white" : "text-gray-11 hover:text-white"}
            `}
          >
            {section.label}
          </button>
        )
      })}
    </div>
  )
}