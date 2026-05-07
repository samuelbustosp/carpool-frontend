import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { R2_PUBLIC_PREFIX } from "@/constants/imagesR2";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row py-4">
      {/* Columna izquierda fija (solo en md+) */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-1/2 bg-gradient-to-b from-dark-4 via-dark-3 to-dark-2 px-[156px] py-12 items-center justify-center z-10">
        <div className="flex flex-col items-center text-center w-[200px]">
          <Image
            src={`${R2_PUBLIC_PREFIX}/carpool-wslogan.png`}
            alt="Imagen de login"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
          <h1 className="font-outfit font-regular mt-4 text-lg text-white">
            Un viaje compartido, un destino en común.
          </h1>
        </div>
      </div>

      {/* Columna derecha con scroll (ajustada para que no se superponga con la izquierda fija) */}
      <div className="w-full md:ml-[50%] md:w-1/2 flex items-center justify-center md:px-[156px] min-h-screen overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo solo en mobile */}
          <div className="md:hidden mb-6 flex justify-center">
            <Image
              src={`${R2_PUBLIC_PREFIX}/logo-carpool.png`}
              alt="Logo de carpool."
              width={220}
              height={50}
              priority
              className="dark:invert-0 invert"
            />
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

