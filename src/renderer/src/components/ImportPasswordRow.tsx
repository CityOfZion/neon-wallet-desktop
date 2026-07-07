import { Fragment } from 'react'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Input } from '@renderer/components/Input'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'

import { useActions } from '@renderer/hooks/useActions'

import MdCheck from '@renderer/assets/images/md-check.svg?react'
import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

import type { TUseImportNep6Account } from '@shared/types/hooks'

type TProps = {
  account: TUseImportNep6Account
  inputLabel: string
  inputPlaceholder: string
  error: string
  onSubmit: (account: TUseImportNep6Account, password: string) => Promise<void>
}

type TActionsData = {
  password: string
}

export const ImportPasswordRow = ({ account, inputLabel, inputPlaceholder, error, onSubmit }: TProps) => {
  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TActionsData>({
    password: '',
  })

  const handleSubmit = async (data: TActionsData) => {
    try {
      await onSubmit(account, data.password)
    } catch (submitError) {
      LoggerHelper.error(submitError, { where: 'ImportPasswordRow', operation: 'submitAccountPassword' })
      setError('password', error)
    }
  }

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2.5 py-4">
      <div className="flex h-full w-6 items-start">
        <MdChevronRight aria-hidden className="text-blue h-6 w-full" />
      </div>

      <div className="flex min-w-0 grow flex-col gap-1">
        <span className="text-sm text-white">{account.label}</span>
        <span className="truncate text-xs text-gray-300">{account.address}</span>

        <Input
          label={inputLabel}
          containerClassName="mt-1.5"
          placeholder={inputPlaceholder}
          type="password"
          value={actionData.password}
          onChange={setDataFromEventWrapper('password')}
          onBlur={handleAct(handleSubmit)}
          error={!!actionState.errors.password}
          loading={actionState.isActing}
          compacted
          readOnly={actionState.hasActed && actionState.isValid}
        />

        {!!actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} className="mt-2" />}
      </div>

      <div className="flex h-full w-6 items-start">
        {actionState.hasActed && (
          <Fragment>
            {actionState.isValid ? (
              <MdCheck aria-hidden className="text-green size-6" />
            ) : (
              <TbAlertTriangle aria-hidden className="text-pink size-6" />
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}
