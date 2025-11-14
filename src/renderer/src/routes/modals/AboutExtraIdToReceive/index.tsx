import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbHelp from '@renderer/assets/images/tb-help.svg?react'

const AboutExtraIdToReceiveModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'aboutExtraIdToReceive' })

  return (
    <SideModalLayout heading={t('title')} contentClassName="py-6" headingIcon={<TbHelp aria-hidden />}>
      <h3 className="text-xs font-bold text-gray-100 uppercase">{t('what.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('what.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-xs font-bold text-gray-100 uppercase">{t('why.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('why.description')}</p>

      <Separator containerClassName="my-6" />

      <h3 className="text-xs font-bold text-gray-100 uppercase">{t('where.title')}</h3>
      <p className="mt-3 text-xs text-white">{t('where.description')}</p>
    </SideModalLayout>
  )
}

export default AboutExtraIdToReceiveModal
