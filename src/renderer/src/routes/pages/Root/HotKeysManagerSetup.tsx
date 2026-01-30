import { useHotkeys } from 'react-hotkeys-hook'

const HotKeysManagerSetup = () => {
  useHotkeys(
    'f12',
    async () => {
      await window.api.sendAsync('window:toggleDevTools')
    },
    { enableOnFormTags: true }
  )

  return null
}

export default HotKeysManagerSetup
