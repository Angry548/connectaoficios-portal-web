import { Alert, Box, Tab, Tabs } from '@mui/material'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminPageHeader from '../../components/AdminPageHeader'

export default function PromotionsPage() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  if (!['Administrador', 'AdministradorPrincipal'].includes(usuario?.rol)) {
    return <Alert severity="error">No tiene permisos para acceder a Promociones.</Alert>
  }
  if (pathname === '/promociones' || pathname === '/promociones/') return <Navigate to="/promociones/planes" replace />
  const tab = pathname.replace(/\/$/, '')
  return <Box>
    <AdminPageHeader title="Promociones" description="Gestione el catálogo de planes y consulte las promociones contratadas." />
    <Tabs value={tab} variant="scrollable" sx={{ mb: 3 }}>
      <Tab component={Link} to="/promociones/planes" value="/promociones/planes" label="Planes de Promoción" />
      <Tab component={Link} to="/promociones/contratadas" value="/promociones/contratadas" label="Promociones Contratadas" />
    </Tabs>
    <Outlet />
  </Box>
}
