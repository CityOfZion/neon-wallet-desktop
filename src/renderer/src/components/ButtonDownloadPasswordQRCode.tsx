import { ComponentProps, Fragment, type JSX, useCallback, useEffect, useState } from 'react'

import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import MdDownload from '@renderer/assets/images/md-download.svg?react'

import { Button } from './Button'

type TProps = {
  label?: string
  leftIcon?: JSX.Element
  variant?: 'outlined' | 'contained' | 'text' | 'text-slim'
  onDownload?: () => void
  loading?: boolean
} & ComponentProps<'button'>

export const ButtonDownloadPasswordQRCode = ({ label, variant, leftIcon, onDownload, loading, ...props }: TProps) => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('common', { keyPrefix: 'general' })
  const [decryptedPassword, setDecryptedPassword] = useState<string>('')

  const handleDownload = () => {
    UtilsHelper.downloadSVGToPng('QRCode')

    if (onDownload) onDownload()
  }

  const decryptPassword = useCallback(async () => {
    const result = await window.api.sendAsync(
      'encryption:decryptBasedOS',
      loginSessionRef.current?.encryptedPassword || ''
    )

    setDecryptedPassword(result)
  }, [loginSessionRef])

  useEffect(() => {
    decryptPassword()
  }, [decryptPassword])

  return (
    <Fragment>
      {decryptedPassword && (
        <QRCodeSVG id="QRCode" size={172} value={decryptedPassword} includeMargin className="hidden" />
      )}
      <Button
        label={label ? label : t('downloadQRCodePassword')}
        leftIcon={leftIcon ? leftIcon : <MdDownload aria-hidden />}
        variant={variant ? variant : 'outlined'}
        className={props.className}
        iconsOnEdge={false}
        loading={loading}
        onClick={handleDownload}
      />
    </Fragment>
  )
}
