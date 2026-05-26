import { z } from 'zod';

export const driverSchema = z.object({
  licenseClassId: z.number().min(1, "Selecciona una clase de licencia"),

  licenseExpirationDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'La fecha de vencimiento no es válida',
    })
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today;
    }, {
      message: 'No puede ser una fecha pasada.',
    }),


  addressStreet: z
    .string()
    .min(1, { message: "La calle es obligatoria" })
    .max(100, { message: "La calle no puede superar los 100 caracteres" }),

  addressNumber: z
    .string()
    .regex(/^\d+$/, {
      message: "La altura debe contener solo números",
    }),
 
  cityId: z
    .number({
      required_error: "La ciudad es obligatoria",
      invalid_type_error: "La ciudad debe ser válida",
    })
    .min(1, { message: "Seleccioná una ciudad" }),

  
  frontImage: z
    .instanceof(File, { message: "La imagen frontal es obligatoria" }),

  backImage: z
    .instanceof(File, { message: "La imagen trasera es obligatoria" }),
});

export type DriverData = z.infer<typeof driverSchema>;