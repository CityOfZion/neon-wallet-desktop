import { useTranslation } from 'react-i18next'

import { DappHeader } from '@renderer/components/DappHeader'
import { Details } from '@renderer/components/Details'

import { useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'

import type { TModalState } from '@shared/types/modal'

export const DappPermissionSignatureScopeModal = () => {
  const { scope, allowedList, session, onReject } = useModalState<TModalState<'dapp-permission-signature-scope'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermissionSignatureScope' })

  return (
    <CenterModalLayout
      contentClassName="px-0 flex flex-col pb-5 min-h-0"
      eraseOnEsc={false}
      eraseOnClickOutside={false}
      onErase={onReject}
    >
      <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5">
        <DappHeader proposerUri={session.peer.metadata.icons[0]} proposerName={session.peer.metadata.name} />

        <Details.Root className="mt-5">
          <Details.Header
            leftElement={<TbCube3dSphere aria-hidden />}
            rightElement={<p className="text-sm font-semibold text-gray-100 capitalize">{scope}</p>}
          >
            <p className="text-sm text-white">{t('scopeDetailsHeaderLabel')}</p>
          </Details.Header>
        </Details.Root>

        {allowedList && (
          <Details.Root className="mt-3">
            <Details.Header>
              <p className="text-sm text-white">{t('allowListDetailsHeaderLabel')}</p>
            </Details.Header>

            <Details.HeaderSeparator />

            <Details.Body>
              <p className="min-w-0 text-sm wrap-break-word text-gray-100">{allowedList?.join(',\r\n')}</p>
            </Details.Body>
          </Details.Root>
        )}

        <Details.Root className="mt-3">
          <Details.Header>
            <p className="text-sm text-white">{t('explanationDetailsHeaderLabel')}</p>
          </Details.Header>

          <Details.HeaderSeparator />

          <Details.Body>
            <p className="min-w-0 text-sm wrap-break-word text-gray-100">{t(`scopes.${scope}`, t('scopes.unknown'))}</p>
          </Details.Body>
        </Details.Root>
      </div>
    </CenterModalLayout>
  )
}

export default DappPermissionSignatureScopeModal
