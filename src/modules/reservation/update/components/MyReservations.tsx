'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog } from "@/components/ux/AlertDialog";
import { Tab } from "@/components/ux/Tab";
import { Toast } from "@/components/ux/Toast";
import { RESERVATION_TABS } from "@/constants/tabs/reservation";
import { cancelReservationByPassenger, getMyReservations } from "@/services/reservation/reservationService";
import { hasMinimumHoursRemaining } from "@/shared/utils/date";
import { ListFilter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReservationResponseDTO } from "../../create/types/dto/reservationResponseDTO";
import { ReservationDTO } from "../../create/types/reservation";
import ReservationList from "./MyReservationList";

export const ORDERS_BY = [
	{ label: "Más recientes", value: "DATE_DESC" },
	{ label: "Más antiguas", value: "DATE_ASC" }
];
export default function MyReservations() {
	const [state, setState] = useState<string>("PENDING");


	const [loading, setLoading] = useState<boolean>(false);
	const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
	const [isAlertTimeDialogOpen, setIsAlertTimeDialogOpen] = useState<boolean>(false)

	const [reservations, setReservations] = useState<ReservationResponseDTO | null>(null)

	const [loadingCancelId, setLoadingCancelId] = useState<number | null>(null);

	const [orderBy, setOrderBy] = useState("DATE_DESC");
	const [fromDate, setFromDate] = useState<string | null>(null);
	const [toDate, setToDate] = useState<string | null>(null);

	const [hasMore, setHasMore] = useState(true);
	const loaderRef = useRef<HTMLDivElement | null>(null);
	const LIMIT = 10;

	const skipRef = useRef(0);
	const hasMoreRef = useRef(true);
 
	const [alertData, setAlertData] = useState<{
    type: "success" | "error" | "info" | null;
    title?: string;
    description?: string;
    onConfirm?: () => void;
  } | null>(null);

	const handleChangeState = (value: string) => {
		setState(value);
	};

	const loadReservations = useCallback(async (reset = false) => {
		try {
			if (!hasMoreRef.current && !reset) return;
			setLoading(true);

			const currentSkip = reset ? 0 : skipRef.current;

			if (reset) {
				skipRef.current = 0;
				hasMoreRef.current = true;
				setHasMore(true);
			}

			if (!state || (state != "PENDING" && state != "ACCEPTED")) {
				setState("PENDING");
			}
			const res = await getMyReservations(
				state, currentSkip, orderBy, fromDate ? new Date(fromDate) : undefined, toDate ? new Date(toDate) : undefined
			);

			const newReservations = res.data?.reservation ?? [];
			const newTotal = res.data?.total ?? 0;

			if (reset) {
				setReservations({ reservation: newReservations, total: newTotal })
			} else {
				setReservations(prev => ({
					reservation: [...(prev?.reservation ?? []), ...newReservations],
					total: newTotal,
				}));
			}

			if (newReservations.length < LIMIT) {
				hasMoreRef.current = false;
				setHasMore(false);
			} else {
				skipRef.current = currentSkip + LIMIT;
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setToast({ message: error.message, type: 'error' })
			} else {
				setToast({ message: 'Ocurrió un error inesperado', type: 'error' })
			}
		} finally {
			setLoading(false)
		}
	}, [state, orderBy, fromDate, toDate]);

	
	const handleConfirm = (reservation: ReservationDTO)=>{

		const has1Hour = hasMinimumHoursRemaining(reservation.tripStartDatetime, 1);
		if (!has1Hour) {
			setIsAlertTimeDialogOpen(true)
			return
		}else{
			setAlertData({
					type: "info",
					title: "Cancelar Reserva",
					description: "¿Estás seguro de que deseas cancelar esta reserva?",
					onConfirm: () => handleCancelReservation(reservation),
			});
		}


  }

	const handleCancelReservation = async (reservation: ReservationDTO) => {
		setLoadingCancelId(reservation.id);

		try {
			const response = await cancelReservationByPassenger({reservationId: reservation.id});
			
			if (response.state === "ERROR") {
				setToast({message:response.messages[0], type:'error'});
			}

			await loadReservations(true);
		} catch (error) {
			if (error instanceof Error) {
				setToast({message:error.message, type:'error'});
			} else {
				setToast({message:"Ocurrió un error inesperado.", type:'error'});
			}
		} finally {
			setLoadingCancelId(null);
		}
	};

	useEffect(() => {
		setReservations(null);
		setHasMore(true);
		loadReservations(true);
	}, [state, orderBy, fromDate, toDate]);

	useEffect(() => {
		if (!loaderRef.current) return;

		const observer = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && !loading && hasMore) {
				loadReservations();
			}
		});

		observer.observe(loaderRef.current);

		return () => observer.disconnect();
	}, [loadReservations, loading, hasMore]);

	return (
		<div className="w-full">
			<div className="flex flex-col gap-3 pb-4">
				<div>
					<h1 className="text-xl font-semibold mb-1">Listado de reservas</h1>
					<p className="font-inter text-sm">
						Aca podés gestionar tus solicitudes de reserva
					</p>
				</div>

				<Tab value={state} onChange={handleChangeState} tabs={RESERVATION_TABS} />
				{/* Filtro + Orden */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg bg-gray-8 w-fit border border-transparent">
						<ListFilter size={16} />
						<p>Filtros</p>
					</div>

					<Select
						value={orderBy}
						onValueChange={setOrderBy}
					>
						<SelectTrigger
							id="orderBy"
							className="font-outfit dark:bg-dark-5 flex-1 h-8 cursor-pointer"
						>
							<SelectValue />
						</SelectTrigger>

						<SelectContent className="cursor-pointer">
							{ORDERS_BY.map((order) => (
								<SelectItem key={order.value} value={order.value} className="cursor-pointer">
									{order.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-3">
					<div className="flex flex-col text-sm flex-1">
						<label className="text-gray-11 mb-1">Desde</label>
						<input
							type="date"
							value={fromDate ?? ""}
							onChange={(e) => setFromDate(e.target.value || null)}
							max={toDate ?? undefined}
							className="border border-gray-2 rounded px-2 py-1 h-8 cursor-pointer"
						/>
					</div>

					<div className="flex flex-col text-sm flex-1">
						<label className="text-gray-11 mb-1">Hasta</label>
						<input
							type="date"
							value={toDate ?? ""}
							min={fromDate ?? undefined}
							onChange={(e) => setToDate(e.target.value || null)}
							className="border border-gray-2 rounded px-2 py-1 h-8 cursor-pointer"
						/>
					</div>
				</div>

				<div className="mt-4">
					<ReservationList
						reservations={reservations?.reservation ?? []}
						loading={loading}
						onCancel={handleConfirm}
						loadingCancelId={loadingCancelId}
					/>
				</div>
			</div>

			<div ref={loaderRef} className="h-1" />

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
				isOpen={isAlertTimeDialogOpen}
				onClose={() => setIsAlertTimeDialogOpen(false)}
				confirmText="Aceptar"
				type="info"
				title="Cancelar reserva"
				description='No es posible cancelar la reserva porque falta menos de una hora para el inicio del viaje.'
				loading={loading}
				singleButton={true}
			/>
		</div>
	)
}
