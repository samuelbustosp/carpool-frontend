'use client'

import { Alert } from "@/components/ux/Alert";
import { Button } from "@/components/ux/Button";
import { Input } from "@/components/ux/Input";
import Spinner from "@/components/ux/Spinner";
import { useAuth } from "@/contexts/authContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { LoginData, loginSchema } from "../schemas/loginSchema";


export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const { login, loading, authGoogle } = useAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const googleLogin = useGoogleLogin({
    flow: 'implicit',

    onSuccess: async (tokenResponse) => {
      try {
        await authGoogle(tokenResponse.access_token)
      } catch (error) {
        console.error(error)
      }
    },

    onError: () => {
      setError('Error en autenticación con Google')
    }
  })
  

  const onSubmit = async (data: LoginData) => {
    setError(null);
    try {
      // Ejecutar reCAPTCHA
      if (!executeRecaptcha) {
        setError('reCAPTCHA no está disponible')
        return
      }

      //Obtener el token de recaptcha, pasando el action login, para saber que estamos haciendo
      const gRecaptchaToken = await executeRecaptcha('login')
      
      if (!gRecaptchaToken) {
        setError('Error al validar reCAPTCHA')
        return
      }
      
      //Crear un nuevo objeto con los datos del login y el captcha, para iniciar sesion
      await login({ ...data, recaptchaToken: gRecaptchaToken })

      
    } catch (error: unknown) {
      let message = "Error desconocido";

      if (error instanceof Error) {
        message = error.message;
      }
      setError(message || 'Error al iniciar sesión');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full md:py-6">
      <div className="flex flex-col items-center text-center mb-2">
        <h1 className="font-outfit text-lg font-semibold">Inicia sesión en tu cuenta</h1>
        <p className="font-inter font-regular text-sm">Ingresa email y contraseña para iniciar sesión</p>
      </div>
      {error && <Alert message={error} />}
      <div className="flex flex-col">
        <Input
          label="Nombre de usuario"
          type="text"
          autoComplete="username"
          {...register('username')}
          error={errors.username?.message}
        />
      </div>

      <div className="flex flex-col">
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <Link href="/password-change/send-email" className="flex justify-start hover:underline cursor-pointer text-sm font-inter">
        ¿Olvidaste tu contraseña?
      </Link>

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size={20} />
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar sesión'
        )}
      </Button>

      <p className="flex justify-start items-center text-sm gap-1 font-inter">
        ¿No tenes cuenta?
        <Link href="/register" className="flex justify-start hover:underline cursor-pointer font-medium">
         Registrate acá
        </Link>
      </p>
      

      <div className="flex items-center gap-2 text-gray-500">
        <div className="flex-1 h-px bg-gray-4/50" />
        <span className="text-sm font-inter">o</span>
        <div className="flex-1 h-px bg-gray-4/50" />
      </div>
      
      <button
        type="button"
        className="flex items-center justify-center gap-3 py-3 w-full 
          rounded-full border bg-gray-8 border-gray-2/80 text-sm font-medium
          text-gray-11 hover:bg-gray-7 hover:text-white transition cursor-pointer"
        onClick={() => googleLogin()}
      >
        <FcGoogle size={20} />
        Continuar con Google
      </button>

      <p className="w-full text-center text-sm text-gray-4 font-inter">
        Al hacer clic en continuar, aceptás nuestros
        <a href="/files/terminos_y_condiciones.pdf" download className="mx-1 text-dark-2 dark:text-gray-1 font-medium underline">Términos de Servicio
        y Política de Privacidad.</a>
      </p>
    </form>
  )
}