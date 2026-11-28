import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './note-map.css'
import type { NoteTracking } from '../../types'

interface NoteMapProps {
  tracking: NoteTracking
  characterIcon: string | null
}

const NOTE_LAYER_FLAG = '_isNoteLayer'

export function NoteMap({ tracking, characterIcon }: NoteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    map.eachLayer((layer) => {
      if ((layer as unknown as Record<string, boolean>)[NOTE_LAYER_FLAG]) {
        map.removeLayer(layer)
      }
    })

    const origin = L.latLng(tracking.originLatitude, tracking.originLongitude)
    const destination = L.latLng(tracking.destinationLatitude, tracking.destinationLongitude)
    const bounds = L.latLngBounds([origin, destination])

    const mark = (layer: L.Layer) => {
      ;(layer as unknown as Record<string, boolean>)[NOTE_LAYER_FLAG] = true
      layer.addTo(map)
    }

    mark(L.circleMarker(origin, { radius: 6, color: '#9ca3af', fillColor: '#9ca3af', fillOpacity: 1, weight: 2 }))
    mark(L.circleMarker(destination, { radius: 6, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }))
    mark(L.polyline([origin, destination], { color: '#d1d5db', weight: 2, dashArray: '4 6' }))

    if (tracking.currentLatitude != null && tracking.currentLongitude != null) {
      const current = L.latLng(tracking.currentLatitude, tracking.currentLongitude)
      bounds.extend(current)

      const icon = characterIcon
        ? L.icon({ iconUrl: characterIcon, iconSize: [36, 36], className: 'note-map-character-icon' })
        : L.divIcon({ className: 'note-map-default-marker', html: '<span></span>', iconSize: [18, 18] })

      mark(L.marker(current, { icon }))
    }

    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 })
  }, [tracking, characterIcon])

  return <div ref={containerRef} className="h-56 w-full overflow-hidden rounded-xl" />
}
