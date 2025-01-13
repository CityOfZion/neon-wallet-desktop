import { useTranslation } from 'react-i18next'
import { TbHelp } from 'react-icons/tb'
import { Separator } from '@renderer/components/Separator'
import { SideModalLayout } from '@renderer/layouts/SideModal'

export const AboutExtraIdToReceiveModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'aboutExtraIdToReceiveModal' })

  return (
    <SideModalLayout heading={t('title')} contentClassName="py-6" headingIcon={<TbHelp aria-hidden={true} />}>
      <h3 className="text-gray-100 uppercase text-xs font-bold">{t('what.title')}</h3>
      <p className="text-xs text-white mt-3">{t('what.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-gray-100 uppercase text-xs font-bold">{t('why.title')}</h3>
      <p className="text-xs text-white mt-3">{t('why.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-gray-100 uppercase text-xs font-bold">{t('where.title')}</h3>
      <p className="text-xs text-white mt-3">{t('where.description')}</p>
    </SideModalLayout>
  )
}
