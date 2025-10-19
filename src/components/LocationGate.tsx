import { useEffect, useState } from 'react'

type Coords = { lat: number; lng: number }

interface Props {
  onReady?: (coords: Coords) => void
}

const LocationGate = ({ onReady }: Props) => {
  const [status, setStatus] = useState<'idle'|'asking'|'granted'|'denied'|'error'>('idle')
  const [coords, setCoords] = useState<Coords | null>(null)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setMsg('Seu navegador não suporta geolocalização.')
    } else if (!window.isSecureContext && location.hostname !== 'localhost') {
      setStatus('error')
      setMsg('A permissão de localização exige HTTPS ou localhost. Use https:// ou rode com "npm run dev:https".')
    }
  }, [])

  function requestOnce() {
    if (!('geolocation' in navigator)) return
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      try {
        const httpsUrl = location.href.replace('http://', 'https://')
        // tenta recarregar com https para disparar o prompt padrão
        window.location.href = httpsUrl
      } catch (e) {
        console.warn('Redirect to HTTPS failed', e)
      }
      return
    }
    setStatus('asking')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        setStatus('granted')
        try { localStorage.setItem('resi_coords', JSON.stringify(c)) } catch (e) { /* ignore storage errors */ }
        onReady?.(c)
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error')
        setMsg(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="grid gap-2">
      {status !== 'granted' && (
        <button onClick={requestOnce} className="px-3 py-2 rounded-md border bg-card hover:bg-muted">
          📍 Ativar localização
        </button>
      )}
      {status === 'granted' && coords && (
        <div className="text-xs text-muted-foreground">Lat: {coords.lat.toFixed(5)} · Lng: {coords.lng.toFixed(5)}</div>
      )}
      {(status === 'denied' || status === 'error') && (
        <small className="text-xs text-muted-foreground">{msg}</small>
      )}
    </div>
  )
}

export default LocationGate
