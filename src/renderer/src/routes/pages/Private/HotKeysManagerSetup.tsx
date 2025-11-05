import { useHotkeys } from 'react-hotkeys-hook'

import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'

const HotKeysManagerSetup = () => {
  const { modalNavigate } = useModalNavigate()
  const { historiesRef } = useModalHistories()

  const handleSearch = () => {
    const [lastHistory] = historiesRef.current.slice(-1)

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
