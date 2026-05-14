import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from '@/components/AppShell'
import LoadingScreen from '@/components/LoadingScreen'

const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const ClientsPage    = lazy(() => import('@/pages/ClientsPage'))
const ProjectsPage   = lazy(() => import('@/pages/ProjectsPage'))
const PaymentsPage   = lazy(() => import('@/pages/PaymentsPage'))
const ContractsPage  = lazy(() => import('@/pages/ContractsPage'))
const LinkPageEditor = lazy(() => import('@/pages/LinkPageEditor'))
const LinkPagePublic  = lazy(() => import('@/pages/LinkPagePublic'))
const ContractPublic  = lazy(() => import('@/pages/ContractPublic'))
const SettingsPage    = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage   = lazy(() => import('@/pages/NotFoundPage'))

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,          element: <Wrap><DashboardPage /></Wrap> },
      { path: 'clients',      element: <Wrap><ClientsPage /></Wrap> },
      { path: 'projects',     element: <Wrap><ProjectsPage /></Wrap> },
      { path: 'payments',     element: <Wrap><PaymentsPage /></Wrap> },
      { path: 'contracts',    element: <Wrap><ContractsPage /></Wrap> },
      { path: 'link-page',    element: <Wrap><LinkPageEditor /></Wrap> },
      { path: 'settings',     element: <Wrap><SettingsPage /></Wrap> },
    ],
  },
  // Rota pública de aceite de contrato — deve vir ANTES de /:username
  // para evitar que "contract" seja interpretado como username
  {
    path: '/contract/:slug',
    element: <Wrap><ContractPublic /></Wrap>,
  },
  // Rota pública da Link Page — fora do AppShell
  {
    path: '/:username',
    element: <Wrap><LinkPagePublic /></Wrap>,
  },
  {
    path: '*',
    element: <Wrap><NotFoundPage /></Wrap>,
  },
])
