import { Button } from "@/components/ux/Button";
import Separator from "@/components/ux/Separator";
import { Circle, Square, Star, UserX } from "lucide-react";
import Image from "next/image";
import { MdOutlineBackpack, MdOutlineNoBackpack } from "react-icons/md";
import { ReservationDTO } from "../types/reservation";
import { formatISOToShortDate } from "@/shared/utils/date";
import { capitalizeWords } from "@/shared/utils/string";
import { formatISOToDateTime } from "@/shared/utils/dateTime";

type ReservationVariant = 'DRIVER' | 'PASSENGER';
export interface ReservationProps {
    reservation: ReservationDTO;
    variant?: ReservationVariant;
    onAccept?: () => void;
    onReject?: () => void;
    onDelete?: () => void;
    onCancel?: () => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
    isDeleting?: boolean;
    isCanceling?: boolean;
}


export default function Reservation({ reservation,variant, onAccept, onReject,onDelete, onCancel, isAccepting,isRejecting, isDeleting, isCanceling}: ReservationProps) {
    return (
        <div className="trip-card mb-4 p-4 border border-gray-2 rounded-lg shadow-sm transition-all duration-200">
            <div className="flex items-center gap-4 w-full justify-between">
                <div className="flex items-center gap-2">

                    <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                        <Image
                        src={reservation.urlImage}
                        alt={"Foto de perfil del pasajero"}
                        fill
                        className="object-cover"
                        />
                    </div>


                    <div className="flex items-end gap-4">
                        <p className="text-xl">{reservation.nameUser} {reservation.lastNameUser}</p>
                        <p className={`flex items-center gap-1 text-success`}>
                            {reservation.ratingUser}
                            <span>
                                <Star size={12} fill="currentColor" />
                            </span>
                        </p>
                    </div>
                </div>
                <p className="text-sm">
                    {variant === 'PASSENGER'
                        ? formatISOToDateTime(reservation.tripStartDatetime)
                        : formatISOToShortDate(reservation.createdAt)
                    }
                </p>
            </div>


            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col items-center">

                        <Circle size={12} stroke="currentColor"/>

                        <div className="w-0.5 h-5 bg-gray-5 my-1"></div>
                        <Square size={12} fill="currentColor" stroke="currentColor" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-medium">{capitalizeWords(reservation.startCity)}</p>
                        <p className="font-medium">{capitalizeWords(reservation.destinationCity)}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    {reservation.baggage ? (
                        <>
                            <span className="text-3xl p-2 rounded-full bg-gray-8">
                                <MdOutlineBackpack />
                            </span>
                            <p>Con equipaje</p>
                        </>
                    ) : (
                        <>
                            <span className="text-3xl p-2 rounded-full bg-gray-8">
                                <MdOutlineNoBackpack />
                            </span>
                            <p>Sin equipaje</p>
                        </>
                    )}
                </div>
            </div>
            {variant === 'DRIVER' && reservation.state ==='PENDING' && 
                <div>
                    <Separator color="bg-gray-2" marginY="my-2" />
                    <div className="flex items-center gap-6 justify-end">
                        
                        <Button variant="outline" onClick={onReject} disabled={isAccepting || isRejecting}>
                            {isRejecting ? (
                                <div className="px-5 py-0.5">
                                    <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-6 border-t-transparent"></div>
                                </div> 
                            ) : (
                                "Rechazar"
                            )}
                        </Button>
                        
                        <Button variant="primary"  className="px-5" onClick={onAccept} disabled={isAccepting || isRejecting}>
                            {isAccepting ? (
                                <div className="px-5 py-0.5">
                                    <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent"></div>
                                </div>  
                            ) : (
                                "Aceptar"
                            )}
                        </Button>
                    </div>
                </div>
            }

            {variant === 'DRIVER' && reservation.state ==='ACCEPTED' && 
                <div>
                    <Separator color="bg-gray-2" marginY="my-2" />
                    <div className="flex items-center gap-6 justify-end">
                        
                        <Button variant="outline" onClick={onDelete} disabled={isDeleting}
                            className="
                            flex! items-center! gap-2!
                            px-3! py-2! rounded-lg! text-sm!
                            text-red-500!
                            bg-red-500/10!
                            transition-none!
                            ">
                            {isDeleting ? (
                                <div className="px-5 py-0.5">
                                    <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-6 border-t-transparent"></div>
                                </div> 
                            ) : (
                                <>
                                <UserX size={16} />
                                Quitar pasajero
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            }

            {variant === 'PASSENGER' && (
                <div>
                    <Separator color="bg-gray-2" marginY="my-2" />
                    <div className="flex items-center gap-6 justify-end">
                        <Button 
                            variant="outline" 
                            onClick={onCancel} 
                            disabled={isCanceling}
                            className="text-red-500 bg-red-500/10"
                        >
                            {isCanceling ? (
                                <div className="px-5 py-0.5">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-6 border-t-transparent"></div>
                                </div>
                            ) : (
                                "Cancelar reserva"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}