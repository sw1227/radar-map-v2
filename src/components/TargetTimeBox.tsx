import { FC } from 'react'
import { Box } from '@chakra-ui/react'
import { TargetTime } from "../hooks/useTargetTimes";

// Format the target time to readable text
const targetTimeToText = (targetTime: TargetTime) => {
  const formatTime = (timeString: string) => {
    const date = `${timeString.slice(0, 4)}-${timeString.slice(4, 6)}-${timeString.slice(6, 8)}`
    const time = `${timeString.slice(8, 10)}:${timeString.slice(10, 12)}:${timeString.slice(12, 14)}`
    return (new Date(`${date}T${time}Z`)).toLocaleTimeString()
  }
  const baseTimeString = formatTime(targetTime.basetime)
  const validTimeString = formatTime(targetTime.validtime)
  return (parseInt(targetTime.basetime) < parseInt(targetTime.validtime))
    ? `Forecast for ${validTimeString} on ${baseTimeString}`
    : `Observation at ${baseTimeString}`
}

export const TargetTimeBox: FC<{
  targetTime: TargetTime;
}> = ({ targetTime }) => {
  return (
    <Box style={{
      position: 'absolute',
      top: '0px',
      left: '0px',
      padding: '4px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }}>
      {targetTimeToText(targetTime)}
    </Box>
  )
}
