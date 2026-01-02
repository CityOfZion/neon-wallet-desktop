import { ChangeEvent } from 'react'

import type { ProposalTypes, SignClientTypes } from '@walletconnect/types'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import TbLink from '@renderer/assets/images/tb-link.svg?react'
import WalletConnectLogo from '@renderer/assets/images/wallet-connect.svg?react'

import type { TModalState } from '@shared/types/modal'

type TFormData = {
  url: string
}

const DappConnectionModal = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnection' })
  const { account, uri } = useModalState<TModalState<'dapp-connection'>>()

  const { actionData, setData, actionState, setError, handleAct, reset } = useActions<TFormData>({
    url: uri ?? '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({ url: value })
  }

  const handlePair = (uri: string) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<ProposalTypes.Struct>(async (resolve, reject) => {
      try {
        const timeout = setTimeout(() => {
          WalletKitHelper.kit.off('session_proposal', listener)
          reject(new Error('Timeout waiting for session proposal'))
        }, 6000)

        const listener = (proposal: Omit<SignClientTypes.BaseEventArgs<ProposalTypes.Struct>, 'topic'>) => {
          resolve(proposal.params)
          clearTimeout(timeout)
          WalletKitHelper.kit.off('session_proposal', listener)
        }

        WalletKitHelper.kit.once('session_proposal', listener)

        await WalletKitHelper.kit.pair({ uri })
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleSubmit = async (data: TFormData) => {
    if (!WalletKitHelper.isValidURI(data.url)) {
      setError('url', 'Invalid URI')
      return
    }

    try {
      const proposal = await handlePair(data.url)
      modalNavigate('dapp-connection-request', { state: { proposal, account }, replace: true })
    } catch {
      ToastHelper.error({ message: t('errors.errorToConnect') })
    } finally {
      reset()
    }
  }

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
          loading={actionState.isActing}
        />
      </form>
    </CenterModalLayout>
  )
}

export default DappConnectionModal
