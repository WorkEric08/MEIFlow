import { z } from 'zod'

export const linkPageSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  displayName: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  role: z.string().max(60, 'Máximo 60 caracteres').optional(),
  bio: z.string().max(160, 'Máximo 160 caracteres').optional(),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  city: z.string().max(50, 'Máximo 50 caracteres').optional(),
  website: z.string().url('URL inválida').or(z.literal('')).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  theme: z.enum(['dark', 'light']),
  showLinks: z.boolean(),
  layout: z.enum(['vertical', 'horizontal']),
})

export const linkSchema = z.object({
  label: z.string().min(1, 'Informe o nome do link').max(40, 'Máximo 40 caracteres'),
  url: z
    .string()
    .min(1, 'Informe a URL')
    .refine(
      (v) => {
        try {
          new URL(v.startsWith('http') ? v : `https://${v}`)
          return true
        } catch {
          return false
        }
      },
      { message: 'URL inválida' }
    ),
})
