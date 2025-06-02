import { useTranslation } from 'react-i18next'
import { TbHelp } from 'react-icons/tb'
import { Separator } from '@renderer/components/Separator'
import { SideModalLayout } from '@renderer/layouts/SideModal'

export const AboutExtraIdToReceiveModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'aboutExtraIdToReceiveModal' })

  return (
    <SideModalLayout heading={t('title')} contentClassName="py-6" headingIcon={<TbHelp aria-hidden={true} />}>
      <h3 className="text-xs font-bold uppercase text-gray-100">{t('what.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('what.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-xs font-bold uppercase text-gray-100">{t('why.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('why.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-xs font-bold uppercase text-gray-100">{t('where.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('where.description')}</p>
    </SideModalLayout>
  )
}
