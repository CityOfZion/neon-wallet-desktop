import { TChatResponse } from '@cityofzion/assistant-engine'
import { useNavigate } from 'react-router'
import { match } from 'ts-pattern'

import { useOwnAccountsMapSelector } from '@renderer/hooks/useAccountSelector'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

export const useAssistantActions = () => {
  const navigate = useNavigate()
  const { ownAccountsMapRef } = useOwnAccountsMapSelector()

  const redirect = (response: TChatResponse, callback: () => void) => {
    const redirectCallback = (actionCallback: () => void) => {
      callback()

      SharedUtilsHelper.sleep(4000).then(actionCallback)
    }

    match(response)
      .with({ action: 'transfer' }, ({ data }) => {
        redirectCallback(() => {
          navigate('/send', {
            state: {
              account: ownAccountsMapRef.current.get(SharedAccountHelper.buildAccountKey(data.actingAccount)),
              recipientAddress: data.recipientAddress,
              tokenHash: data.token.hash,
              amount: data.amount,
            },
          })
        })
      })
      .otherwise(() => null)
  }

  return { redirect }
}
