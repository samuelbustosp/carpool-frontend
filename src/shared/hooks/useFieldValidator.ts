import { useState, useCallback, useRef, useEffect } from "react";
import debounce from "lodash.debounce";


// Tipos permitidos para los campos que se pueden validar
type FieldType = 'username' | 'email' | 'dni' | 'phone';

// Tipos permitidos para el tipo de mensaje
type MessageType = 'success' | 'error' | null;

export function useFieldValidator(field: FieldType) {
  const [available, setAvailable] = useState<null | boolean>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);

  // Referencia para guardar la función debounce y poder limpiarla
  const debouncedValidateRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Función que hace la validación real (sin debounce)
  const validateFn = useCallback(async (value: string) => {
    if (!value || !(value.length > 1)) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/users/validate-${field}?${field}=${value}`);
      const data = await res.json();

      if (res.ok && data.state === "OK") {
        setAvailable(true);
        setMessage(data.messages?.[0] || `${field} disponible`);
        setMessageType("success");
      } else {
        setAvailable(false);
        setMessage(data.messages?.[0] || `${field} no disponible`);
        setMessageType("error");
      }
    } catch {
      setAvailable(null);
      setMessage(`Error validando ${field}`);
      setMessageType("error");
    } finally {
      setChecking(false);
    }
  }, [field]);

  // Creamos debounce sólo 1 vez y guardamos la función en el ref
  // El debounce envolverá validateFn
  useEffect(() => {
    debouncedValidateRef.current = debounce((value: string) => {
      validateFn(value);
    }, 1000);

    // Limpiar debounce al desmontar para evitar llamadas pendientes
    return () => {
      debouncedValidateRef.current?.cancel();
    };
  }, [validateFn]);

  // Función estable para usar en el componente
  const validate = useCallback((value: string) => {
    debouncedValidateRef.current?.(value);
  }, []);

  const reset = useCallback(() => {
    setAvailable(null);
    setChecking(false);
    setMessage(null);
    setMessageType(null);
  }, []);

  return {
    available,
    checking,
    message,
    messageType,
    validate,
    reset
  };
  
}
