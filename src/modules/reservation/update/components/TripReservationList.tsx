'use client'

import { deleteTripPassenger, updateReservation } from "@/services/reservation/reservationService";

import { AlertDialog } from "@/components/ux/AlertDialog";
import { EmptyAlert } from "@/components/ux/EmptyAlert";
import { Toast } from "@/components/ux/Toast";
import { CancelReasonModal } from "@/modules/history/components/CancelReasonModal";
import { hasMinimumHoursRemaining } from "@/shared/utils/date";
import { Loader2, TicketX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Reservation from "../../create/components/Reservation";
import { ReservationDTO } from "../../create/types/reservation";



interface TripReservationListProps {
  tripReservations: ReservationDTO[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  hasFilters: boolean
  refetch: () => void
  initialLoading: boolean
}

export default function TripReservationList({
  tripReservations,
  onLoadMore,
  hasMore,
  isLoadingMore,
  hasFilters,
  refetch,
  initialLoading
}: TripReservationListProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isReasonModalOpen, setReasonModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState<string | null>(null);
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [isAlertTimeDialogOpen, setIsAlertTimeDialogOpen] = useState<boolean>(false);

  const [loadingAcceptId, setLoadingAcceptId] = useState<number | null>(null);
  const [loadingRejectId, setLoadingRejectId] = useState<number | null>(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);

  const [alertData, setAlertData] = useState<{
    type: "success" | "error" | "info" | null;
    title?: string;
    description?: string;
    onConfirm?: () => void;
  } | null>(null);

  // Observer para el scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Si es visible y hay más datos por cargar, avisamos al padre
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        rootMargin: "100px", // Un poco antes de llegar al final
        threshold: 0.1,
      }
    );

    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoadingMore, onLoadMore, tripReservations.length]);


  const handleAcceptReservation = async (idReservation: number) => {
    setLoadingAcceptId(idReservation);
    try {
      const result = await updateReservation({ idReservation, reject: false });

      if (result?.state === 'OK') {
        await refetch();
        setAlertData({
          type: "success",
          title: "¡Reserva aceptada con éxito!",
          description: "Se le notificará al pasajero.",
        });
      } else {
        setAlertData({
          type: "error",
          title: "Hubo un problema",
          description: result.messages[0],
        });
      }
    } catch (error) {
      setAlertData({
        type: "error",
        title: "Hubo un problema",
        description: "No se pudo aceptar la reserva.",
      });
      console.error("Error al aceptar la reserva", error);
    } finally {
      setLoadingAcceptId(null);
    }
  };

  const handleRejectReservation = async (idReservation: number) => {
    setLoadingRejectId(idReservation);
    try {
      const result = await updateReservation({ idReservation, reject: true });

      if (result?.state === 'ERROR') {
        setAlertData({
          type: "error",
          title: "Hubo un problema",
          description: result.messages[0],
          onConfirm: async () => { await refetch(); }
        });
      }

      await refetch();

    } catch (error) {
      setAlertData({
        type: "error",
        title: "Hubo un problema",
        description: "No se pudo rechazar la reserva.",
        onConfirm: async () => { await refetch(); }
      });
      console.error("Error al rechazar la reserva", error);
    } finally {
      setLoadingRejectId(null);
    }
  };

  const handleDeleteTripPassenger = (reservation: ReservationDTO) => {

    const has1Hour = hasMinimumHoursRemaining(reservation.tripStartDatetime, 1);
    if (!has1Hour) {
      setIsAlertTimeDialogOpen(true)
      return
    } else {
      setLoadingDeleteId(reservation.id);
      setReasonModalOpen(true);
    }
  }

  const handleConfirmDeletePassenger = async () => {
    if (loading) return;


    setLoading(true);

    try {
      const response = await deleteTripPassenger({ reservationId: loadingDeleteId!, reason: deleteReason ?? null });

      if (response.state === "ERROR") {
        setToast({ message: response.messages[0] ?? 'Error al eliminar al pasajero', type: 'error' })
        return;
      } else {
        if (isReasonModalOpen) {
          setReasonModalOpen(false);
        }
        await refetch();
      }
    } finally {
      setLoading(false);
      setDeleteReason(null);
    }
  };

  const handleConfirm = (scope: 'ACCEPT' | 'REJECT', idReservation: number) => {
    if (scope === "ACCEPT") {
      setAlertData({
        type: "info",
        title: "Aceptar Reserva",
        description: "¿Estás seguro de que deseas aceptar esta reserva?",
        onConfirm: () => handleAcceptReservation(idReservation),
      });
    }
    if (scope === 'REJECT') {
      setAlertData({
        type: "info",
        title: "Rechazar Reserva",
        description: "¿Estás seguro de que deseas rechazar esta reserva?",
        onConfirm: () => handleRejectReservation(idReservation),
      });
    }
  }

  if (tripReservations.length === 0 && !initialLoading) {
    return (
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<TicketX size={32} />}
          title="No hay reservas"
          description={hasFilters ? 'No se encontraron reservas para los filtros aplicados.' : 'Sin solicitudes de reservas.'}
        />
      </div>
    );
  }

  return (
    <div>
      {tripReservations.map((reservation, index) => {
        return (
          <div key={`${reservation.id}-${index}`}> {/* Key única compuesta por si acaso */}
            <div className=" block">
              <Reservation
                reservation={reservation}
                variant="DRIVER"
                onAccept={() => handleConfirm('ACCEPT', reservation.id)}
                onReject={() => handleConfirm("REJECT", reservation.id)}
                onDelete={() => handleDeleteTripPassenger(reservation)}
                isAccepting={loadingAcceptId === reservation.id}
                isRejecting={loadingRejectId === reservation.id}
                isDeleting={loadingDeleteId === reservation.id}
              />
            </div>
          </div>
        );
      })}

      {/* Elemento centinela para el Observer */}
      <div ref={loaderRef} className="py-6 flex justify-center w-full">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="animate-spin h-5 w-5" />
            <span className="text-sm">Cargando más reservas...</span>
          </div>
        )}
      </div>

      {alertData && (
        <AlertDialog
          isOpen={!!alertData}
          onClose={() => setAlertData(null)}
          type={alertData.type ?? 'info'}
          title={alertData.title}
          description={alertData.description}
          confirmText="Aceptar"
          onConfirm={alertData.onConfirm}
        />
      )}

      <AlertDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmDeletePassenger}
        type="info"
        title="Quitar pasajero"
        description="¿Estás seguro de que querés quitar a este pasajero del viaje?"
        confirmText="Sí, quitar"
        cancelText="Volver"
        loading={loading}
      />

      <CancelReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => {
          setReasonModalOpen(false)
          setLoadingDeleteId(null)
        }}
        loading={loading}
        title="Quitar pasajero"
        text1="Al quitar a este pasajero del viaje, "
        text2="su reserva será cancelada "
        text3="y será notificado."
        text4="Podrá volver a solicitar un lugar en el viaje."
        placeHolder="Ingresá un motivo (opcional)"
        maxReasonLength={100}
        requiredReason={false}

        onConfirm={(reason) => {
          setDeleteReason(reason);
          setCancelDialogOpen(true);
        }}
      />

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-100 w-full max-w-[90%] sm:max-w-md pointer-events-none flex justify-center">
          <div className="pointer-events-auto w-full">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={isAlertTimeDialogOpen}
        onClose={() => setIsAlertTimeDialogOpen(false)}
        confirmText="Aceptar"
        type="info"
        title="Quitar pasajero"
        description='No es posible quitar al pasajero porque falta menos de una hora para el inicio del viaje.'
        loading={loading}
        singleButton={true}
      />
    </div>
  )
}