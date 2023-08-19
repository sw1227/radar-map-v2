import { useState, useEffect, FC } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { useTargetTimes, TargetTime } from './hooks/useTargetTimes'
import { Box } from '@chakra-ui/react'
import { TargetTimeSlider } from './components/TargetTimeSlider'
import './App.css'

const options: MapboxOptions = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
  container: 'mapbox-map',
  style: 'mapbox://styles/mapbox/light-v10',
  localIdeographFontFamily: 'sans-serif',
  center: [139.7, 35.7],
  zoom: 8
}
const LAYER_TRANSITION_MSEC = 400

const targetTimeToId = (targetTime: TargetTime) => {
  const suffix = `${targetTime.basetime}-${targetTime.validtime}`
  return {
    sourceId: `radar-source-${suffix}`,
    layerId: `radar-layer-${suffix}`,
  }
}

// Add rain radar layer to the map for the given targetTime
const addRadarLayer = (map: mapboxgl.Map, targetTime: TargetTime) => {
  const { sourceId, layerId } = targetTimeToId(targetTime)
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
  const { sourceId, layerId } = targetTimeToId(targetTime)
  setTimeout(() => {
    if (typeof map.getLayer(layerId) !== 'undefined') {
      map.removeLayer(layerId)
    }
    if (typeof map.getSource(sourceId) !== 'undefined') {
      map.removeSource(sourceId)
    }
  }, LAYER_TRANSITION_MSEC)
}

const App: FC = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [timeIndex, setTimeIndex] = useState<number | null>(null)
  const { targetTimes, latestTimeIndex } = useTargetTimes()
  const [renderedTime, setRenderedTime] = useState<TargetTime | null>(null)

  // Initialize map on first render
  useEffect(() => {
    const mapboxMap = new mapboxgl.Map(options)
    setMap(mapboxMap)
    mapboxMap.on('load', () => {
      setIsMapLoaded(true)
    })
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


  return (
    <>
      <div id="mapbox-map" />
      <Box style={{
        position: 'absolute',
        bottom: '100px',
        left: '10vw',
        width: '80vw',
        height: '32px',
        padding: '0px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '16px',
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
    </>
  )
}

export default App
