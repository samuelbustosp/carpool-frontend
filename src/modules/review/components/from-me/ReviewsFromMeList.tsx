import { EmptyAlert } from "@/components/ux/EmptyAlert";
import { UserReview } from "../../types/UserReview";
import { UserReviewCard } from "../UserReviewCard";
import { StarOff } from "lucide-react";
import { AlertDialog } from "@/components/ux/AlertDialog";
import { useState } from "react";
import { deleteReview } from "@/services/review/reviewService";


interface ReviewsFromMeListProps{
  reviews: UserReview[] | null | undefined;
  passenger: boolean
}

export function ReviewsFromMeList({reviews, passenger}:ReviewsFromMeListProps){
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = (reviewId: number) => {
    setIsDeleteDialogOpen(true);
    setDeleteReviewId(reviewId);
  };
  
  const handleDeleteConfirm = async () => {    
    setLoading(true);
    
    try {
      const response = await deleteReview(String(deleteReviewId));
      
      if (response.state === "OK") {
        setIsSuccessDialogOpen(true);
      } else {
        setIsErrorDialogOpen(true);
        setDeleteError(response.messages?.[0] || "Error al eliminar la reseña");
      }
    } catch (error: unknown){
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setDeleteError(error instanceof Error ? error.message : "Error al eliminar la reseña");
    } finally {
      setIsDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  if(reviews?.length === 0){
    return(
      <div className="bg-dark-5 h-48 rounded-2xl flex items-center border border-gray-2/50">
        <EmptyAlert
          icon={<StarOff size={32} />}
          title="Aún no has realizado reseñas"
          description="Las reseñas que hagas aparecerán aquí."
        />
      </div>
    )
  }

  return(
    <div className="flex flex-col">
      {reviews?.map((review) => (
        <UserReviewCard key={review.id} review={review} passenger={passenger} fromMe={true} handleDelete={() => handleDelete(review.id)}/>
      ))}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        type="info"
        title="¿Estás seguro de eliminar la reseña?"
        description="Una vez eliminada no se podrá deshacer esta acción."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={loading}
        autoCloseOnConfirm={false}
      />

      <AlertDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        type="error"
        title="Ocurrió un error!"
        description={deleteError ?? "Error al eliminar la reseña"}
        confirmText="Aceptar"
        singleButton={true}
      />

      <AlertDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => {
          setIsSuccessDialogOpen(false)
          window.location.reload();
        }}
        type="success"
        title="Operación exitosa!"
        description="La reseña fue eliminada correctamente."
        confirmText="Aceptar"
        singleButton={true}
      />
    </div>
  )
}