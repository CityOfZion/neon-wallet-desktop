import { useTranslation } from 'react-i18next'
import { MdChevronRight } from 'react-icons/md'
import { Tb3DCubeSphere } from 'react-icons/tb'
import { tx } from '@cityofzion/neon-core'
import { Signer as ContractSigner, TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { IconButton } from '@renderer/components/IconButton'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  signer: ContractSigner
  session: TSession
}

const SUPPORTED_SIGNER_BY_NAME: Record<string, tx.WitnessScope> = {
  None: tx.WitnessScope.None,
  CalledByEntry: tx.WitnessScope.CalledByEntry,
  CustomContracts: tx.WitnessScope.CustomContracts,
  CustomGroups: tx.WitnessScope.CustomGroups,
  WitnessRules: tx.WitnessScope.WitnessRules,
  Global: tx.WitnessScope.Global,
}

const resolveSigner = (scope: string | number) => {
  let witnessScope: string = scope.toString()

  if (typeof scope === 'number') {
    witnessScope = tx.toString(scope)
  } else if (typeof scope === 'string' && SUPPORTED_SIGNER_BY_NAME) {
    witnessScope = tx.parse(scope).toString()
  }

  return witnessScope
}

export const Signer = ({ signer, session }: TProps) => {
  const { modalNavigateWrapper } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.contractInvocation' })

  const scope = resolveSigner(signer.scopes)

  return (
    <div className="flex justify-between items-center text-gray-100">
      <div className="flex items-center gap-2.5">
        <Tb3DCubeSphere className="w-6 h-6" />
        <p className="text-white">{t('signatureScopeTitle')}</p>
      </div>

      <div className="flex gap-3">
        <p>{scope}</p>
        <IconButton
          icon={<MdChevronRight className="text-gray-100" />}
          compacted
          onClick={modalNavigateWrapper('dapp-permission-signature-scope', {
            state: { session, scope, allowedList: signer.allowedContracts ?? signer.allowedGroups },
          })}
        />
      </div>
    </div>
  )
}
