import UserAvatar from './UserAvatar'
import useUserAvatars from '../hooks/useUserAvatars'
import { useEffect, useState } from 'react'
import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material'
import getApiErrorMessage from '../utils/getApiErrorMessage'

const idOf = (option) => option?.id ?? option?.Id

export default function EntityAutocomplete({ label, value, onChange, loadOptions, getName, getSecondary, minLength = 2, disabled, personRole }) {
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState({ options: [], loading: false, error: '' })
  const query = input.trim()
  useEffect(() => {
    let active = true
    if (query.length < minLength) return undefined
    const timer = window.setTimeout(async () => {
      setResult({ options: [], loading: true, error: '' })
      try {
        const options = await loadOptions(query)
        if (active) setResult({ options, loading: false, error: '' })
      } catch (error) {
        if (active) setResult({ options: [], loading: false, error: getApiErrorMessage(error) })
      }
    }, 350)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query, minLength, loadOptions])
  const avatars = useUserAvatars(personRole ? result.options.map((u) => ({ ...u, rol: personRole })) : [])
  const enough = query.length >= minLength
  return <Autocomplete
    options={enough ? result.options : []}
    value={value !== '' && value != null && String(idOf(selected)) === String(value) ? selected : null}
    inputValue={input}
    onInputChange={(_, text) => setInput(text)}
    onChange={(_, option) => { setSelected(option); onChange(option ? idOf(option) : '') }}
    getOptionLabel={(option) => getName(option) || `#${idOf(option)}`}
    getOptionKey={(option) => idOf(option)}
    isOptionEqualToValue={(option, current) => String(idOf(option)) === String(idOf(current))}
    filterOptions={(options) => options}
    disabled={disabled}
    loading={enough && result.loading}
    loadingText="Buscando…"
    noOptionsText={enough ? 'No se encontraron resultados.' : `Escriba al menos ${minLength} caracteres.`}
    renderOption={(props, option) => {
      const { key, ...rest } = props
      return <Box component="li" key={key} {...rest} sx={{ gap: 1.5 }}>{personRole && <UserAvatar nombre={getName(option)} fotoUrl={avatars.fotoDe({ ...option, rol: personRole })} />}<Box><Typography fontWeight={600}>{getName(option)}</Typography>{getSecondary?.(option) && <Typography variant="caption" color="text.secondary">{getSecondary(option)}</Typography>}</Box></Box>
    }}
    renderInput={(params) => <TextField {...params} label={label} error={enough && Boolean(result.error)} helperText={enough && result.error ? result.error : minLength ? `Busque por nombre (mínimo ${minLength} caracteres).` : 'Busque o seleccione una opción.'} slotProps={{ ...params.slotProps, input: { ...params.slotProps.input, endAdornment: <>{enough && result.loading && <CircularProgress size={18} aria-label="Buscando opciones" />}{params.slotProps.input.endAdornment}</> } }} />}
  />
}
