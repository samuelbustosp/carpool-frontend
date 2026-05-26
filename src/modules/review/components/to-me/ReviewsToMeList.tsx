import { EmptyAlert } from "@/components/ux/EmptyAlert";

import { StarOff } from "lucide-react";
import { UserReviewCard } from "../UserReviewCard";
import { UserReview } from "../../types/UserReview";


interface ReviewsToMeListProps{
  reviews: UserReview[] | null | undefined;
  passenger: boolean
}

export function ReviewsToMeList({reviews, passenger}:ReviewsToMeListProps){
  if(reviews?.length === 0){
    return(
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<StarOff size={32} />}
          title="No te han realizado reseñas"
          description="Las reseñas que te hagan aparecerán aquí."
        />
      </div>
    )
  }

  return(
    <div className="flex flex-col">
      {reviews?.map((review) => (
        <UserReviewCard key={review.id} review={review} passenger={passenger} fromMe= {false}/>
      ))}
    </div>
  )
}