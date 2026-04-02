import type { Signer } from '@cityofzion/bs-neo3'
import { BSNeo3NeonJsSingletonHelper } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'

import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { Tooltip } from '@renderer/components/Tooltip'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'

import type { TDappPermissionProps } from '../index'

type TProps = {
  signer: Signer
} & TDappPermissionProps

const resolveSigner = (scope: string | number) => {
  let witnessScope: string = scope.toString()

  const { tx } = BSNeo3NeonJsSingletonHelper.getInstance()

  if (typeof scope === 'number') {
    witnessScope = tx.toString(scope)
  } else if (typeof scope === 'string') {
    witnessScope = tx.parse(scope).toString()
  }

  return witnessScope
}

export const DappPermissionInvokeNeo3ContentSigner = ({ signer, session, onReject }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.customContents.invokeNeo3' })
  const { modalNavigateWrapper } = useModalNavigate()

  const scope = resolveSigner(signer.scopes)

  return (
    <Details.Root>
      <Details.Header
        leftElement={<TbCube3dSphere aria-hidden />}
        rightElement={
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-100 capitalize">{scope}</p>

            <Tooltip title={t('viewSignatureScopeButtonLabel')}>
              <IconButton
                aria-label={t('viewSignatureScopeButtonLabel')}
                icon={<MdChevronRight aria-hidden />}
                colorSchema="gray"
                size="sm"
                compacted
                onClick={modalNavigateWrapper('dapp-permission-signature-scope', {
                  state: { session, scope, allowedList: signer.allowedContracts || signer.allowedGroups, onReject },
                })}
              />
            </Tooltip>
          </div>
        }
      >
        <p className="text-sm text-white">{t('signatureScopeDetailsHeaderLabel')}</p>
      </Details.Header>
    </Details.Root>
  )
}
