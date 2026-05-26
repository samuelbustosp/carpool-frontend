'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toast } from "@/components/ux/Toast";
import { getReviewsFromMe } from "@/services/review/reviewService";
import { ListFilter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReviewsFromMeResponse } from "../../types/ReviewsFromMeResponse";
import { ReviewsFromMeList } from "./ReviewsFromMeList";
import RoleSelectorHeader from "@/components/ux/RoleSelectorHeader";
import { UserReviewCardSkeleton } from "../UserRevireCardSkeleton";


export const ORDERS_BY = [
  { label: "Más recientes", value: "RECENT" },
  { label: "Mejor puntuación", value: "RATING_DESC" },
  { label: "Peor puntuación", value: "RATING_ASC" },
];
export default function ReviewsFromMe(){
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [reviewsFromMe, setReviewsFromMe] = useState<ReviewsFromMeResponse | null>(null)
  const [orderBy, setOrderBy] = useState("RECENT");
  const [role, setRole]=useState('passenger');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 10;

  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);

  const handleChangeRole = (value: string) => {
    setRole(value);
  };


  const loadReviews = useCallback(async (reset = false) => {
    try{
      if (!hasMoreRef.current && !reset) return;
      setLoading(true);
  
      const currentSkip = reset ? 0 : skipRef.current;
  
      if (reset) {
        skipRef.current = 0;
        hasMoreRef.current = true;
      }
  
      const reviewsRes = await getReviewsFromMe(
        role, currentSkip, orderBy, fromDate ? new Date(fromDate) : undefined, toDate ? new Date(toDate) : undefined
      );
  
      const newReviews = reviewsRes.data?.reviews ?? [];
      const newTotal = reviewsRes.data?.total ?? 0
  
      if (reset) {
        setReviewsFromMe({ reviews: newReviews, total: newTotal });
      } else {
        setReviewsFromMe(prev => ({
          reviews: [...(prev?.reviews ?? []), ...newReviews],
          total: newTotal
        }));
      }
  
      if (newReviews.length < LIMIT) {
        hasMoreRef.current = false;
      } else {
        skipRef.current = currentSkip + LIMIT;
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

    setLoading(false);
  }, [role, orderBy, fromDate, toDate]);


  useEffect(() => {
    setReviewsFromMe(null); 
    setHasMore(true);
    loadReviews(true);
  }, [orderBy,role, fromDate, toDate]);


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
      <RoleSelectorHeader
        title="Listado de reseñas"
        description={`Aca podés ver las reseñas que realizaste como ${role === 'passenger' ? 'pasajero' : 'conductor'}.`}
        role={role}
        onChangeRole={handleChangeRole}
      />
    <div className="flex flex-col gap-3 pb-4">

      {/* Filtro + Orden */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-8 w-fit">
          <ListFilter size={20}/>
          <p>Filtros</p>
        </div>

        <Select
          value={orderBy}
          onValueChange={setOrderBy}
        >
          <SelectTrigger
            id="orderBy"
            className="font-outfit dark:bg-dark-5 flex-1"
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

      {/* Fechas */}
      <div className="flex gap-3">
        <div className="flex flex-col text-sm flex-1">
          <label className="text-gray-11 mb-1">Desde</label>
          <input
            type="date"
            value={fromDate ?? ""}
            onChange={(e) => setFromDate(e.target.value || null)}
            max={toDate ?? undefined}
            className="border border-gray-2 rounded px-2 py-1 h-8"
          />
        </div>

        <div className="flex flex-col text-sm flex-1">
          <label className="text-gray-11 mb-1">Hasta</label>
          <input
            type="date"
            value={toDate ?? ""}
            min={fromDate ?? undefined}
            onChange={(e) => setToDate(e.target.value || null)}
            className="border border-gray-2 rounded px-2 py-1 h-8"
          />
        </div>
      </div>

</div>

      <ReviewsFromMeList reviews={reviewsFromMe?.reviews ?? []} passenger={role == 'passenger' } />

      {reviewsFromMe?.reviews.length === 0 && loading &&
        Array.from({ length: 5 }).map((_, index) => (
          <UserReviewCardSkeleton key={index} />
        ))
      }

      {reviewsFromMe?.reviews && reviewsFromMe?.reviews.length > 0 && loading && <UserReviewCardSkeleton />}

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
