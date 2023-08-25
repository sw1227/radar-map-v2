import { FC } from 'react'
import { Icon, IconButton } from '@chakra-ui/react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export const LeftRightButton: FC<{
  type: 'left' | 'right',
  disabled: boolean,
  onClick: () => void,
}> = ({ type, disabled, onClick }) => {
  return (
    <IconButton
      isRound={true}
      variant='solid'
      aria-label='compass'
      fontSize='20px'
      icon={<Icon as={(type === 'left') ? MdChevronLeft : MdChevronRight} />}
      isDisabled={disabled}
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '8px',
        left: (type === 'left') ? 'calc(50% - 40px)' : 'calc(50% + 40px)',
        touchAction: 'none',
      }}
    />
  )
}
