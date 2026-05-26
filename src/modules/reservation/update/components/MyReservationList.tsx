import { EmptyAlert } from "@/components/ux/EmptyAlert";
import { TicketX } from "lucide-react";
import Reservation from "../../create/components/Reservation";
import { ReservationDTO } from "../../create/types/reservation";
import { ReservationSkeleton } from "../../create/components/ReservationSkeleton";

interface ReservationListProps {
  reservations: ReservationDTO[];
  onCancel: (reservation: ReservationDTO) => void;
  loading: boolean
  loadingCancelId?: number | null;
}

export default function ReservationList({
  reservations,
  onCancel,
  loadingCancelId,
  loading
}: ReservationListProps) {

  if (loading) {
    return(
      <div><ReservationSkeleton variant="PASSENGER"/></div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<TicketX size={32} />}
          title="No tienes reservas"
          description="No realizaste ninguna solicitud de reserva."
        />
      </div>
    );
  }

  return (
    <div>
      {reservations.map((reservation, index) => (
        <div key={`${reservation.id}-${index}`}>
          <div className=" block">
            <Reservation
              reservation={reservation}
              variant="PASSENGER"
              onCancel={() => onCancel(reservation)}
              isCanceling={loadingCancelId === reservation.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
}