import { useTranslation } from 'react-i18next'
import { MdSearch } from 'react-icons/md'
import { Button, TButtonProps } from '@renderer/components/Button'

export const PrepareHardwareWalletSearchAgainButton = (props: TButtonProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.statusConnection' })

  return (
    <Button
      label={t('searchAgainButtonLabel')}
      textClassName="text-neon"
      iconsOnEdge={false}
      leftIcon={<MdSearch aria-hidden={true} className="text-neon w-5 h-5" />}
      clickableProps={{ className: 'px-16' }}
      {...props}
    />
  )
}
