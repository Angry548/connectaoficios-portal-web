import { Dialog } from '@mui/material'

export default function AdminDialog({ sx, ...props }) {
  return <Dialog {...props} sx={[{
    '& .MuiDialog-paper': { borderRadius: 3, m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)' },
    '& .MuiDialogTitle-root': { p: { xs: 2, sm: 3 }, fontSize: 20, fontWeight: 800, color: 'text.primary', borderBottom: '1px solid #EAECF0' },
    '& .MuiDialogContent-root': { p: { xs: 2, sm: 3 }, borderTop: 0, overflowWrap: 'anywhere' },
    '& .MuiDialogTitle-root + .MuiDialogContent-root': { pt: { xs: 2, sm: 3 } },
    '& .MuiDialogActions-root': { p: { xs: 2, sm: 2.5 }, gap: 1, flexWrap: 'wrap', borderTop: '1px solid #EAECF0', bgcolor: '#F9FAFB' },
    '& .MuiDialogActions-root .MuiButton-root': { textTransform: 'none', fontWeight: 700, borderRadius: 2, minHeight: 40, boxShadow: 'none', m: 0 },
  }, ...(Array.isArray(sx) ? sx : [sx])]} />
}
