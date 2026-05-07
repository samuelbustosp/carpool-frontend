import ReviewsToMe from "@/modules/review/components/to-me/ReviewsToMe";

export default function ReviewsFromMePage(){
  return(
    <div className="max-w-lg mx-auto w-full">
      <div className="flex items-center justify-center w-full">
      <ReviewsToMe />
      </div>
    </div>
  )
}