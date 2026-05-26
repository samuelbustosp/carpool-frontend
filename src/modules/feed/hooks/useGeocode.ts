"use client";

import { City } from "@/models/city";
import { useCallback, useRef, useState } from "react";

interface Coordinates {
  lat: number;
  lon: number;
}

const FALLBACK_CITY: City = {
  id: 409,
  name: "VILLA MARIA",
  zipCode: 5220,
};

//Este hook nos permite comunicarnos con la API de OpenStreetMap y poder hacer varios metodos
export function useGeocode() {
  const [city, setCity] = useState<City | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const detectCityRef = useRef(false);

  const getCityFromCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/city/coordinates?lat=${lat}&lng=${lon}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.state === 'ERROR') {
        setCity(FALLBACK_CITY);
        setCoords({ lat, lon });
        return FALLBACK_CITY; 
      }

      setCity(data.data);
      setCoords({ lat, lon });

      return data.data; 
     }catch(error: unknown){
      let message = "Error desconocido";
      if (error instanceof Error) message = error.message;
      return { data: null, messages: [message], state: "ERROR" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Este metodo nos devuelve las coordenadas de la ciudad segun su nombre
  const getCoordsFromCity = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?type=forward&query=${cityName}`);
      const data = await res.json();
      if (!data || data.length === 0) throw new Error("Ciudad no encontrada");

      const { lat, lon } = data[0];
      setCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
      //setCity(cityName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Usar geolocalización del navegador
  // Debemos darle permisos al navegador para acceder a nuestra localizacion
  const detectUserCity = useCallback(() => {
    if (detectCityRef.current) return;
    detectCityRef.current = true;

    // Si no existe geolocalización → fallback inmediato
    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada");
      setCity(FALLBACK_CITY);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getCityFromCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError("No se pudo obtener tu ubicación");
        setCity(FALLBACK_CITY);
      },
      { timeout: 3000 }
    );
  }, [getCityFromCoords]);

  return {
    city,
    coords,
    loading,
    error,
    getCityFromCoords,
    getCoordsFromCity,
    detectUserCity,
  };
}
