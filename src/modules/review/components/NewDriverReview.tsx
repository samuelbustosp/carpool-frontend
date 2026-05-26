'use client'

import { Button } from "@/components/ux/Button";
import { useParams, useRouter } from "next/navigation";
import { Rating } from "react-simple-star-rating";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReviewForm, reviewSchema } from "../schemas/reviewSchema";
import { ReviewRequestDTO } from "../types/dto/ReviewRequestDTO";
import { createDriverReview, canUserReview } from "@/services/review/reviewService";
import { Toast } from "@/components/ux/Toast";
import { AlertDialog } from "@/components/ux/AlertDialog";
import { ErrorMessage } from "@/components/ui/Error";
import { NewDriverReviewSkeleton } from "./NewDriverReviewSekeleton";


export default function NewDriverReview() {
  const { tripId } = useParams();
  const [rating, setRating] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  useEffect(() => {
    const verifyCanUserReview = async () => {
      try {
        if (!tripId) return;

        setIsChecking(true);

        const canReviewRes = await canUserReview(tripId.toString());

        if (!canReviewRes.data) {
          setError('No puedes realizar una reseña para este viaje.');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocurrió un error inesperado.");
        }
        console.error(error);
      } finally {
        setIsChecking(false);
      }
    };

    if (tripId) {
      verifyCanUserReview();
    }
  }, [tripId]);

  const handleRating = (rate: number) => {
    if (isSubmitting) return;
    setRating(rate);
    setValue("rating", rate, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewForm) => {
    const payload: ReviewRequestDTO = {
      stars: data.rating,
      description: data.comment,
      tripId: Number(tripId),
    };

    try {
      const response = await createDriverReview(payload);

      if (response.state != 'OK') {
        setToast({ message: response.messages[0] ?? 'Error al crear la reseña', type: 'error' });
        return
      }
      setIsSuccessDialogOpen(true)
    } catch (error: unknown) {
      let message = "Error desconocido";
      if (error instanceof Error) message = error.message;
      setToast({ message, type: 'error' });
    }


  };

  const commentValue = watch("comment") || "";

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Muy malo";
      case 2:
        return "Malo";
      case 3:
        return "Regular";
      case 4:
        return "Bueno";
      case 5:
        return "Excelente";
      default:
        return "Seleccioná una calificación";
    }
  };

  if (isChecking) {
    return (
      <div className="h-full my-auto w-full">
        <NewDriverReviewSkeleton/>
      </div>
    );
  }



  if (error) return (
    <div className="h-full my-auto">
      <ErrorMessage message={error} />
    </div>

  );
  
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full"
    >
      <span className="text-lg font-medium">
        ¿Cómo calificarías al conductor?
      </span>
      {/* Rating */}
      <div className="flex flex-col gap-1 justify-center items-center">
       
        <Rating
          onClick={handleRating}
          fillColor="#ffffff"
          emptyColor="#706562"
          size={40}
          SVGstyle={{ display: "inline" }}
          className={isSubmitting ? "pointer-events-none opacity-50" : ""}
        />

        <span className="text-lg font-bold">
          {getRatingText(rating)}
        </span>
        

        {errors.rating && (
          <span className="text-sm text-red-500">
            {errors.rating.message}
          </span>
        )}
      </div>
      <span className="text-lg font-medium">
        ¿Querés contarnos un poco más?
      </span>
      <div className="flex flex-col gap-1">
        <textarea
          {...register("comment")}
          rows={4}
          maxLength={300}
          placeholder="¿Que le dirias a otras personas acerca de este conductor? (Opcional)"
          disabled={isSubmitting}
          className={`
            w-full rounded-xl border bg-gray-2 p-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary
            ${errors.comment ? "border-red-500" : "border-gray-5"}
            ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>{commentValue.length}/250</span>
          {errors.comment && (
            <span className="text-red-500">
              {errors.comment.message}
            </span>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <div className="px-6 py-0.5 flex justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-2 border-t-transparent" />
          </div>
        ) : (
          "Reseñar"
        )}
      </Button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AlertDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        type="success"
        title="¡Reseña enviada con éxito!"
        description='Gracias por tomarte el tiempo de calificar al conductor. Tu comentario ayuda a que los viajes sean cada vez mejores'
        confirmText="Aceptar"
        singleButton={true}
        onConfirm={()=> router.push('/home')}
      />
    </form>


  );
}
