import { FC } from 'react'
import { Icon, IconButton } from '@chakra-ui/react'
import { CiCompass1 } from 'react-icons/ci'

export const CompassButton: FC<{
  onClick: () => void,
}> = ({ onClick }) => {
  return (
    <IconButton
      isRound={true}
      variant='solid'
      aria-label='Done'
      fontSize='20px'
      icon={<Icon as={CiCompass1} />}
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '180px',
        right: '10px',
        touchAction: 'none',
      }}
    />
  )
}
