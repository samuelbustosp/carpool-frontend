'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoleSelectorHeader from "@/components/ux/RoleSelectorHeader";
import { Toast } from "@/components/ux/Toast";
import { getReviewsToMe } from "@/services/review/reviewService";
import { ListFilter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rating } from "react-simple-star-rating";
import { useAuth } from "@/contexts/authContext";
import Image from "next/image";
import { ReviewsToMeResponse } from "../../types/ReviewsToMeResponse";
import { ReviewsToMeList } from "./ReviewsToMeList";
import { UserReviewCardSkeleton } from "../UserRevireCardSkeleton";


export const ORDERS_BY = [
  { label: "Más recientes", value: "RECENT" },
  { label: "Mejor puntuación", value: "RATING_DESC" },
  { label: "Peor puntuación", value: "RATING_ASC" },
];
export default function ReviewsToMe(){
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [reviewsToMe, setReviewsToMe] = useState<ReviewsToMeResponse | null>(null)
  const [orderBy, setOrderBy] = useState("RECENT");
  const [role, setRole]=useState('passenger');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 10;

  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const {user} = useAuth()

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
  
      const reviewsRes = await getReviewsToMe(
        role, currentSkip, orderBy, fromDate ? new Date(fromDate) : undefined, toDate ? new Date(toDate) : undefined
      );
  
      const newReviews = reviewsRes.data?.reviews ?? [];
      const newTotal = reviewsRes.data?.total ?? 0;
      const newRating = reviewsRes.data?.rating ?? 0;
  
      if (reset) {
        setReviewsToMe({ reviews: newReviews, total: newTotal, rating: newRating });
      } else {
        setReviewsToMe(prev => ({
          reviews: [...(prev?.reviews ?? []), ...newReviews],
          total: newTotal, 
          rating: newRating
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
    setReviewsToMe(null); 
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

      <div className="flex items-center justify-center gap-3 pb-3 bg-gray-8 rounded-lg px-3 py-2 mb-2">
        {user ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border">
            <Image
              src={user.profileImage ?? "/default-profile.png"}
              alt={user.name ?? ''}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-2 animate-pulse" />
        )}

        {reviewsToMe?.rating !== undefined ? (
          <div className="text-3xl font-semibold">
            {reviewsToMe.rating.toFixed(1)}
          </div>
        ) : (
          <div className="h-8 w-12 rounded bg-gray-2 animate-pulse" />
        )}

        <div className="flex flex-col">
          <Rating
            initialValue={reviewsToMe?.rating}
            fillColor="#ffffff"
            emptyColor="#706562"
            size={18}
            readonly
            allowFraction
            SVGstyle={{ display: "inline" }}
          />
          <span className="text-xs text-gray-11">
            como {role === "passenger" ? "pasajero" : "conductor"}
          </span>
        </div>
      </div>
      <RoleSelectorHeader
        title="Listado de reseñas"
        description="Aca podés ver las reseñas que otros conductores y pasajeros te han realizado"
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
      


      
      <ReviewsToMeList reviews={reviewsToMe?.reviews ?? []} passenger={role == 'passenger' } />

      {reviewsToMe?.reviews.length === 0 && loading &&
        Array.from({ length: 5 }).map((_, index) => (
          <UserReviewCardSkeleton key={index} />
        ))
      }

      {reviewsToMe?.reviews && reviewsToMe?.reviews.length > 0 && loading && <UserReviewCardSkeleton />}

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
