import { useTranslation } from 'react-i18next'
import { TbPlug, TbPlugX } from 'react-icons/tb'
import { TSession, useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TLocationState = {
  sessions: TSession[]
}

export const DappDisconnectionModal = () => {
  const { disconnect } = useWalletConnectWallet()
  const { sessions } = useModalState<TLocationState>()
  const { t } = useTranslation('modals', { keyPrefix: 'dappDisconnection' })
  const { modalNavigate } = useModalNavigate()

  const handleDisconnect = async (session: TSession) => {
    await disconnect(session)
    modalNavigate(-1)
  }

  const handleDisconnectAll = () => {
    Promise.allSettled(sessions.map(async session => await disconnect(session)))
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPlug aria-hidden={true} className="text-neon" />}>
      <div className="flex h-full w-full flex-col items-center justify-between rounded bg-gray-800 px-4 text-xs">
        <div className="flex flex-col items-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-asphalt">
            <TbPlugX aria-hidden={true} className="h-[5rem] w-[5rem] text-pink" />
          </div>
          <p className="pt-7 text-lg text-white">{sessions.length > 1 ? t('disconnectAllApps') : t('disconnectApp')}</p>
          {sessions.length === 1 ? (
            <>
              <div className="mt-3 flex min-h-[2rem] w-full items-center justify-center rounded bg-gray-300/15 px-3">
                <p className="p-2 text-center text-xs">{sessions[0].peer.metadata.name}</p>
              </div>

              <span className="px-2 pt-4 text-center text-xs text-gray-100">
                {sessions[0].peer.metadata.description}
              </span>
            </>
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
              onClick={() => modalNavigate(-1)}
              colorSchema="gray"
              flat
            />
            {sessions.length === 1 ? (
              <Button
                className="w-full"
                variant="outlined"
                label={t('disconnect')}
                leftIcon={<TbPlugX />}
                colorSchema="error"
                flat
                onClick={() => handleDisconnect(sessions[0])}
              />
            ) : (
              <Button
                className="w-full"
                variant="outlined"
                label={t('disconnect')}
                leftIcon={<TbPlugX />}
                colorSchema="error"
                flat
                onClick={() => handleDisconnectAll()}
              />
            )}
          </div>
        </div>
      </div>
    </SideModalLayout>
  )
}
