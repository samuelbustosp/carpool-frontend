'use client'

import Separator from "@/components/ux/Separator";
import { formatSmartShortDateText } from "@/shared/utils/date";
import { capitalizeWords } from "@/shared/utils/string";
import { ChevronRight, Star, UserX } from "lucide-react";
import Image from "next/image";
import { MdOutlineBackpack, MdOutlineNoBackpack } from "react-icons/md";
import { ReservationDTO } from "../types/reservation";
import { useState } from "react";

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

export function getRatingColor(rating: number) {
  if (rating >= 4.8) return "text-green-500/90";
  if (rating >= 4.5) return "text-lime-500";
  if (rating >= 4) return "text-lime-400";
  if (rating >= 3.5) return "text-yellow-400";
  if (rating >= 3) return "text-amber-500";
  if (rating >= 2) return "text-orange-400";

  return "text-red-400";
}


export default function Reservation({ reservation, variant, onAccept, onReject, onDelete, onCancel, isAccepting, isRejecting, isDeleting, isCanceling }: ReservationProps) {
  const [imageLoading, setImageLoading] = useState(true)

  return (
    <div className="mb-4 p-4 border border-gray-2 rounded-xl shadow-sm transition-all duration-200">
      <div className="flex items-start w-full justify-between">
        <div className="flex items-center gap-2">

          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 animate-pulse bg-gray-2" />
            )}

            <Image
              src={reservation.urlImage}
              alt="Foto de perfil del pasajero"
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
            />
          </div>


          <div className="flex flex-col">
            {variant === 'PASSENGER' && <p className="text-xs leading-2 text-gray-11">Conductor</p>}
            <p className="text-lg leading-tight font-semibold">{reservation.nameUser} {reservation.lastNameUser}</p>
            <p className="text-sm flex w-fit items-center gap-1 bg-gray-2 text-gray-1/75 rounded px-2">
              <span className={`${getRatingColor(reservation.ratingUser)
              }`}>
                <Star size={12} fill="currentColor" />
              </span>
              {reservation.ratingUser.toFixed(1)}
            </p>
          </div>
        </div>
        <p className="inline-flex items-center text-xs text-gray-6 mb-2 bg-gray-7 gap-1 px-3 py-1 rounded-xl ">
          {variant === 'PASSENGER'
            ? formatSmartShortDateText(reservation.tripStartDatetime)
            : formatSmartShortDateText(reservation.createdAt)
          }
        </p>
      </div>


      <div className="flex items-center justify-between ">
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-2 font-semibold text-[13px] md:text-base">
            <p className="flex flex-col leading-3.5 truncate">
              <span className="text-[11px] md:text-xs font-normal text-gray-11">desde</span>
              {capitalizeWords(reservation.startCity)}
            </p>
            <span className="p-0.5 md:p-1 bg-gray-7 rounded-full"><ChevronRight size={14}/></span>
            <p className="flex flex-col leading-3.5 truncate">
              <span className="text-[11px] md:text-xs font-normal text-gray-11">hasta</span>
              {capitalizeWords(reservation.destinationCity)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {reservation.baggage ? (
            <>
              <span className="text-xl p-2 rounded-full bg-gray-8">
                <MdOutlineBackpack />
              </span>
              <p className="text-[13px] md:text-base">Con equipaje</p>
            </>
          ) : (
            <>
              
              <span className="text-xl p-2 rounded-full bg-gray-8">
                <MdOutlineNoBackpack />
              </span>
              <p className="text-[13px] md:text-base">Sin equipaje</p>
            </>
          )}
        </div>
      </div>
      
      {variant === 'DRIVER' && reservation.state === 'PENDING' &&
        <div>
          <Separator color="bg-gray-2" marginY="my-2" />
          <div className="flex items-center gap-4 justify-end">
            <button
              onClick={onReject} 
              disabled={isAccepting || isRejecting}
              className="text-sm text-gray-11 border border-gray-9 px-3 py-1 rounded-lg hover:bg-gray-8 hover:text-white focus:ring-gray-9 cursor-pointer"
            >
              {isRejecting ? (
                <div className="px-3 py-0.5">
                  <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-6 border-t-transparent"></div>
                </div>
              ) : (
                "Rechazar"
              )}
            </button>

            <button 
              className="text-sm px-4 border border-transparent bg-gray-1 py-1 rounded-lg text-dark-1 hover:bg-white hover:text-black cursor-pointer" 
              onClick={onAccept} 
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <div className="px-4 py-0.5">
                  <div className=" h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent"></div>
                </div>
              ) : (
                "Aceptar"
              )}
            </button>
          </div>
        </div>
      }

      {variant === 'DRIVER' && reservation.state === 'ACCEPTED' &&
        <div>
          <Separator color="bg-gray-2" marginY="my-2" />
          <div className="flex items-center gap-6 justify-end">

            <button onClick={onDelete} disabled={isDeleting}
              className="
                flex items-center gap-2
                px-3 py-1 rounded-lg text-sm
                text-red-500/80
                bg-red-500/10
                hover:bg-red-500/20 hover:text-red-500
                transition-none cursor-pointer
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
            </button>
          </div>
        </div>
      }

      {variant === 'PASSENGER' && (
        <div>
          <Separator color="bg-gray-2" marginY="my-2" />
          <div className="flex items-center gap-6 justify-end">
            <button
              onClick={onCancel}
              disabled={isCanceling}
              className="text-red-500/80 bg-red-500/10 hover:bg-red-500/20 hover:text-red-500 
              py-1 px-3 text-sm rounded-lg cursor-pointer"
            >
              {isCanceling ? (
                <div className="px-5 py-0.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-6 border-t-transparent"></div>
                </div>
              ) : (
                "Cancelar reserva"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}