import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdDownload } from 'react-icons/md'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from './Button'

type TProps = {
  label?: string
  leftIcon?: JSX.Element
  variant?: 'outlined' | 'contained' | 'text' | 'text-slim'
  onDownload?: () => void
  loading?: boolean
} & React.ComponentProps<'button'>

export const ButtonDownloadPasswordQRCode = ({ label, variant, leftIcon, onDownload, loading, ...props }: TProps) => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('common', { keyPrefix: 'general' })
  const [decryptedPassword, setDecryptedPassword] = useState<string>('')

  const handleDownload = () => {
    UtilsHelper.donwloadSVGToPng('QRCode')
    if (onDownload) onDownload()
  }

  const decryptPassword = useCallback(async () => {
    const result = await window.api.sendAsync('decryptBasedOS', currentLoginSessionRef.current?.encryptedPassword ?? '')
    setDecryptedPassword(result)
  }, [currentLoginSessionRef])

  useEffect(() => {
    decryptPassword()
  }, [decryptPassword])

  return (
    <>
      {decryptedPassword && (
        <QRCodeSVG id="QRCode" size={172} value={decryptedPassword} includeMargin className="hidden" />
      )}
      <Button
        label={label ? label : t('downloadQRCodePassword')}
        leftIcon={leftIcon ? leftIcon : <MdDownload />}
        variant={variant ? variant : 'outlined'}
        className={props.className}
        iconsOnEdge={false}
        loading={loading}
        onClick={handleDownload}
      />
    </>
  )
}
