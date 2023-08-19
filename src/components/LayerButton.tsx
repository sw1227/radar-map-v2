import { FC } from 'react'
import { Icon, IconButton } from '@chakra-ui/react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react'
import { SlLayers } from 'react-icons/sl'

export const LayerButton: FC<{
  onSelectLayer: (layer: { name: string, url: string } | null) => void,
}> = ({ onSelectLayer }) => {
  return (
    <Menu placement='top-end'>
      <MenuButton
        as={IconButton}
        aria-label='layers'
        icon={<Icon as={SlLayers} />}
        isRound={true}
        variant='solid'
        style={{
          position: 'absolute',
          bottom: '180px',
          right: '10px',
          touchAction: 'none',
        }}
      />
      <MenuList>
        <MenuOptionGroup title='Select tile' type='radio' defaultValue='base'>
          <MenuItemOption value='base' onClick={() => onSelectLayer(null)}>
            Basemap only
          </MenuItemOption>
          <MenuDivider />
          {tileSets.map((tileSet) => (
            <MenuItemOption key={tileSet.name} value={tileSet.name} onClick={() => onSelectLayer(tileSet)} >
              {tileSet.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

const tileSets = [
  {
    name: '陰影起伏図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png'
  },
  {
    name: '淡色地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
  },
  {
    name: '標準地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
  },
  {
    name: '白地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'
  },
  {
    name: '航空写真',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
  },
  {
    name: '色別標高図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png'
  },
  {
    name: '傾斜量図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/slopemap/{z}/{x}/{y}.png'
  },
  {
    name: 'アナグリフ',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/anaglyphmap_color/{z}/{x}/{y}.png'
  },
]