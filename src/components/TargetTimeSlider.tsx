import { FC } from 'react'
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'
import { TargetTime } from '../hooks/useTargetTimes'

// e.g. '20230805011000' -> '10:10' (JST)
const timeStringToHourMinutes = (timeString: string) => {
  if (!timeString) return ''
  const date = `${timeString.slice(0, 4)}-${timeString.slice(4, 6)}-${timeString.slice(6, 8)}`
  const time = `${timeString.slice(8, 10)}:${timeString.slice(10, 12)}:${timeString.slice(12, 14)}`
  return (new Date(`${date}T${time}Z`)).toLocaleTimeString().split(':').slice(0, 2).join(':')
}

export const TargetTimeSlider: FC<{
  latestTimeIndex: number;
  targetTimes: TargetTime[];
  timeIndex: number;
  onChangeIndex: (idx: number) => void;
}> = ({ latestTimeIndex, targetTimes, timeIndex, onChangeIndex }) => {
  return (
    <Slider
      aria-label='slider-time'
      defaultValue={latestTimeIndex}
      min={0}
      max={targetTimes.length}
      step={1}
      onChange={onChangeIndex}
    >
      {/* Slider labels for the oldest, current, and newest time */}
      {[0, latestTimeIndex, targetTimes.length].map((idx) => (
        <SliderMark
          key={idx}
          value={idx}
          style={{ marginTop: '12px', position: 'absolute', transform: 'translateX(-50%)', fontSize: 'sm' }}
        >
          {timeStringToHourMinutes(targetTimes[idx]?.validtime)}
        </SliderMark>
      ))}
      {/* Slider label for the selected time */}
      <SliderMark
        value={timeIndex}
        textAlign='center'
      >
        {timeStringToHourMinutes(targetTimes[timeIndex]?.validtime)}
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  )
}
