import { WalletKitHelper } from '@cityofzion/bs-multichain'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { invalidateWalletConnectSessions } from '@renderer/hooks/useWalletConnectSessions'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbPlug from '@renderer/assets/images/tb-plug.svg?react'
import TbPlugX from '@renderer/assets/images/tb-plug-x.svg?react'

import { walletKit } from '@renderer/libs/wallet-connect'
import type { TModalState } from '@shared/types/modal'

const DappDisconnectionModal = () => {
  const { sessions } = useModalState<TModalState<'dapp-disconnection'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'dappDisconnection' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()

  const [isDisconnecting, startDisconnect] = usePressOnce(async () => {
    await Promise.allSettled(
      sessions.map(session =>
        walletKit.disconnectSession({ topic: session.topic, reason: WalletKitHelper.getError('USER_DISCONNECTED') })
      )
    )
    invalidateWalletConnectSessions()
    modalNavigate(-1)
  })

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPlug aria-hidden className="text-neon" />}>
      <div className="flex h-full w-full flex-col items-center justify-between rounded-sm bg-gray-800 px-4 text-xs">
        <div className="flex flex-col items-center">
          <div className="bg-asphalt flex h-36 w-36 items-center justify-center rounded-full">
            <TbPlugX aria-hidden className="text-pink h-20 w-20" />
          </div>
          <p className="pt-7 text-lg text-white">{sessions.length > 1 ? t('disconnectAllApps') : t('disconnectApp')}</p>
          {sessions.length === 1 ? (
            <Fragment>
              <div className="mt-3 flex min-h-8 w-full items-center justify-center rounded-sm bg-gray-300/15 px-3">
                <p className="p-2 text-center text-xs">{sessions[0].peer.metadata.name}</p>
              </div>

              <span className="px-2 pt-4 text-center text-xs text-gray-100">
                {sessions[0].peer.metadata.description}
              </span>
            </Fragment>
          ) : (
            <div className="flex flex-col px-2 pt-4 text-center text-sm text-gray-100">
              <span>{t('totalDapps', { totalDapps: sessions.length })}</span>
              <span>{t('willRemove')}</span>
            </div>
          )}
        </div>
        <div className="flex w-full flex-col items-center">
          <Separator />
          <span className="py-6 text-xs">{t('warning')}</span>
          <div className="flex w-full gap-x-4">
            <Button
              className="w-full"
              variant="contained"
              label={t('cancel')}
              onClick={modalNavigateWrapper(-1)}
              colorSchema="gray"
              flat
              disabled={isDisconnecting}
            />

            <Button
              className="w-full"
              variant="outlined"
              label={t('disconnect')}
              leftIcon={<TbPlugX aria-hidden />}
              colorSchema="error"
              flat
              loading={isDisconnecting}
              onClick={startDisconnect}
            />
          </div>
        </div>
      </div>
    </SideModalLayout>
  )
}

export default DappDisconnectionModal
