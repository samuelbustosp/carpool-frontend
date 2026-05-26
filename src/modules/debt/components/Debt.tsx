'use client'

import { useAuth } from "@/contexts/authContext";
import { useNotification } from "@/contexts/NotificationContext";
import { NotificationType } from "@/shared/types/notification";
import { AlertTriangle } from "lucide-react";

export default function Debt() {
  const { logout, debt } = useAuth();
  const { showNotification } = useNotification();

  const isExpired = debt?.expired === true;

  const handlePayClick = () => {
    if (debt?.total == null || debt?.tripId == null) return;

    showNotification({
        type: NotificationType.PAYMENT_PENDING,
        title: 'Pago pendiente',
        message: 'Tenés una reserva pendiente de pago. Completá el pago para continuar.',
        data: {
        total: debt.total,
        tripId: debt.tripId
        },
    });
  };


  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-8/90 backdrop-blur rounded-xl p-6 space-y-4">

        <div className="flex items-center gap-3">
          <span className="bg-red-500/10 text-red-500 p-2 rounded-lg">
            <AlertTriangle size={20} />
          </span>

          <h1 className="text-xl font-semibold">
            {isExpired
              ? "Tu cuenta se encuentra bloqueada"
              : "Tenés una reserva por pagar"}
          </h1>
        </div>

        <p className="text-sm text-gray-6 bg-gray-7 rounded-lg p-3">
          {isExpired ? (
            <>
              Tu cuenta fue <strong>bloqueada</strong> porque tenés una reserva
              <strong> expirada por falta de pago</strong>.
              <br />
              Esto se considera un incumplimiento de las condiciones de uso,
              por lo que no es posible regularizar la deuda desde la plataforma.
            </>
          ) : (
            <>
              Para continuar usando la aplicación debés regularizar tu deuda.
              Mientras tanto, algunas funciones permanecerán bloqueadas.
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-6 hover:bg-gray-7 transition cursor-pointer"
          >
            Cerrar sesión
          </button>

          <button
            disabled={isExpired}
            onClick={handlePayClick}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${
                isExpired
                  ? "bg-gray-7 text-gray-5 cursor-not-allowed"
                  : "bg-gray-6 text-gray-8 hover:bg-gray-5 cursor-pointer"
              }`}
          >
            Ir a pagar
          </button>
        </div>
      </div>
    </div>
  );
}
