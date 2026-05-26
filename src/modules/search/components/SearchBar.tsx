'use client';

import { ListFilter, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CitySearch from "./CitySearch";

export default function SearchBar() {
  const [originCity, setOriginCity] = useState<number | null>(null);
  const [destinationCity, setDestinationCity] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string>(""); 
  const router = useRouter();

  const handleSearch = () => {
    if (!originCity || !destinationCity) {
      setError("Debes seleccionar origen y destino.");
      return;
    }

    setError(""); // limpiar error si todo bien
    const queryParams = new URLSearchParams();

    queryParams.append("origin", originCity.toString());
    queryParams.append("destination", destinationCity.toString());

    if (selectedDate) {
      queryParams.append("departureDate", selectedDate);
    }

    router.push(`/search/results?${queryParams.toString()}`);
  };

  const handleClearFilterDate = () => {
    setSelectedDate(null)
  }

  return (
    <div className="shadow-lg w-full flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {/* Origen y destino */}
        <CitySearch 
          originCity={originCity}
          destinationCity={destinationCity}
          setOriginCity={setOriginCity}
          setDestinationCity={setDestinationCity}
        />
        <button
          onClick={handleSearch}
          className={`flex items-center justify-between gap-1 bg-gray-2 text-sm hover:bg-gray-10 transition 
            p-2 rounded-full cursor-pointer
            ${!originCity || !destinationCity ? "opacity-50 " : ""}`}
          disabled={!originCity || !destinationCity} 
        >
          <Search size={20} />
        </button>
        
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg bg-gray-7 w-fit">
          <ListFilter size={14} />
          <p>Filtros</p>
        </div>
        
        <div className="flex items-center bg-gray-7 rounded-lg px-1">
          <input 
            type="date" 
            value={selectedDate ?? ''} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            min={new Date().toISOString().split("T")[0]} 
            className="bg-gray-7 w-30 cursor-pointer rounded-lg text-sm p-1 outline-none border border-transparent focus:border-gray-6" 
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
        
        
      </div>

      {/* Mensaje de error */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
