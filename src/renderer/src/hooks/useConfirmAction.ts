import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { IAccountState } from '@shared/types/store'

import { useModalNavigate } from './useModalRouter'

type TConfirmActionParams = {
  account: IAccountState
}

export const useConfirmAction = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('hooks', { keyPrefix: 'useConfirmAction' })

  const confirmAction = useCallback(
    async ({ account }: TConfirmActionParams) => {
      return new Promise<void>((resolve, reject) => {
        const handleReject = () => {
          return reject(new AppError(t('unauthorizedAction')))
        }

        if (account.type === 'watch') {
          return handleReject()
        }

        if (account.type === 'hardware') {
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
    [t, modalNavigate]
  )
  return { confirmAction }
}
