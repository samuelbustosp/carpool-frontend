'use client'

import { Toast } from "@/components/ux/Toast";
import { getDriverReviews } from "@/services/review/reviewService";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DriverReviewResponse } from "../../types/DriverReviewResponse";
import { DriverReviewsList } from "./DriverReviewsList";
import { ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewCardSkeleton } from "../ReviewCardSkeleton";

export const ORDERS_BY = [
  { label: "Más recientes", value: "RECENT" },
  { label: "Mejor puntuadas", value: "RATING_DESC" },
  { label: "Peor puntuadas", value: "RATING_ASC" },
];
export default function DriverReviews(){
  const {driverId} = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [driverReviews, setDriverReviews] = useState<DriverReviewResponse[] | null>(null)
  const [orderBy, setOrderBy] = useState("RECENT");
  
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 10;
  const reviews = driverReviews ?? [];

  const loadReviews = useCallback( async (reset = false) => {
    try{
      if (!driverId || (!hasMore && !reset)) return;
      setLoading(true);


      const currentSkip = reset ? 0 : skip;

      const reviewsRes = await getDriverReviews(
        Number(driverId),
        currentSkip,
        orderBy
      );

      if(reviewsRes.state != 'OK'){
        setToast({message: reviewsRes.messages[0] ?? 'Ocurrió un error', type: 'error'})
      }

      const newReviews = reviewsRes.data ?? [];

      if (reset) {
        setDriverReviews(newReviews);
      } else {
        setDriverReviews(prev => [...(prev ?? []), ...newReviews]);
      }

      if (newReviews.length < LIMIT) {
        setHasMore(false);
      }else {
        setSkip(prev => prev + LIMIT);
      }

    }catch(error: unknown){
      if (error instanceof Error) {
        setToast({message: error.message, type: 'error'})
      } else {
        setToast({message: 'Ocurrió un error inesperado', type: 'error'})
      }
    }finally{
      setLoading(false)
    }
  },[driverId, skip, orderBy, hasMore]);


  useEffect(() => {
    setSkip(0);
    setDriverReviews(null); 
    setHasMore(true);
    loadReviews(true);
  }, [driverId, orderBy]);


  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        loadReviews();
      }
    });

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loadReviews, loading, hasMore]);

  return(
    <div className="w-full">
      <div className="mb-3">
        <h1 className="text-xl font-semibold mb-1">Reseñas del conductor</h1>
        <p className="font-inter text-sm">
          Acá podés ver las reseñas que otros pasajeros le realizaron a este conductor.
        </p>

      </div>
      <div className="flex items-center w-1/2 gap-2 pb-4">
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-8">
          <ListFilter size={20}/>
          <p>Filtro</p>
        </div>

        <Select
          value={orderBy}
          onValueChange={setOrderBy}
        >
          <SelectTrigger
            id="orderBy"
            className="font-outfit dark:bg-dark-5"
          >
            <SelectValue/>
          </SelectTrigger>

          <SelectContent>
            {ORDERS_BY.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!loading && <DriverReviewsList reviews={reviews} />}
      

      {reviews.length === 0 && loading &&
        Array.from({ length: 5 }).map((_, index) => (
          <ReviewCardSkeleton key={index} />
        ))
      }

      {reviews.length > 0 && loading && <ReviewCardSkeleton />}



      <div ref={loaderRef} className="h-1" />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )

}
