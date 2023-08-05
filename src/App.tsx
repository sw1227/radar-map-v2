import { useState, useEffect } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { useTargetTimes, TargetTime } from './hooks/useTargetTimes'
import './App.css'

const options: MapboxOptions = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
  container: 'mapbox-map',
  style: 'mapbox://styles/mapbox/light-v10',
  localIdeographFontFamily: 'sans-serif',
  center: [139.7, 35.7],
  zoom: 8
}

// Add rain radar layer to the map for the given basetime and validtime
const addRadarLayer = (map: mapboxgl.Map, targetTime: TargetTime) => {
  const suffix = `${targetTime.basetime}-${targetTime.validtime}`
  const radarTileUrl = `https://www.jma.go.jp/bosai/jmatile/data/nowc/${targetTime.basetime}/none/${targetTime.validtime}/surf/hrpns/{z}/{x}/{y}.png`

  // By setting maxzoom to only source, ovezooming works
  const sourceId = `radar-${suffix}`
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
  const layerId = `radar-tiles-${suffix}`
  const layer = map.getLayer(layerId)
  if (!layer) {
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: `radar-${suffix}`,
      paint: {
        'raster-opacity': 0.6
      }
    })
  }
}

function App() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isMapLoadFinished, setIsMapLoadFinished] = useState(false)
  const { targetTimes, latestTimeIndex, isLoading: isLoadingTargetTimes } = useTargetTimes()

  // Initialize map on first render
  useEffect(() => {
    setIsMapLoadFinished(false)
    const mapboxMap = new mapboxgl.Map(options)
    setMap(mapboxMap)
    mapboxMap.on('load', () => {
      setIsMapLoadFinished(true)
    })
  }, [])

  // When loading data and map finised, add radar layer to the map
  useEffect(() => {
    const selectedTime = targetTimes[latestTimeIndex]
    if (!map || !isMapLoadFinished || isLoadingTargetTimes || !selectedTime) return

    addRadarLayer(map, selectedTime)
  }, [map, isMapLoadFinished, isLoadingTargetTimes, targetTimes, latestTimeIndex])


  return (
    <>
      <div id="mapbox-map" />
    </>
  )
}

export default App
