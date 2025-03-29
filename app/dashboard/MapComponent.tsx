"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Home, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Mock patient location data
const INITIAL_LOCATION = {
  lat: 40.7128,
  lng: -74.006,
  timestamp: new Date().toISOString(),
}

const BASE_LOCATION = {
  lat: 40.7138,
  lng: -74.0065,
}

// Calculate distance between two points in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

interface MapComponentProps {
  onLocationUpdate?: (location: { lat: number; lng: number; distance: number }) => void
  safeRadius?: number
}

export default function MapComponent({ onLocationUpdate, safeRadius = 500 }: MapComponentProps) {
  const [patientLocation, setPatientLocation] = useState(INITIAL_LOCATION)
  const [currentDistance, setCurrentDistance] = useState(320)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [showBaseLocation, setShowBaseLocation] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const patientMarkerRef = useRef<L.Marker | null>(null)
  const baseMarkerRef = useRef<L.Marker | null>(null)
  const safeZoneCircleRef = useRef<L.Circle | null>(null)

  // Custom icons for markers
  const createPatientIcon = () => {
    return L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute -top-4 -left-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
  }

  const createHomeIcon = () => {
    return L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>
      `,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      // Fix Leaflet icon paths issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Create map instance
      const map = L.map(mapRef.current).setView([patientLocation.lat, patientLocation.lng], 15)

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add patient marker
      const patientIcon = createPatientIcon()
      const patientMarker = L.marker([patientLocation.lat, patientLocation.lng], { icon: patientIcon })
        .addTo(map)
        .bindPopup("Patient Location")

      // Add base location marker if enabled
      if (showBaseLocation) {
        const homeIcon = createHomeIcon()
        const baseMarker = L.marker([BASE_LOCATION.lat, BASE_LOCATION.lng], { icon: homeIcon })
          .addTo(map)
          .bindPopup("Base Location")

        // Add safe zone circle
        const safeZoneCircle = L.circle([BASE_LOCATION.lat, BASE_LOCATION.lng], {
          radius: safeRadius,
          color: "rgba(34, 197, 94, 0.5)",
          fillColor: "rgba(34, 197, 94, 0.1)",
          fillOpacity: 0.3,
        }).addTo(map)

        baseMarkerRef.current = baseMarker
        safeZoneCircleRef.current = safeZoneCircle
      }

      patientMarkerRef.current = patientMarker
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        patientMarkerRef.current = null
        baseMarkerRef.current = null
        safeZoneCircleRef.current = null
      }
    }
  }, [])

  // Update map when showBaseLocation changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (showBaseLocation) {
        if (!baseMarkerRef.current) {
          const homeIcon = createHomeIcon()
          const baseMarker = L.marker([BASE_LOCATION.lat, BASE_LOCATION.lng], { icon: homeIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup("Base Location")
          baseMarkerRef.current = baseMarker
        }

        if (!safeZoneCircleRef.current) {
          const safeZoneCircle = L.circle([BASE_LOCATION.lat, BASE_LOCATION.lng], {
            radius: safeRadius,
            color: "rgba(34, 197, 94, 0.5)",
            fillColor: "rgba(34, 197, 94, 0.1)",
            fillOpacity: 0.3,
          }).addTo(mapInstanceRef.current)
          safeZoneCircleRef.current = safeZoneCircle
        }
      } else {
        if (baseMarkerRef.current) {
          baseMarkerRef.current.remove()
          baseMarkerRef.current = null
        }

        if (safeZoneCircleRef.current) {
          safeZoneCircleRef.current.remove()
          safeZoneCircleRef.current = null
        }
      }
    }
  }, [showBaseLocation, safeRadius])

  // Update patient location periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate patient movement
      const newLat = patientLocation.lat + (Math.random() - 0.5) * 0.001
      const newLng = patientLocation.lng + (Math.random() - 0.5) * 0.001
      const newLocation = {
        lat: newLat,
        lng: newLng,
        timestamp: new Date().toISOString(),
      }

      setPatientLocation(newLocation)
      setLastUpdated(new Date())

      // Calculate distance from base
      const distance = calculateDistance(newLocation.lat, newLocation.lng, BASE_LOCATION.lat, BASE_LOCATION.lng)
      setCurrentDistance(Math.round(distance))

      // Update marker position
      if (patientMarkerRef.current) {
        patientMarkerRef.current.setLatLng([newLocation.lat, newLocation.lng])
      }

      // Notify parent component
      if (onLocationUpdate) {
        onLocationUpdate({
          lat: newLocation.lat,
          lng: newLocation.lng,
          distance,
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [patientLocation, onLocationUpdate])

  const centerOnPatient = () => {
    if (mapInstanceRef.current && patientMarkerRef.current) {
      mapInstanceRef.current.setView(patientMarkerRef.current.getLatLng(), 15)
    }
  }

  const toggleBaseLocation = () => {
    setShowBaseLocation(!showBaseLocation)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden"></div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Distance from base: {currentDistance}m</span>
          <Badge variant="outline">Safe radius: {safeRadius}m</Badge>
        </div>
      </div>
      <div className="mt-2 flex justify-center space-x-2">
        <Button variant="outline" size="sm" onClick={toggleBaseLocation}>
          <Home className="mr-2 h-4 w-4" />
          {showBaseLocation ? "Hide Base Location" : "Show Base Location"}
        </Button>
        <Button variant="outline" size="sm" onClick={centerOnPatient}>
          <MapPin className="mr-2 h-4 w-4" />
          Center on Patient
        </Button>
      </div>
    </div>
  )
}

