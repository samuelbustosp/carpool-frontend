'use client'

import { registerUser } from "@/services/auth/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useGoogleLogin } from "@react-oauth/google";
import { Check, X } from 'lucide-react';
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert } from "@/components/ux/Alert";
import { Button } from "@/components/ux/Button";
import { Input } from "@/components/ux/Input";
import Spinner from "@/components/ux/Spinner";
import { GENDERS } from "@/constants/genders";
import { useFieldValidator } from "@/shared/hooks/useFieldValidator";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { RegisterData, RegisterStep1Data, registerStep1Schema, RegisterStep2Data, registerStep2Schema } from "../schemas/registerSchema";


export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { authGoogle } = useAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()


  // Form para el paso 1
  const step1Form = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  // Form para el paso 2
  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      lastname: '',
      dni: '',
      birthDate: '',
      phone: '',
      gender:'UNSPECIFIED'
    }
  })

  const formatDate = (date: string) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const usernameValidation = useFieldValidator('username');
  const emailValidation = useFieldValidator('email');
  const dniValidation = useFieldValidator('dni');
  const phoneValidation = useFieldValidator('phone')

  //  observador del input, se activa cuando el value del input cambia
  // Watch para campos de step1Form: username y email
  useEffect(() => {
    const subscription = step1Form.watch((value, { name }) => {
      if (name === "username" && value.username) {
        step1Form.trigger("username").then((isValid) => {
          if (isValid) usernameValidation.validate(value.username!);
        });
      } else if (name === "email" && value.email) {
        step1Form.trigger("email").then((isValid) => {
          if (isValid) emailValidation.validate(value.email!);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [step1Form, usernameValidation, emailValidation]);

  useEffect(() => {
    const subscription = step2Form.watch((value, { name }) => {
      if (name === "dni" && value.dni) {
        step2Form.trigger("dni").then((isValid) => {
          if (isValid) dniValidation.validate(value.dni!);
        });
      } else if (name === "phone" && value.phone) {
        step2Form.trigger("phone").then((isValid) => {
          if (isValid) phoneValidation.validate(value.phone!);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [step2Form, dniValidation, phoneValidation]);

  const getRightIcon = (validation: ReturnType<typeof useFieldValidator>) => {
    if (validation.checking) return <Spinner size={16} />;
    if (validation.available === true) return <Check className="w-4 h-4 text-success" />;
    if (validation.available === false) return <X className="w-4 h-4 text-error" />;
    return null;
  };

  const validationsStep1Passed = () =>{
    return(
      usernameValidation.messageType === 'success' &&
      emailValidation.messageType === 'success' 
    );
  }

  const validationsStep2Passed = () =>{
    return(
      dniValidation.messageType === 'success' 
      //phoneValidation.messageType === 'success' 
    );
  }

  // Maneja el siguiente paso
  const handleNext = async () => {
    setError(null)

    //Comprobamos que no hayan errores en las validaciones de los datos unicos del
    // usuario en el paso 1
    if(!validationsStep1Passed()){
      return
    }

    setStep(2)
  }

  const handlePrev = () => {
    setError(null)          // limpia errores globales
    setStep(1)              // vuelve al paso anterior
  }

  // Maneja el envío final
  const handleSubmit = async (data: RegisterStep2Data) => {
    setLoading(true)
    setError(null)

    //Comprobamos que no hayan errores en las validaciones de los datos unicos del
    // usuario en el paso 2 
    if(!validationsStep2Passed()){
      return
    }

    try {
      // Combinar datos de ambos pasos
      const step1Data = step1Form.getValues()
      const completeData: RegisterData = {
        ...step1Data,
        ...data,
        birthDate: formatDate(data.birthDate)
      }
      
      // Ejecutar reCAPTCHA
      if (!executeRecaptcha) {
        setError('reCAPTCHA no está disponible')
        return
      }

      //Obtener el token de recaptcha, pasando el action signup, para saber que estamos haciendo
      const gRecaptchaToken = await executeRecaptcha('signup')

      if (!gRecaptchaToken) {
        setError('Error al validar reCAPTCHA')
        return
      }

      const response = await registerUser({...completeData, recaptchaToken: gRecaptchaToken})

      if (response.state !== "OK") {
        setError(response.messages?.[0] || "Error al registrar usuario")
        return
      }

      router.push(`/email-verify?email=${completeData.email}`)
    } catch {
      setError('Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

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
  
  
  return (
    <div className="flex flex-col gap-4 md:py-6 w-full">
      <div className="flex flex-col items-center text-center mb-2">
        <h1 className="font-outfit text-lg font-semibold">Crear una cuenta</h1>
        {step === 1 && (
          <p className="font-inter font-regular text-sm">
            Registrate con tu email, nombre de usuario y contraseña
          </p>
        )}
        {step === 2 && (
          <p className="font-inter font-regular text-sm">
            Completá tus datos personales para finalizar el registro
          </p>
        )}
      </div>

      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleNext)} className="flex flex-col gap-4">
          {error && <Alert message={error} />}
          <div>
            <Input
              label="Nombre de usuario"
              type="text"
              {...step1Form.register('username')}
              error={step1Form.formState.errors.username?.message}
              rightIcon={!step1Form.formState.errors.username?.message ? getRightIcon(usernameValidation): undefined}
              className="font-outfit"
            />
            {(usernameValidation.message && !step1Form.formState.errors.username?.message) && (
              <p className={`text-xs font-inter mt-1 ${
                usernameValidation.messageType === 'success' ? 'text-success' : 'text-error'
              }`}>
                {usernameValidation.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Correo electrónico"
              type="email"
              {...step1Form.register('email')}
              error={step1Form.formState.errors.email?.message}
              rightIcon={!step1Form.formState.errors.email?.message ? getRightIcon(emailValidation): undefined}
              className="font-outfit"
            />

            {(emailValidation.message && !step1Form.formState.errors.email?.message) && (
              <p className={`text-xs font-inter mt-1 ${
                emailValidation.messageType === 'success' ? 'text-success' : 'text-error'
              }`}>
                {emailValidation.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Contraseña"
              type="password"
              {...step1Form.register('password')}
              error={step1Form.formState.errors.password?.message}
              
            />
          </div>

          <div>
            <Input
              label="Confirmar contraseña"
              type="password"
              {...step1Form.register('confirmPassword')}
              error={step1Form.formState.errors.confirmPassword?.message}
              
            />
          </div>

          

          <Button variant="primary" type="submit" className="w-full">
            Continuar
          </Button>
          
          <p className="flex justify-start items-center text-sm font-inter gap-1">
            ¿Ya tenes cuenta?
            <Link href="/login" className="hover:underline cursor-pointer font-medium">
              Iniciar sesión
            </Link>
          </p>
         

          <div className="flex items-center gap-2 text-gray-4/50">
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
      )}

      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          {error && <Alert message={error} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Nombre"
                type="text"
                {...step2Form.register('name')}
                error={step2Form.formState.errors.name?.message}
              />
            </div>
            <div>
              <Input
                label="Apellido"
                type="text"
                {...step2Form.register('lastname')}
                error={step2Form.formState.errors.lastname?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <Input
                label="DNI"
                type="text"
                {...step2Form.register('dni')}
                error={step2Form.formState.errors.dni?.message}
                rightIcon={!step2Form.formState.errors.dni?.message ?getRightIcon(dniValidation):undefined}
              />
              {(dniValidation.message && !step2Form.formState.errors.dni?.message) && (
                <p className={`text-xs font-inter mt-1 ${
                  dniValidation.messageType === 'success' ? 'text-success' : 'text-error'
                }`}>
                  {dniValidation.message}
                </p>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <Input
              label="Fecha de Nacimiento"
              type="date"
              autoComplete="birthDate"
              {...step2Form.register('birthDate')}
              error={step2Form.formState.errors.birthDate?.message}
            />

          </div>

          <div className="">
            <Input
              label="Teléfono"
              type="tel"
              {...step2Form.register('phone')}
              error={step2Form.formState.errors.phone?.message}
              rightIcon={!step2Form.formState.errors.phone?.message ?getRightIcon(phoneValidation):undefined}
            />
            {(phoneValidation.message && !step2Form.formState.errors.phone?.message) && (
              <p className={`text-xs font-inter mt-1 ${
                phoneValidation.messageType === 'success' ? 'text-success' : 'text-error'
              }`}>
                {phoneValidation.message}
              </p>
            )}
          </div>
          

          <div>
            <label
              htmlFor="gender"
              className="block mb-1 font-medium text-sm font-outfit"
            >
              Género
            </label>

            <Select
              onValueChange={(value) =>
                step2Form.setValue("gender", value as "MALE" | "FEMALE" | "UNSPECIFIED")
              }
              defaultValue={step2Form.getValues("gender")}
            >
              <SelectTrigger
                id="gender"
                className={`w-full font-outfit dark:bg-dark-5 ${
                  step2Form.formState.errors.gender ? "border-error" : ""
                }`}
              >
                <SelectValue placeholder="Seleccioná un género" />
              </SelectTrigger>

              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {step2Form.formState.errors.gender && (
              <p className="text-error text-xs mt-1">
                {step2Form.formState.errors.gender.message}
              </p>
            )}
          </div>


          <div className="flex gap-4 mt-4">
            <Button type="button" variant="outline" className="w-full" onClick={handlePrev}>
              Atrás
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || step2Form.formState.isSubmitting}
            >
              {loading ? <Spinner size={20} /> : 'Registrarse'}
            </Button>
          </div>
        </form>
      )}

    </div>
  )
}