import { useHotkeys } from 'react-hotkeys-hook'

import { useModalNavigate, useModalRouter } from '@renderer/hooks/useModalRouter'

const HotKeysManagerSetup = () => {
  const { modalNavigate } = useModalNavigate()
  const { histories } = useModalRouter()

  const handleSearch = () => {
    const [lastHistory] = histories.slice(-1)

    if (lastHistory?.route.name === 'search') {
      modalNavigate(-1)
      return
    }

    if (lastHistory) return

    modalNavigate('search')
  }

  useHotkeys('ctrl+f', handleSearch, { enableOnFormTags: true })

  return null
}

export default HotKeysManagerSetup
