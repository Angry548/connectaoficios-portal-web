import { Box } from '@mui/material'
import logo from '../assets/brand/logo.svg'
import symbol from '../assets/brand/symbol.svg'
export default function BrandLogo({ compact = false, width = 210 }) {
 return <Box component="img" src={compact ? symbol : logo} alt="ConnectaOficios" sx={{ width: compact ? 42 : width, maxWidth: '100%', height: compact ? 42 : 'auto', objectFit: 'contain', display: 'block' }} />
}
