import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import type { IAccountState } from '@shared/types/store'

const DeeplinkManagerSetup = () => {
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t: commonWc } = useTranslation('pages', { keyPrefix: 'private.deeplinkManagerSetup' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      // Remove trailing slash
      uri = uri.endsWith('/') ? uri.slice(0, -1) : uri

      window.api.sendAsync('deeplink:resetInitialUri')

      const [_prefix, path] = uri.split('://')

      if (path.startsWith('migration')) {
        navigate('/settings/security/migrate-accounts')
        modalNavigate('migrate-accounts-step-2')
        return
      }

      if (path.startsWith('import?mnemonic') || path.startsWith('import/?mnemonic')) {
        let [, mnemonic] = path.split('=')
        mnemonic = atob(mnemonic)
        modalNavigate('import', { state: { text: mnemonic } })
        return
      }

      const realWCUri = uri.split('uri=').pop()
      if (realWCUri) {
        let wcUri: string | undefined
        const decodedUri = decodeURIComponent(realWCUri)
        if (WalletKitHelper.isValidURI(decodedUri)) {
          wcUri = decodedUri
        } else {
          const decodedBase64Uri = atob(decodedUri)
          if (WalletKitHelper.isValidURI(decodedBase64Uri)) {
            wcUri = decodedBase64Uri
          }
        }

        if (wcUri) {
          modalNavigate('select-account', {
            state: {
              onSelectAccount: (account: IAccountState) => {
                modalNavigate('dapp-connection', { state: { account: account, uri: wcUri } })
              },
              title: commonWc('selectAccountModal.title'),
              buttonLabel: commonWc('selectAccountModal.selectSourceAccount'),
            },
          })
        }
      }
    }

    window.api.sendAsync('deeplink:getInitialUri').then(handleDeeplink)

    const removeDeeplinkListener = window.api.listen('deeplink:connection', ({ args }) => {
      handleDeeplink(args)
    })

    return () => {
      removeDeeplinkListener()
    }
  }, [commonWc, modalNavigate, navigate])

  return null
}

export default DeeplinkManagerSetup
