import { useState, useEffect, useRef, FC, useCallback } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { useTargetTimes, TargetTime } from './hooks/useTargetTimes'
import { Box } from '@chakra-ui/react'
import { TargetTimeSlider } from './components/TargetTimeSlider'
import { GpsButton } from './components/GpsButton'
import { RefreshButton } from './components/RefreshButton'
import { CompassButton } from './components/CompassButton'
import { LayerButton } from './components/LayerButton'
import { LeftRightButton } from './components/LeftRightButton'
import './App.css'

const options: MapboxOptions = {
  // token: only for public usage (URL restricted)
  accessToken: "pk.eyJ1Ijoic3cxMjI3IiwiYSI6ImNrbngyazRhcjBtY3Iyd3RnODhjbDhscWsifQ.6Uc-Lboqa0WhZbnnFJWFSA",
  container: 'mapbox-map',
  // style: 'mapbox://styles/mapbox/light-v10',
  localIdeographFontFamily: 'sans-serif',
  center: [139.7, 35.7],
  zoom: 8,
}
const LAYER_TRANSITION_MSEC = 400

const targetTimeToRadarId = (targetTime: TargetTime) => {
  const suffix = `${targetTime.basetime}-${targetTime.validtime}`
  return {
    sourceId: `radar-source-${suffix}`,
    layerId: `radar-layer-${suffix}`,
  }
}

// Add rain radar layer to the map for the given targetTime
const addRadarLayer = (map: mapboxgl.Map, targetTime: TargetTime) => {
  const { sourceId, layerId } = targetTimeToRadarId(targetTime)
  const radarTileUrl = `https://www.jma.go.jp/bosai/jmatile/data/nowc/${targetTime.basetime}/none/${targetTime.validtime}/surf/hrpns/{z}/{x}/{y}.png`

  // By setting maxzoom to only source, ovezooming works
  const source = map.getSource(sourceId)
  if (!source) {
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [radarTileUrl],
      tileSize: 256,
      minzoom: 4,
      maxzoom: 10, // Seems to be the max
      attribution: 'Japan Meteorological Agency'
    })
  }
  const layer = map.getLayer(layerId)
  if (!layer) {
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': 0.6
      }
    })
  }
}

const removeRadarLayer = (map: mapboxgl.Map, targetTime: TargetTime) => {
  const { layerId } = targetTimeToRadarId(targetTime)
  setTimeout(() => {
    if (typeof map.getLayer(layerId) !== 'undefined') {
      map.removeLayer(layerId)
    }
  }, LAYER_TRANSITION_MSEC)
}

