import { z } from 'zod'

export const projectSchema = z.object({
  clientId:    z.string().min(1, 'Selecione um cliente'),
  name:        z.string().min(2, 'Mínimo 2 caracteres').max(100),
  description: z.string().max(300).optional(),
  value:       z.coerce.number().min(0, 'Valor inválido'),
  status:      z.enum(['active', 'completed', 'paused', 'cancelled']),
  startDate:   z.string().min(1, 'Informe a data de início'),
  endDate:     z.string().optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
