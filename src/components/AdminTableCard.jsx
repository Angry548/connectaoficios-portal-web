import { Paper } from '@mui/material'

export default function AdminTableCard({ sx, ...props }) {
  return <Paper {...props} elevation={0} sx={[{ border: '1px solid #EAECF0', borderRadius: 3, overflow: 'hidden', '& .MuiTableHead-root': { bgcolor: '#F9FAFB' }, '& .MuiTableHead-root .MuiTableCell-root': { color: '#667085', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }, '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #EAECF0', fontSize: 14 }, '& .MuiChip-root': { fontWeight: 700 }, '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', rowGap: 1, py: 1 } }, ...(Array.isArray(sx) ? sx : [sx])]} />
}
