import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdCheck, MdChevronRight } from 'react-icons/md'
import { TbAlertTriangle } from 'react-icons/tb'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Input } from '@renderer/components/Input'
import { useActions } from '@renderer/hooks/useActions'
import { TMigrateAccountSchema } from '@renderer/hooks/useBackupOrMigrate'
import { bsAggregator } from '@renderer/libs/blockchainService'

export type TMigrateDecryptedAccountSchema = TMigrateAccountSchema & {
  decryptedKey: string
  blockchain: TBlockchainServiceKey
}

type TProps = {
  accountToMigrate: TMigrateAccountSchema
  onDecrypt?: (decryptedAccount: TMigrateDecryptedAccountSchema) => void
}

type TActionData = {
  password: string
}

export const DecryptAccountPasswordContainer = ({ accountToMigrate, onDecrypt }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step4' })

  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TActionData>({
    password: '',
  })

  const handleSubmit = async (data: TActionData) => {
    try {
      const serviceName = bsAggregator.getBlockchainNameByAddress(accountToMigrate.address)
      if (!serviceName) throw new Error()

      const service = bsAggregator.blockchainServicesByName[serviceName]

      const decryptedAccount = await service.decrypt(accountToMigrate.key, data.password)

      onDecrypt?.({
        ...accountToMigrate,
        decryptedKey: decryptedAccount.key,
        blockchain: serviceName,
      })
    } catch (error) {
      setError('password', t('passwordError'))
    }
  }

  return (
    <div className="flex py-4 items-center w-full justify-between gap-2.5 min-w-0">
      <div className="flex items-start h-full w-6">
        <MdChevronRight className="w-full h-6 text-blue " />
      </div>

      <div className="flex flex-grow flex-col gap-1 min-w-0">
        <span className="text-sm text-white">{accountToMigrate.label}</span>
        <span className="text-xs text-gray-300 truncate">{accountToMigrate.address}</span>

        <Input
          label={t('inputLabel')}
          containerClassName="mt-1.5"
          placeholder={t('inputPlaceholder')}
          type="password"
          value={actionData.password}
          onChange={setDataFromEventWrapper('password')}
          onBlur={handleAct(handleSubmit)}
          error={!!actionState.errors.password}
          loading={actionState.isActing}
          compacted
          readOnly={actionState.hasActed && actionState.isValid}
        />

        {!!actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} className="mt-2.5" />}
      </div>

      <div className="flex items-start h-full w-6">
        {!!actionState.hasActed && (
          <Fragment>
            {actionState.isValid ? (
              <MdCheck className="w-6 h-6 text-green" />
            ) : (
              <TbAlertTriangle className="w-6 h-6 text-pink" />
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}
