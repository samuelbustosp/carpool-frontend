import { TripPriceSummarySkeleton } from "./TripPriceSummarySkeleton";

interface TripPriceSummaryProps {
  seatPrice: number;
  publishedSeatPrice: number;
  driverPriceDiscount: number;
  netEarningsPerSeat: number;
  commission: number;
  loading?: boolean;
}

export function TripPriceSummary({
  seatPrice,
  publishedSeatPrice,
  driverPriceDiscount,
  netEarningsPerSeat,
  commission,
  loading = false,
}: TripPriceSummaryProps) {
  if (loading) {
    return <TripPriceSummarySkeleton />;
  }

  return (
    <div
      className="rounded-lg border border-gray-5/40 dark:border-gray-2/40
                 bg-gray-1/30 dark:bg-gray-2/10 p-4 space-y-4"
    >
      <h4 className="text-sm font-medium">
        Resumen del precio
      </h4>

      {/* Precio base */}
      <div className="space-y-1 text-sm text-gray-4">
        <div className="flex justify-between">
          <span>Precio ingresado por vos</span>
          <span>${seatPrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Comisión de la plataforma ({commission.toLocaleString()}%)</span>
          <span>
            ${driverPriceDiscount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Precio al pasajero */}
      <div className="pt-3 border-t border-gray-5/30 flex justify-between items-center">
        <span className="text-sm text-gray-4">
          El pasajero pagará
        </span>
        <span className="text-base text-gray-7 dark:text-gray-1">
          ${publishedSeatPrice.toLocaleString()}
        </span>
      </div>

      {/* Ganancia conductor */}
      <div className="pt-3 border-t border-gray-5/30 flex justify-between items-center">
        <span className="font-medium text-gray-7 dark:text-gray-1">
          Vos recibirás por pasajero
        </span>
        <span className="text-lg font-semibold text-gray-7 dark:text-gray-1">
          ${netEarningsPerSeat.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
