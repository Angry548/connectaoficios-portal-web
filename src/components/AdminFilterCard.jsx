import { Paper } from '@mui/material'

export default function AdminFilterCard({ sx, ...props }) {
  return <Paper {...props} elevation={0} sx={[{ border: '1px solid #EAECF0', borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3, '& .MuiButton-root': { textTransform: 'none', fontWeight: 700, minHeight: 40 }, '& form > .MuiBox-root:last-child': { flexWrap: 'wrap' } }, ...(Array.isArray(sx) ? sx : [sx])]} />
}
