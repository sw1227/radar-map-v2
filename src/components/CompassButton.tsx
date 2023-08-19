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
      aria-label='compass'
      fontSize='20px'
      icon={<Icon as={CiCompass1} />}
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '230px',
        right: '10px',
        touchAction: 'none',
      }}
    />
  )
}
