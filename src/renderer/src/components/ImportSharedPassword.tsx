import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Input } from '@renderer/components/Input'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'

import { useActions } from '@renderer/hooks/useActions'

type TProps = {
  inputLabel: string
  inputPlaceholder: string
  error: string
  onSubmit: (password: string) => Promise<void>
}

type TActionsData = {
  password: string
}

export const ImportSharedPassword = ({ inputLabel, inputPlaceholder, error, onSubmit }: TProps) => {
  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TActionsData>({
    password: '',
  })

  const handleSubmit = async (data: TActionsData) => {
    try {
      await onSubmit(data.password)
    } catch (submitError) {
      LoggerHelper.error(submitError, { where: 'ImportSharedPassword', operation: 'submitSharedPassword' })
      setError('password', error)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-1 px-2 py-4">
      <Input
        label={inputLabel}
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
  )
}
