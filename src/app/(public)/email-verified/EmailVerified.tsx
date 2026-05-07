'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ux/Button";

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const router = useRouter();
  
  const [showFallbackAction, setShowFallbackAction] = useState(false);

  // Si después de 10 segundos no hay status, mostrar acción
  useEffect(() => {
    if (!status) {
      const timer = setTimeout(() => {
        setShowFallbackAction(true);
      }, 10000); // 10 segundos

      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-success">¡Cuenta activada!</h1>
        <p className="text-gray-3 mt-4 max-w-md mb-8 font-inter">
          Tu cuenta fue activada correctamente. Ahora podés iniciar sesión y empezar a usar todos nuestros servicios.
        </p>
        <div className="space-y-3 max-w-md font-inter">
          <div className="flex items-center space-x-3 text-sm text-gray-5">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-left">Email verificado exitosamente</p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-5">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-left">Email de bienvenida enviado</p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-5">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">→</span>
            </div>
            <p className="text-left">Ya podés iniciar sesión con tu cuenta</p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/login")}
          className="mt-4"
        >
          Ir al inicio de sesión
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-error" />
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-error">Error al activar la cuenta</h1>
        <p className="text-gray-3 mt-4 max-w-md mb-8 font-inter">
          Hubo un problema al activar tu cuenta. Esto puede suceder si el enlace expiró o ya fue utilizado.
        </p>
        <div className="space-y-3 max-w-md font-inter mb-8">
          <div className="flex items-center space-x-3 text-sm text-gray-5">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-left">El enlace puede haber expirado (48 horas)</p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-5">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-left">El enlace ya fue utilizado anteriormente</p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/email-verify")}
        >
          Solicitar nuevo enlace
        </Button>
      </div>
    );
  }

  // Loading / fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 px-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-spin">
        <div className="w-6 h-6 border-4 border-t-primary border-gray-300 rounded-full"></div>
      </div>
      <h1 className="text-2xl font-semibold mb-2 text-gray-7">Verificando cuenta...</h1>
      <p className="text-gray-3 mt-4 max-w-md mb-8 font-inter">
        {showFallbackAction 
          ? "Si el proceso tarda mucho, podés intentar solicitar un nuevo enlace."
          : "Esto puede tardar unos segundos. No cierres esta ventana."
        }
      </p>
      
      {showFallbackAction && (
        <div className="space-y-3 space-x-4">
          <Button
            onClick={() => router.push("/login")}
          >
            Ir al inicio de sesión
          </Button>
          <Button
            onClick={() => router.push("/email-verify")}
            variant="outline"
          >
            Solicitar nuevo enlace
          </Button>
        </div>
      )}
    </div>
  );
}