import { DriverReviewResponse } from "../../types/DriverReviewResponse";
import { ReviewCard } from "../ReviewCard";

interface DriverReviewsListProps{
  reviews: DriverReviewResponse[];
}

export function DriverReviewsList({reviews}:DriverReviewsListProps){
  if(reviews.length === 0){
    return(
      <div className="text-center text-sm text-gray-600 py-10">
        Este conductor todavía no tiene reseñas.
      </div>
    )
  }

  return(
    <div className="flex flex-col">
      {reviews.map((review) => (
        <ReviewCard key={review.reviewId} stars={review.stars} description={review.description} createdAt={review.createdAt}/>
      ))}
    </div>
  )
}