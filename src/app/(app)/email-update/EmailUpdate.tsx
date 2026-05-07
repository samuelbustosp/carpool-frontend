'use client'

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailUpdatePage(){
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();


    useEffect(() => {
        const verifyEmail = async () => {
        if (!token) {
            setStatus("error");
            setMessage("No se ha proporcionado un token válido.");
            return;
        }

        try {
           
            const res = await fetch('/api/users/confirm-email-change', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
            credentials: "include",
            });
            if(res.ok){
                setStatus("success");
                setMessage("Tu correo fue actualizado correctamente.");
            }
            else{
                const result = await res.json();
                setStatus("error");
                setMessage(result.messages[0] || "Hubo un problema al actualizar el correo.");
            }
            // Redirigir después de 3 segundos
            setTimeout(() => router.push("/login"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("Hubo un problema al actualizar el correo.");
        }
        };

        verifyEmail();
    }, [router, token]);



    if (status === "success") {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen py-6 px-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-success">¡Correo actualizado!</h1>
            <p className="text-gray-3 mt-4 max-w-md mb-8 font-inter">
            Tu correo fue actualizado correctamente. Ahora podés iniciar sesión con tu nuevo correo.
            </p>
        </div>
        );
    }

    if (status === "error") {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen py-6 px-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-error" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-error">Error al cambiar el correo</h1>
            <p className="text-gray-3 mt-4 max-w-md mb-8 font-inter">
            {message}
            </p>
            <div className="space-y-3 max-w-md font-inter mb-8">
            <div className="flex items-center space-x-3 text-sm text-gray-5">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-left">El enlace puede haber expirado (48 horas)</p>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-5">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-left">El enlace ya fue utilizado anteriormente</p>
            </div>
            </div>
        </div>
        );
    }


}