"use client";

import { BrushCleaning, ListFilter, Star, X } from "lucide-react";

interface FilterBarProps {
  selectedDate?: string; // fecha seleccionada en formato ISO (yyyy-mm-dd)
  onDateChange?: (date: string | undefined) => void;
  sortByRating?: boolean; // toggle para ordenar por puntuación descendente
  setSortByRating?: (active: boolean) => void;
  onClearFilters?: () => void;
}

export default function FilterBar({
  selectedDate,
  onDateChange,
  sortByRating = false,
  setSortByRating,
  onClearFilters,
}: FilterBarProps) {


  const hasActiveFilters = selectedDate || sortByRating;

  const handleClearFilterDate = () => {
    onDateChange?.(undefined)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-2 text-sm px-3 py-0.5 rounded-md bg-gray-8 border border-gray-8">
        <ListFilter size={14}/>
        <p>Filtros</p>
      </div>
      {/* FILTRO FECHA */}
      <div className={`flex items-center border border-gray-2  hover:bg-gray-2 rounded-lg px-1
          ${selectedDate && 'border-gray-6'}
        `}>
        <input 
          type="date" 
          value={selectedDate ?? ''} 
          onChange={(e) => onDateChange?.(e.target.value)} 
          min={new Date().toISOString().split("T")[0]} 
          className="border-gray-2 w-30 hover:bg-gray-2 cursor-pointer rounded-lg text-sm p-1 outline-none focus:border-gray-6" 
          placeholder="Seleccione fecha"
        /> 
        {selectedDate && 
          <button 
            className="rounded-full hover:bg-gray-2 p-1 cursor-pointer"
            onClick={handleClearFilterDate}
          >
            <X size={14}/>
          </button>
        }
      </div>
      

      {/* FILTRO ORDENAR POR PUNTUACIÓN */}
      <button
        className={`flex  items-center cursor-pointer gap-1 px-3 py-1 border rounded-lg border-gray-2 hover:bg-gray-2 transition ${
          sortByRating ? "border-gray-6 bg-gray-8" : ""
        }`}
        onClick={() => setSortByRating && setSortByRating(!sortByRating)}
      > 
        {sortByRating?(<Star size={14} fill="currentColor" stroke="none"/>) : (<Star size={14} />)}
        <span className="text-sm">Puntuación</span>

      </button>
      {onClearFilters && hasActiveFilters &&(
        <button
          className="flex items-center cursor-pointer gap-1 px-3 py-1 text-sm  rounded-xl bg-gray-2 hover:bg-gray-10 transition"
          onClick={onClearFilters}
        >
          <span><BrushCleaning size={14}/></span>
          Limpiar filtros
          
        </button>
      )}
      
    </div>
  );
}