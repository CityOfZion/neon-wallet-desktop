import { useTranslation } from 'react-i18next'
import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import PiSealCheck from '@renderer/assets/images/pi-seal-check.svg?react'
import TbNotes from '@renderer/assets/images/tb-notes.svg?react'
import { Button } from '@renderer/components/Button'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

export const AutoUpdateCompleted = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'autoUpdate.completed' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between">
      <div className="flex flex-col items-center px-8 text-center">
        <NeonWalletLogo aria-hidden={true} className="h-min w-56" />

        <h2 className="mt-11 text-2xl text-white">{t('title')}</h2>

        <p className="mt-7 w-full max-w-[31rem] text-sm leading-5 text-gray-100">{t('description')}</p>

        <div className="mt-9 flex h-36 w-36 items-center justify-center rounded-full bg-asphalt">
          <PiSealCheck aria-hidden={true} className="h-[7rem] w-[7rem] text-blue" />
        </div>
      </div>

      <div className="flex w-full justify-center gap-x-2">
        <Button
          label={t('buttonPatchNotesLabel')}
          rightIcon={<TbNotes />}
          colorSchema="gray"
          wide
          iconsOnEdge={false}
          onClick={modalNavigateWrapper('auto-update-notes')}
        />
        <Button
          label={t('buttonContinueLabel')}
          iconsOnEdge={false}
          wide
          rightIcon={<MdOutlineAutoAwesome />}
          onClick={modalNavigateWrapper('auto-update-mobile')}
        />
      </div>
    </CenterModalLayout>
  )
}
