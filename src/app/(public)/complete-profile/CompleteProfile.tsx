"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompleteRegistrationForm } from "@/modules/auth/components/CompleteRegistrationForm";

type Props = {
  queryEmail: string;
};

export default function CompleteProfilePage({ queryEmail }: Props) {
  const [email, setEmail] = useState(queryEmail);
  const router = useRouter();

  useEffect(() => {
    if (queryEmail) {
      // Guarda el email en estado local
      setEmail(queryEmail);

      // Limpia la URL reemplazando sin query string
      router.replace("/complete-profile");
    }
  }, [queryEmail, router]);

  //if (!email) return null; 

  return (
    
      <div className="mx-auto w-full max-w-lg space-y-6 py-4">

        <Link
          href="/login"
          className="flex items-center text-sm hover:text-gray-3 mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Link>

        <div className="flex flex-col items-start w-full space-y-2">
          <h1 className="text-lg font-semibold">Completa tu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Estás a un paso de completar tu registro. Ingresá tus datos
            personales para finalizar.
          </p>
        </div>

        <CompleteRegistrationForm email={email} />
      </div>

  );
}
