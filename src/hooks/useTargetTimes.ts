import { useEffect, useState } from 'react';

const jsonUrls = {
  past: 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json',
  future: 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json'
}

export interface TargetTime {
  // e.g. '20230805011000'
  basetime: string
  validtime: string
}

// Fetch target times from JMA API
export const useTargetTimes = () => {
  const [targetTimes, setTargetTimes] = useState<TargetTime[]>([])
  const [latestTimeIndex, setLatestTimeIndex] = useState<number | null>(null)

  const fetchTargetTimes = async () => {
    const [pastData, futureData] = await Promise.all([
      fetch(jsonUrls.past).then(res => res.json()),
      fetch(jsonUrls.future).then(res => res.json())
    ])

    // Past data: list of times when observed radar tiles are available
    // Future data: list of times when forecasted radar tiles are available
    const targetTimes = [...futureData ?? [], ...pastData ?? []].reverse()
    // pastData and futureData are descending → targetTimes is ascending
    setTargetTimes(targetTimes)
    const latestIndex = pastData?.length ? pastData.length - 1 : 0 // Index of latest observed time
    setLatestTimeIndex(latestIndex)
  }

  useEffect(() => {
    fetchTargetTimes()
  }, [])

  return { targetTimes, latestTimeIndex, refreshTargetTimes: fetchTargetTimes }
}
