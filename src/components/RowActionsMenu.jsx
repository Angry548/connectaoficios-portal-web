import { useId, useState } from 'react'
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material'
import SingleRowAction from './SingleRowAction'
import { BlockOutlined, CheckCircleOutlined, DeleteOutlineOutlined, EditOutlined, MoreVertOutlined, StopCircleOutlined, VisibilityOutlined } from '@mui/icons-material'

function actionIcon(action) {
  if (action.icon) return action.icon
  if (action.destructive) return <DeleteOutlineOutlined fontSize="small" />
  if (action.label === 'Editar') return <EditOutlined fontSize="small" />
  if (action.label === 'Activar') return <CheckCircleOutlined fontSize="small" />
  if (action.label === 'Desactivar') return <BlockOutlined fontSize="small" />
  if (action.label === 'Finalizar') return <StopCircleOutlined fontSize="small" />
  return <VisibilityOutlined fontSize="small" />
}

export default function RowActionsMenu({ actions, disabled = false, label = 'Acciones' }) {
  const [anchor, setAnchor] = useState(null)
  const id = useId()
  const visible = actions.filter((action) => action && action.visible !== false)
  if (!visible.length) return null
  const execute = (action) => {
    setAnchor(null)
    action.onClick()
  }
  if (visible.length === 1) {
    const action = visible[0]
    return <SingleRowAction label={action.label} icon={actionIcon(action)} disabled={disabled || action.disabled} destructive={action.destructive} onClick={() => execute(action)} />
  }
  const open = Boolean(anchor)
  return <>
    <Tooltip title={label}><span><IconButton aria-label={label} aria-haspopup="menu" aria-controls={open ? id : undefined} aria-expanded={open ? 'true' : undefined} disabled={disabled} onClick={(event) => setAnchor(event.currentTarget)}><MoreVertOutlined /></IconButton></span></Tooltip>
    <Menu id={id} anchorEl={anchor} open={open} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2, border: '1px solid #EAECF0', mt: 0.5 } }, list: { 'aria-label': label, sx: { py: 0.5, '& .MuiMenuItem-root': { minHeight: 42, px: 2, gap: 0.5 } } } }}>
      {visible.map((action) => <MenuItem key={action.label} disabled={disabled || action.disabled} onClick={() => execute(action)} sx={action.destructive ? { color: 'error.main' } : undefined}>
        <ListItemIcon sx={{ color: 'inherit' }}>{actionIcon(action)}</ListItemIcon>{action.label}
      </MenuItem>)}
    </Menu>
  </>
}
