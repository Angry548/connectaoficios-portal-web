import { Box, Typography } from '@mui/material'

export default function AdminPageHeader({ title, description, icon, iconSx, actions }) {
  return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h1" sx={{ fontSize: { xs: 25, sm: 30 }, fontWeight: 800, color: 'text.primary' }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, mt: 0.7 }}>{description}</Typography>
    </Box>
    {(actions || icon) && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
      {actions}
      {icon && <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#F0FDFA', color: 'primary.main', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...iconSx }}>{icon}</Box>}
    </Box>}
  </Box>
}
