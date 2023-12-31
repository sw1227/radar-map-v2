import { FC, useEffect, useState, useCallback } from 'react'
import { Icon, IconButton } from '@chakra-ui/react'
import { MdGpsFixed } from 'react-icons/md'

export const GpsButton: FC<{
  onChangeLocation: (loc: { lng: number, lat: number }) => void,
}> = ({ onChangeLocation }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // GPS button click handler
  const handleClickGps = useCallback(() => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => { // onSuccess
          setIsGettingLocation(false)
          onChangeLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => { // onError
          setIsGettingLocation(false)
          alert(`Failed to get current location. \n${err}`)
        },
        { timeout: 10000 }
      )
    } else {
      alert('Your browser does not support getting current location.')
    }
  }, [onChangeLocation, setIsGettingLocation])

  // Get current location on first render
  useEffect(() => {
    handleClickGps()
  }, [handleClickGps])

  return (
    <IconButton
      isRound={true}
      variant='solid'
      aria-label='gps'
      fontSize='20px'
      icon={<Icon as={MdGpsFixed} />}
      onClick={handleClickGps}
      isLoading={isGettingLocation}
      disabled={isGettingLocation}
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '10px',
        touchAction: 'none',
      }}
    />
  )
}
