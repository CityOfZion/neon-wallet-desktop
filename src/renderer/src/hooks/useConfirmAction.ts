import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { useLoginSessionSelector, useShouldConfirmActionSelector } from '@renderer/hooks/useAuthSelector'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TAccount } from '@shared/types/store'

import { useModalNavigate } from './useModalRouter'

type TConfirmActionParams = {
  account: TAccount
}

export const useConfirmAction = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('hooks', { keyPrefix: 'useConfirmAction' })
  const { loginSessionRef } = useLoginSessionSelector()
  const { shouldConfirmAction } = useShouldConfirmActionSelector()

  const confirmAction = useCallback(
    ({ account }: TConfirmActionParams) => {
      return new Promise<void>((resolve, reject) => {
        const handleReject = () => {
          reject(new AppError(t('unauthorizedAction')))
        }

        if (account.type === 'watch') {
          return handleReject()
        }

        if (account.type === 'hardware' || loginSessionRef.current?.type === 'hardware' || !shouldConfirmAction) {
          resolve()
          return
        }

        modalNavigate('confirm-action', {
          state: {
            onSuccess: resolve,
            onCancel: handleReject,
          },
        })
      })
    },
    [loginSessionRef, shouldConfirmAction, modalNavigate, t]
  )
  return { confirmAction }
}
