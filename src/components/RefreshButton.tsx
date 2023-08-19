import { FC, useState } from 'react'
import { Icon, IconButton } from '@chakra-ui/react'
import { MdRefresh } from 'react-icons/md'

export const RefreshButton: FC<{
  onClick: () => Promise<void>,
}> = ({ onClick }) => {
  const [isFetching, setIsFetching] = useState(false)

  return (
    <IconButton
      isRound={true}
      variant='solid'
      aria-label='Done'
      fontSize='20px'
      icon={<Icon as={MdRefresh} />}
      onClick={() => {
        setIsFetching(true)
        onClick().finally(() => setIsFetching(false))
      }}
      isLoading={isFetching}
      disabled={isFetching}
      style={{
        position: 'absolute',
        bottom: '90px',
        right: '10px',
        touchAction: 'none',
      }}
    />
  )
}
