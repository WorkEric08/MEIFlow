import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  name: string
  email: string
  company: string
}

interface ProfileStore {
  profile: Profile
  setProfile: (p: Partial<Profile>) => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: { name: '', email: '', company: '' },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    { name: 'meiflow-profile' }
  )
)
