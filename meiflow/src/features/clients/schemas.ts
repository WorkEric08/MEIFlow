import { z } from 'zod'

export const clientSchema = z.object({
  name:    z.string().min(2, 'Mínimo 2 caracteres').max(80),
  email:   z.string().email('E-mail inválido'),
  phone:   z.string().max(20).optional(),
  company: z.string().max(80).optional(),
  notes:   z.string().max(300).optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
