import type { LinkPage, LinkPageLink } from '@/services/db'

export type { LinkPage, LinkPageLink }

export interface LinkPageFormValues {
  username: string
  displayName: string
  role: string
  bio: string
  phone: string
  email: string
  city: string
  website: string
  accentColor: string
  theme: 'dark' | 'light'
  showLinks: boolean
  layout: 'vertical' | 'horizontal'
}

export interface LinkFormValues {
  label: string
  url: string
}

export const ACCENT_COLORS = [
  { label: 'Azul',    value: '#3B8CE8' },
  { label: 'Roxo',   value: '#7F77DD' },
  { label: 'Verde',  value: '#1D9E75' },
  { label: 'Coral',  value: '#D85A30' },
  { label: 'Rosa',   value: '#D4537E' },
  { label: 'Âmbar',  value: '#BA7517' },
]
