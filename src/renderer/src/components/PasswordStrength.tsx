import { useTranslation } from 'react-i18next'
import { PasswordHelper } from '@renderer/helpers/PasswordHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TBarProps = {
  ariaLabel: string
  className: string
}

type TProps = {
  password: string
}

const PasswordStrengthBar = ({ ariaLabel, className }: TBarProps) => (
  <span
    aria-label={ariaLabel}
    className={StyleHelper.mergeStyles('block w-1/3 bg-gray-300/70 rounded h-1', className)}
  />
)

export const PasswordStrength = ({ password }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'passwordStrength' })
  const isWeak = PasswordHelper.isWeakPassword(password)
  const isGood = PasswordHelper.isGoodPassword(password)
  const isStrong = PasswordHelper.isStrongPassword(password)

  const getText = () => {
    if (isStrong) return t('strong')
    if (isGood) return t('good')
    if (isWeak) return t('weak')
    if (password.length === 0) return t('none')

    return t('tooShort')
  }

  return (
    <div className="w-full mt-2.5">
      <div className="flex w-full gap-1">
        <PasswordStrengthBar
          ariaLabel={t('weak')}
          className={StyleHelper.mergeStyles({ 'bg-pink': isWeak || isGood || isStrong })}
        />
        <PasswordStrengthBar
          ariaLabel={t('good')}
          className={StyleHelper.mergeStyles({ 'bg-yellow': isGood || isStrong })}
        />
        <PasswordStrengthBar ariaLabel={t('strong')} className={StyleHelper.mergeStyles({ 'bg-green': isStrong })} />
      </div>
      <div className="flex justify-between mt-2">
        <p className="text-1xs text-gray-300">{t('label')}</p>
        <p
          className={StyleHelper.mergeStyles('text-1xs font-bold text-gray-100', {
            'text-pink': isWeak,
            'text-yellow': isGood,
            'text-green': isStrong,
          })}
        >
          {getText()}
        </p>
      </div>
    </div>
  )
}
