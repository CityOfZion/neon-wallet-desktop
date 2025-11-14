import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdLooks3 from '@renderer/assets/images/md-looks-3.svg?react'
import MdLooks4 from '@renderer/assets/images/md-looks-4.svg?react'
import MdLooksOne from '@renderer/assets/images/md-looks-one.svg?react'
import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { SideModalLayout, TSideModalLayoutProps } from './SideModal'

type TProps = TSideModalLayoutProps

export const CreateWalletModalLayout = ({ children, contentClassName, ...props }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet' })
  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbPlus className="text-neon" />}
      contentClassName="flex flex-col justify-between"
      size="1xl"
      {...props}
    >
      <section className="flex min-h-0 w-full grow flex-row">
        <div className="max-w-88 min-w-88 border-r border-gray-300/30 pr-5 print:hidden">
          <h2 className="py-4 text-sm">{t('heading')}</h2>
          <Separator className="min-h-px" />
          <div className="flex flex-col gap-11 pt-11">
            <div>
              <div className="flex h-11 items-center gap-2.5">
                <MdLooksOne className="text-blue h-4.5 w-4.5" aria-hidden />
                <div className="text-sm">{t('step1Header')}</div>
              </div>
              <div className="ml-1 text-xs text-gray-100">{t('step1Description')}</div>
            </div>
            <div>
              <div className="flex h-11 items-center gap-2.5">
                <MdLooksTwo className="text-blue h-4.5 w-4.5" aria-hidden />
                <div className="text-sm">{t('step2Header')}</div>
              </div>
              <div className="ml-1 text-xs text-gray-100">{t('step2Description')}</div>
            </div>
            <div>
              <div className="flex h-11 items-center gap-2.5">
                <MdLooks3 className="text-blue h-4.5 w-4.5" aria-hidden />
                <div className="text-sm">{t('step3Header')}</div>
              </div>
              <div className="ml-1 text-xs text-gray-100">{t('step3Description')}</div>
            </div>
            <div>
              <div className="flex h-11 items-center gap-2.5">
                <MdLooks4 className="text-blue h-4.5 w-4.5" aria-hidden />
                <div className="text-sm">{t('step4Header')}</div>
              </div>
              <div className="ml-1 text-xs text-gray-100">{t('step4Description')}</div>
            </div>
          </div>
        </div>

        <section className={StyleHelper.mergeStyles('flex h-full grow flex-col px-9 pt-2.5 pb-10', contentClassName)}>
          {children}
        </section>
      </section>
    </SideModalLayout>
  )
}
