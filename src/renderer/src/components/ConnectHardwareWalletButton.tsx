import { useTranslation } from 'react-i18next'
import { TbDeviceUsb } from 'react-icons/tb'
import { IconButton } from '@renderer/components/IconButton'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useHasHardwareAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

export const ConnectHardwareWalletButton = () => {
  const { t } = useTranslation('components', { keyPrefix: 'connectHardwareWalletButton' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { hasHardwareAccount } = useHasHardwareAccountSelector()
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const isPasswordLogin = currentLoginSession?.type === 'password'

  return (
    <IconButton
      text={t('connect')}
      size="md"
      disabled={hasHardwareAccount || !isPasswordLogin}
      icon={<TbDeviceUsb aria-hidden={true} className="rotate-45" />}
      onClick={modalNavigateWrapper('connect-hardware-wallet')}
      {...TestHelper.buildTestObject('connect-hardware-wallet')}
    />
  )
}
