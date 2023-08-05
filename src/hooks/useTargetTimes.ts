import useSWR from 'swr'

type Fetcher<T> = (...args: [RequestInfo, RequestInit?]) => Promise<T>;
const fetcher: Fetcher<any> = (...args) => fetch(...args).then(res => res.json())
const jsonUrls = {
  past: 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json',
  future: 'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json'
}

export interface TargetTime {
  basetime: string
  validtime: string
}

// Fetch target times from JMA API
export const useTargetTimes = () => {
  // Past data: list of times when observed radar tiles are available
  // Future data: list of times when forecasted radar tiles are available
  const { data: pastData, error: pastError, isLoading: isPastLoading } = useSWR<TargetTime[]>(jsonUrls.past, fetcher);
  const { data: futureData, error: futureError, isLoading: isFutureLoading } = useSWR<TargetTime[]>(jsonUrls.future, fetcher);

  // pastData: descending, futureData: descending
  // → [...futureData, ...pastData] is descending, and targetTimes is ascending
  const targetTimes = [...futureData ?? [], ...pastData ?? []].reverse()
  const latestTimeIndex = pastData?.length ? pastData.length - 1 : 0 // Index of latest observed time
  return {
    targetTimes, // e.g. ['20230805011000', '20230805011500', ..., '20230805050500']
    latestTimeIndex,
    errors: [pastError, futureError],
    isLoading: isPastLoading || isFutureLoading,
  }
}
