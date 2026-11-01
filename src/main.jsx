import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D9488',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828',
      secondary: '#667085',
    },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 } } },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: '#F9FAFB', color: '#667085', fontWeight: 700 }, body: { fontSize: 14, borderColor: '#EAECF0' } } },
    MuiTablePagination: { defaultProps: { labelRowsPerPage: 'Filas por página', labelDisplayedRows: ({ from, to, count }) => from + '–' + to + ' de ' + count, getItemAriaLabel: (type) => ({ first: 'Primera página', last: 'Última página', next: 'Página siguiente', previous: 'Página anterior' })[type] }, styleOverrides: { toolbar: { flexWrap: 'wrap', rowGap: 8 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
  shape: {
    borderRadius: 10,
  },
})

createRoot(
  document.getElementById('root'),
).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)