// schemas/registerVehicleSchema.ts
import { z } from 'zod'

//Paso 1:
export const registerVehicleStep1Schema = z.object({
  vehicleTypeId: z.number().min(1, "Selecciona un tipo de vehículo"),
});

// Paso 2: Datos básicos del vehículo
export const registerVehicleStep2Schema = z.object({
  domain: z
  .string()
  .refine(
    (v) => !v.includes('-'),
    'La patente no debe contener guiones.'
  )
  .transform((v) =>
    v
      .toUpperCase()
      .replace(/\s+/g, '')
  )
  .refine(
    (v) =>
      /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/.test(v),
    'La patente no tiene un formato válido.'
  ),

  
      
  brand: z
    .string()
    .min(1, 'La marca del vehículo no puede estar en blanco.')
    .regex(/^[a-zA-Z0-9 ]+$/, 'La marca debe contener solo letras, números y espacios'),
  
  model: z
    .string()
    .min(1, 'El modelo del vehículo no puede estar en blanco.')
    .regex(/^[a-zA-Z0-9 ]+$/, 'El modelo debe contener solo letras, números y espacios'),
  
  year: z
    .number({
      required_error: 'El año del vehículo no puede estar en blanco.',
      invalid_type_error: 'El año debe ser un número válido'
    })
    .min(1900, 'El año debe ser posterior a 1900.')
    .max(new Date().getFullYear(), 'El año no puede estar en el futuro'),

  color: z
    .string()
    .min(1, 'El color del vehículo no puede estar en blanco.')
    .regex(
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
      'El color debe ser un código hexadecimal válido.'
    ),

  availableSeats: z
  .number({
    required_error: 'La cantidad de asientos disponibles no puede estar en blanco.',
    invalid_type_error: 'Debe ingresar un número válido.'
  })
  .min(2, 'La cantidad de asientos disponibles debe ser al menos 2.')
  .max(40, 'La cantidad de asientos no puede ser mayor a 40')
})



// Esquema completo (por si quieres validar todo en un solo paso)
export const completeRegisterVehicleSchema = registerVehicleStep1Schema
  .merge (registerVehicleStep2Schema)

// Tipos TypeScript generados
export type RegisterVehicleStep1Data = z.infer<typeof registerVehicleStep1Schema>;
export type RegisterVehicleStep2Data = z.infer<typeof registerVehicleStep2Schema>;
export type CompleteRegisterVehicleData = z.infer<typeof completeRegisterVehicleSchema>;
