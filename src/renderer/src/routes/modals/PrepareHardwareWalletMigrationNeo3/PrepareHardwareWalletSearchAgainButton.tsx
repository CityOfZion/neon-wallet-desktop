import { useTranslation } from 'react-i18next'
import MdSearch from '@renderer/assets/images/md-search.svg?react'
import { Button, TButtonProps } from '@renderer/components/Button'

export const PrepareHardwareWalletSearchAgainButton = (props: TButtonProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.statusConnection' })

  return (
    <Button
      label={t('searchAgainButtonLabel')}
      textClassName="text-neon"
      iconsOnEdge={false}
      leftIcon={<MdSearch aria-hidden={true} className="h-5 w-5 text-neon" />}
      clickableProps={{ className: 'px-16' }}
      {...props}
    />
  )
}
