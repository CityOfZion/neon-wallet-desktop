import { useTranslation } from 'react-i18next'

import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'

import { useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import type { TModalState } from '@shared/types/modal'

const DappPermissionSignatureScopeModal = () => {
  const { session, scope, allowedList } = useModalState<TModalState<'dapp-permission-signature-scope'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermissionSignatureScope' })

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0">
      <div className="flex min-h-0 flex-col overflow-y-auto pr-2 pl-5">
        <DappPermissionHeader session={session} />

        <p className="mt-9 mb-6 text-center text-2xl text-white">Signature scope</p>

        <div className="flex flex-col gap-2 text-sm text-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">SCOPE</span>

            <div className="bg-asphalt flex min-w-0 justify-between gap-3 rounded-sm px-5 py-2.5">
              <p className="min-w-0 wrap-break-word">{scope}</p>
            </div>
          </div>

          {allowedList && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold">ALLOWED LIST</span>

              <div className="bg-asphalt flex min-w-0 justify-between gap-3 rounded-sm px-5 py-2.5">
                <p className="min-w-0 wrap-break-word">{allowedList?.join(',\r\n')}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">EXPLANATION</span>

            <div className="bg-asphalt flex min-w-0 justify-between gap-3 rounded-sm px-5 py-2.5">
              <p className="min-w-0 wrap-break-word">{t(`scopes.${scope}` as unknown as TemplateStringsArray)}</p>
            </div>
          </div>
        </div>
      </div>
    </CenterModalLayout>
  )
}

export default DappPermissionSignatureScopeModal
