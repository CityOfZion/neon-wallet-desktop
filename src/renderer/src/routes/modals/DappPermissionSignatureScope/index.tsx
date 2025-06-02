import { useTranslation } from 'react-i18next'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

type TModalState = {
  session: TSession
  scope: string
  allowedList?: string[]
}

export const DappPermissionSignatureScopeModal = () => {
  const { session, scope, allowedList } = useModalState<TModalState>()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermissionSignatureScopeModal' })

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0">
      <div className="flex min-h-0 flex-col overflow-y-auto pl-5 pr-2">
        <DappPermissionHeader session={session} />

        <p className="mb-6 mt-9 text-center text-2xl text-white">Signature scope</p>

        <div className="flex flex-col gap-2 text-sm text-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">SCOPE</span>

            <div className="flex min-w-0 justify-between gap-3 rounded bg-asphalt px-5 py-2.5">
              <p className="min-w-0 break-words">{scope}</p>
            </div>
          </div>

          {allowedList && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold">ALLOWED LIST</span>

              <div className="flex min-w-0 justify-between gap-3 rounded bg-asphalt px-5 py-2.5">
                <p className="min-w-0 break-words">{allowedList?.join(',\r\n')}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">EXPLANATION</span>

            <div className="flex min-w-0 justify-between gap-3 rounded bg-asphalt px-5 py-2.5">
              <p className="min-w-0 break-words">{t(`scopes.${scope}` as unknown as TemplateStringsArray)}</p>
            </div>
          </div>
        </div>
      </div>
    </CenterModalLayout>
  )
}
