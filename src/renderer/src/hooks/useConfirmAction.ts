import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { IAccountState } from '@shared/types/store'

import { useModalNavigate } from './useModalRouter'

type TConfirmActionParams = {
  account: IAccountState
}

export const useConfirmAction = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('hooks', { keyPrefix: 'useConfirmAction' })
  const { loginSessionRef } = useLoginSessionSelector()

  const confirmAction = useCallback(
    ({ account }: TConfirmActionParams) => {
      return new Promise<void>((resolve, reject) => {
        const handleReject = () => {
          reject(new AppError(t('unauthorizedAction')))
        }

        if (account.type === 'watch') {
          return handleReject()
        }

        if (account.type === 'hardware' || loginSessionRef.current?.type === 'hardware') {
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
    [loginSessionRef, t, modalNavigate]
  )
  return { confirmAction }
}
