import { useTranslation } from 'react-i18next'
import { TbDeviceUsb } from 'react-icons/tb'
import { IconButton } from '@renderer/components/IconButton'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

export const ConnectHardwareWalletButton = () => {
  const { t } = useTranslation('components', { keyPrefix: 'connectHardwareWalletButton' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const isPasswordLogin = currentLoginSession?.type === 'password'

  return (
    <IconButton
      text={t('connect')}
      size="md"
      disabled={!isPasswordLogin}
      icon={<TbDeviceUsb aria-hidden={true} className="rotate-45" />}
      onClick={modalNavigateWrapper('connect-hardware-wallet')}
      {...TestHelper.buildTestObject('connect-hardware-wallet')}
    />
  )
}
