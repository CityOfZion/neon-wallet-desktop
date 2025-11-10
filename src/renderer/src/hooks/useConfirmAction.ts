import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import { IAccountState } from '@shared/types/store'

import { useModalNavigate } from './useModalRouter'

type TConfirmActionParams = {
  account: IAccountState
}

export const useConfirmAction = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('hooks', { keyPrefix: 'useConfirmAction' })
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const confirmAction = useCallback(
    async ({ account }: TConfirmActionParams) => {
      return new Promise<void>((resolve, reject) => {
        if (account.type === 'watch') {
          reject(new Error(t('unauthorizedAction')))
          return
        }
        if (account.type === 'hardware' || currentLoginSessionRef.current?.type === 'hardware') {
          resolve()
          return
        }

        modalNavigate('confirm-action', {
          state: {
            onSuccess: resolve,
            onCancel: reject,
          },
        })
      })
    },
    [currentLoginSessionRef, t, modalNavigate]
  )
  return { confirmAction }
}
