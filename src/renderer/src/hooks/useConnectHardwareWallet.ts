import { useEffect, useRef, useState } from 'react'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { THardwareWalletInfo } from '@shared/@types/ipc'

type TStatus = 'searching' | 'connected' | 'not-connected'

const MAX_ATTEMPTS = 10

export const useConnectHardwareWallet = (onConnect: (hardwareWalletInfo: THardwareWalletInfo) => Promise<void>) => {
  const [status, setStatus] = useState<TStatus>('searching')

  const triesRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  const handleTryConnect = async () => {
    triesRef.current = 0
    setStatus('searching')

    intervalRef.current = setInterval(async () => {
      try {
        const connectedHardwareWallet = await window.api.sendAsync('connectHardwareWallet')
        setStatus('connected')
        clearInterval(intervalRef.current)

        await UtilsHelper.sleep(2000)

        onConnect(connectedHardwareWallet)
      } catch (error) {
        triesRef.current += 1

        if (triesRef.current > MAX_ATTEMPTS) {
          setStatus('not-connected')
          clearInterval(intervalRef.current)
          return
        }
      }
    }, 2000)
  }

  useEffect(() => {
    handleTryConnect()

    return () => {
      clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status, handleTryConnect }
}
