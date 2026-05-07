'use client'

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Check, X } from "lucide-react"
import { CompleteRegistrationData, completeRegistrationSchema } from "../schemas/completeRegistrationSchema"
import { useFieldValidator } from "@/shared/hooks/useFieldValidator"
import Spinner from "@/components/ux/Spinner"
import { completeRegistration } from "@/services/auth/authService"
import { Input } from "@/components/ux/Input"
import { Button } from "@/components/ux/Button"
import { GENDERS } from "@/constants/genders"
import { Alert } from "@/components/ux/Alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";

interface CompleteRegistrationFormProps {
  email: string
}

export function CompleteRegistrationForm({email}:CompleteRegistrationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {accessToken, refreshToken} = useAuth()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid  },
    watch, 
    trigger
  } = useForm<CompleteRegistrationData>({
    resolver: zodResolver(completeRegistrationSchema),
    mode: 'onChange',
    defaultValues:{
      username:'',
      name:'',
      lastname:'',
      dni:'',
      phone:'',
      gender:undefined,
      birthDate:'',
      password:'',
      confirmPassword:''
    }
  })

  const usernameValidation = useFieldValidator('username')
  const dniValidation = useFieldValidator('dni');
  const phoneValidation = useFieldValidator('phone')

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "username" && value.username) {
        trigger("username").then((isValid) => {
          if (isValid) usernameValidation.validate(value.username!);
        });
      } else if (name === "dni" && value.dni) {
        trigger("dni").then((isValid) => {
          if (isValid) dniValidation.validate(value.dni!);
        });
      } else if (name === "phone" && value.phone) {
        trigger("phone").then((isValid) => {
          if (isValid) phoneValidation.validate(value.phone!);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, usernameValidation, dniValidation, phoneValidation]);   
    
  const getRightIcon = (validation: ReturnType<typeof useFieldValidator>) => {
    if (validation.checking) return <Spinner size={16} />;
    if (validation.available === true) return <Check className="w-4 h-4 text-success" />;
    if (validation.available === false) return <X className="w-4 h-4 text-error" />;
    return null;
  };

  //Metodo para determinar si pasan todas las validaciones
  const allValidationsPassed = () =>{
    return(
      usernameValidation.messageType === 'success' &&
      dniValidation.messageType === 'success' &&
      phoneValidation.messageType === 'success'
    );
  }

  const formatDate = (date: string) => {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const onSubmit = async (data: CompleteRegistrationData) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...data,
        gender: data.gender || "UNSPECIFIED",   
        birthDate: formatDate(data.birthDate),
      }
      await completeRegistration(email, payload, accessToken ?? '', refreshToken ?? '')
      router.push(`/email-verify?email=${email}`)
    } catch {
      setError('Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {error && <Alert message={error} />}
        {/* Nombre de usuario solo */}
        <div>        
          <Input
            label="Nombre de usuario"
            type="text"
            {...register("username")}
            error={errors.username?.message}
            rightIcon={!errors.username?.message ? getRightIcon(usernameValidation): undefined}

          />
          {(usernameValidation.message && !errors.username?.message) && (
            <p className={`text-xs font-inter mt-1 ${
              usernameValidation.messageType === 'success' ? 'text-success' : 'text-error'
            }`}>
              {usernameValidation.message}
            </p>
          )}
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            type="text"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Apellido"
            type="text"
            {...register("lastname")}
            error={errors.lastname?.message}
          />
        </div>

        {/* DNI y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="DNI"
              type="text"
              {...register("dni")}
              error={errors.dni?.message}
              rightIcon={!errors.dni?.message ?getRightIcon(dniValidation):undefined}
            />
            {(dniValidation.message && !errors.dni?.message) && (
              <p className={`text-xs font-inter mt-1 ${
                dniValidation.messageType === 'success' ? 'text-success' : 'text-error'
              }`}>
                {dniValidation.message}
              </p>
            )}
          </div>
          <div>          
            <Input
              label="Teléfono"
              type="tel"
              {...register("phone")}
              error={errors.phone?.message}
              rightIcon={!errors.phone?.message ?getRightIcon(phoneValidation):undefined}
            />
            {(phoneValidation.message && !errors.phone?.message) && (
              <p className={`text-xs font-inter mt-1 ${
                phoneValidation.messageType === 'success' ? 'text-success' : 'text-error'
              }`}>
                {phoneValidation.message}
              </p>
            )}
          </div>
        </div>

        {/* Genero y Fecha de nacimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label
              htmlFor="gender"
              className="block mb-1 font-medium text-sm font-outfit"
            >
              Género
            </label>

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="gender"
                    className={`w-full font-outfit dark:bg-dark-5 ${
                      errors.gender ? "border-error" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccioná un género" />
                  </SelectTrigger>

                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem
                        key={gender.value}
                        value={gender.value}
                      >
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.gender && (
              <p className="text-error text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <Input
            label="Fecha de Nacimiento"
            type="date"
            autoComplete="birthDate"
            {...register('birthDate')}
            error={errors.birthDate?.message}
          />
            
        </div>


        {/* Contraseña y Confirmar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contraseña"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-full mt-4" 
          disabled={loading || isSubmitting || !allValidationsPassed() || !isValid}>
          {loading ?                             
            <div className="flex items-center justify-center gap-2">
              <Spinner size={20} />
                <span>Cargando...</span>
            </div> 
          : 
            "Registrarse"
          }
        </Button>

      </form>
    </div>
  )
}