const App: FC = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [timeIndex, setTimeIndex] = useState<number | null>(null)
  const { targetTimes, latestTimeIndex, refreshTargetTimes } = useTargetTimes()
  const [renderedTime, setRenderedTime] = useState<TargetTime | null>(null)
  const [location, setLocation] = useState<{ lng: number, lat: number } | null>(null)
  const gpsMarker = useRef<mapboxgl.Marker | null>(null)
  const [shouldShowCompass, setShouldShowCompass] = useState(false)

  // Initialize map on first render
  useEffect(() => {
    const mapboxMap = new mapboxgl.Map(options)
    setMap(mapboxMap)
    mapboxMap.on('load', () => {
      setIsMapLoaded(true)
    })
    mapboxMap.on('rotate', () => {
      // Show compass button when the map is not north-up
      setShouldShowCompass(mapboxMap.getBearing() !== 0)
    })
    window.scrollTo(0, document.body.scrollHeight) // TEMP: for iPhone
  }, [])

  // When target times are fetched, set timeIndex to the latest observed time
  useEffect(() => {
    if (typeof latestTimeIndex !== 'number') return
    setTimeIndex(latestTimeIndex)
  }, [latestTimeIndex])

  // When timeIndex is changed by the slider or initial fetch, update radar layer
  useEffect(() => {
    if (!isMapLoaded || targetTimes.length === 0 || typeof timeIndex !== 'number' || !map) return
    const targetTime = targetTimes[timeIndex]
    // Add layer for the new time and remove layer for the previously rendered time (if exists)
    addRadarLayer(map, targetTime)
    if (renderedTime && renderedTime.validtime !== targetTime.validtime) removeRadarLayer(map, renderedTime)
    setRenderedTime(targetTime)
  }, [isMapLoaded, timeIndex, targetTimes, map, renderedTime])

  // When location is changed by the GPS button, add a marker and move the map to the location
  useEffect(() => {
    if (!isMapLoaded || !location || !map) return
    if (gpsMarker.current) gpsMarker.current.remove()
    const { lng, lat } = location
    gpsMarker.current = new mapboxgl.Marker({ color: 'teal' }).setLngLat([lng, lat]).addTo(map)
    map.flyTo({ center: [lng, lat] })
  }, [isMapLoaded, location, map])

  // When compass button is clicked, reset the map bearing
  const handleClickCompass = useCallback(() => {
    map?.flyTo({ bearing: 0 })
  }, [map])

  // When the layer is selected, add the selected layer
  const handleSelectLayer = useCallback((selectedLayer: { url: string } | null) => {
    if (!map) return

    // Use fixed id for the source and layer of GSI tile
    const sourceId = `gsi-source`
    const layerId = `gsi-layer`

    // If no layer is selected, remove the GSI tile layer and return
    if (!selectedLayer) {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      return
    }

    // Add or update the raster source for GSI tile
    const source = map.getSource(sourceId)
    if (!source) {
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [selectedLayer.url],
        tileSize: 256,
        minzoom: 4,
        maxzoom: 16,
        attribution: '地理院タイル(色別標高図の海域部は海上保安庁海洋情報部の資料を使用して作成)'
      })
    } else if (source.type === 'raster') { // type guard for source.tiles
      source.tiles = [selectedLayer.url]
    }

    // Add or update the raster layer for GSI tile
    const layer = map.getLayer(layerId)
    if (!layer) {
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.6
        },
      })
    } else {
      map.removeLayer(layerId)
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.6
        },
      })
    }

    // Bring the radar layer to the front
    const radarLayerId = renderedTime ? targetTimeToRadarId(renderedTime).layerId : null
    if (radarLayerId) map.moveLayer(radarLayerId)
  }, [map, renderedTime])

  // When the terrain ON/OFF is selected, add/remove the terrain
  const handleSelectTerrain = useCallback((shouldShowTerrain: boolean) => {
    if (!map) return
    const sourceId = `mapbox-terrain-source`
    if (shouldShowTerrain) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 13,
        })
      }
      map.setTerrain({ source: sourceId, exaggeration: 1.5 })
    } else {
      map.setTerrain()
    }
  }, [map])

  return (
    <>
      <div id="mapbox-map" />
      <LeftRightButton
        type='left'
        disabled={typeof timeIndex !== 'number' || timeIndex <= 0}
        onClick={() => {
          if (typeof timeIndex === 'number' && timeIndex > 0) {
            setTimeIndex(timeIndex - 1)
          }
        }}
      />
      <LeftRightButton
        type='right'
        disabled={typeof timeIndex !== 'number' || timeIndex >= targetTimes.length - 1}
        onClick={() => {
          if (typeof timeIndex === 'number' && timeIndex < targetTimes.length - 1) {
            setTimeIndex(timeIndex + 1)
          }
        }}
      />
      <Box style={{
        position: 'absolute',
        bottom: '48px',
        left: '10vw',
        width: '80vw',
        height: '24px',
        padding: '0px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        touchAction: 'pan-x',
        display: 'flex',
      }}>
        {targetTimes.length > 0 && typeof latestTimeIndex === 'number' && typeof timeIndex === 'number' && (
          <TargetTimeSlider
            latestTimeIndex={latestTimeIndex}
            targetTimes={targetTimes}
            timeIndex={timeIndex}
            onChangeIndex={setTimeIndex}
          />
        )}
      </Box>
      <GpsButton onChangeLocation={setLocation} />
      <RefreshButton onClick={async () => {
        refreshTargetTimes()
        setTimeIndex(latestTimeIndex)
      }} />
      <LayerButton onSelectLayer={handleSelectLayer} onSelectTerrain={handleSelectTerrain}/>
      {shouldShowCompass && <CompassButton onClick={handleClickCompass} />}
    </>
  )
}

export default App
