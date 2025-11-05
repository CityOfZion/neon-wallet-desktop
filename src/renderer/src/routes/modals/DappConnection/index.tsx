import { ChangeEvent, useEffect } from 'react'

import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import TbLink from '@renderer/assets/images/tb-link.svg?react'
import WalletConnectLogo from '@renderer/assets/images/wallet-connect.svg?react'

import { IAccountState } from '@shared/types/store'

type TFormData = {
  url: string
  isConnecting: boolean
}

type TLocationState = {
  account: IAccountState
  uri?: string
}

const DappConnectionModal = () => {
  const { connect, proposals } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnection' })
  const { account, uri } = useModalState<TLocationState>()
  const { actionData, setData, actionState, setError, handleAct } = useActions<TFormData>({
    url: uri ?? '',
    isConnecting: false,
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({ url: value })
  }

  const handleSubmit = async (data: TFormData) => {
    if (!WalletConnectHelper.isValidURI(data.url)) {
      setError('url', 'Invalid URI')
      return
    }

    try {
      setData({ isConnecting: true })
      await connect(data.url)
    } catch {
      ToastHelper.error({ message: t('errors.errorToConnect') })
      setData({ isConnecting: false })
    }
  }

  useEffect(() => {
    const proposal = proposals[0]
    if (!proposal || !account) return

    modalNavigate('dapp-connection-details', { state: { proposal, account }, replace: true })
  }, [proposals, modalNavigate, account])

  return (
    <CenterModalLayout contentClassName="flex flex-col">
      <div className="flex w-full items-center gap-x-12">
        <NeonWalletLogo aria-hidden className="h-min w-full" />

        <WalletConnectLogo aria-hidden className="h-min w-full opacity-60" />
      </div>

      <div>
        <div className="px-8 text-center">
          <h2 className="mt-8 text-2xl text-white">{t('title')}</h2>

          <p className="mt-5 text-sm text-gray-100">
            <Trans t={t} i18nKey="description" />
          </p>

          <p className="text-blue mt-2 text-xs leading-5 italic">{t('disclaimer')}</p>
        </div>
      </div>

      <form className="mt-6 flex grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <Input
          placeholder={t('inputPlaceholder')}
          clearable
          pastable
          value={actionData.url}
          onChange={handleChange}
          errorMessage={actionState.errors.url}
        />
        <Button
          label={t('buttonConnectLabel')}
          leftIcon={<TbLink />}
          className="w-full max-w-62.5"
          loading={actionState.isActing || actionData.isConnecting}
        />
      </form>
    </CenterModalLayout>
  )
}

export default DappConnectionModal
