import { useTranslation } from 'react-i18next'
import { MdLooks3, MdLooks4, MdLooksOne, MdLooksTwo } from 'react-icons/md'
import { TbPlus } from 'react-icons/tb'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { SideModalLayout, TSideModalProps } from './SideModal'

type TProps = TSideModalProps

export const CreateWalletModalLayout = ({ children, contentClassName, ...props }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet' })
  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbPlus className="text-neon" />}
      contentClassName="flex flex-col justify-between"
      {...props}
    >
      <section className="w-full flex-grow flex flex-row min-h-0">
        <div className="min-w-[22rem] max-w-[22rem] border-r border-gray-300/30 pr-5 print:hidden">
          <h2 className="text-sm py-4">{t('heading')}</h2>
          <Separator className="min-h-[0.0625rem]" />
          <div className="flex flex-col pt-11 gap-11">
            <div>
              <div className="flex gap-2.5 items-center h-11">
                <MdLooksOne className="text-blue h-4.5 w-4.5" aria-hidden={true} />
                <div className="text-sm">{t('step1Header')}</div>
              </div>
              <div className="text-gray-100 text-xs ml-1">{t('step1Description')}</div>
            </div>
            <div>
              <div className="flex gap-2.5 items-center h-11">
                <MdLooksTwo className="text-blue h-4.5 w-4.5" aria-hidden={true} />
                <div className="text-sm">{t('step2Header')}</div>
              </div>
              <div className="text-gray-100 text-xs ml-1">{t('step2Description')}</div>
            </div>
            <div>
              <div className="flex gap-2.5 items-center h-11">
                <MdLooks3 className="text-blue h-4.5 w-4.5" aria-hidden={true} />
                <div className="text-sm">{t('step3Header')}</div>
              </div>
              <div className="text-gray-100 text-xs ml-1">{t('step3Description')}</div>
            </div>
            <div>
              <div className="flex gap-2.5 items-center h-11">
                <MdLooks4 className="text-blue h-4.5 w-4.5" aria-hidden={true} />
                <div className="text-sm">{t('step4Header')}</div>
              </div>
              <div className="text-gray-100 text-xs ml-1">{t('step4Description')}</div>
            </div>
          </div>
        </div>

        <section
          className={StyleHelper.mergeStyles('flex flex-col flex-grow px-9 pb-10 pt-2.5 h-full', contentClassName)}
        >
          {children}
        </section>
      </section>
    </SideModalLayout>
  )
}
