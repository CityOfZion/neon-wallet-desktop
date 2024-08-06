import { useTranslation } from 'react-i18next'
import { regexGood, regexStrong } from '@renderer/constants/password'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  password: string
}

export const PasswordStrenght = ({ password }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'passwordStrenght' })

  const isPasswordGood = regexGood.test(password)
  const isPasswordStrong = regexStrong.test(password)
  const isPasswordTooShort = password.length <= 4

  return (
    <div className="w-full mt-2.5">
      <div className="flex w-full gap-1">
        <div
          className={StyleHelper.mergeStyles('w-1/3 bg-gray-300/70 rounded h-1', {
            'bg-pink': !isPasswordTooShort || isPasswordGood || isPasswordStrong,
          })}
        ></div>
        <div
          className={StyleHelper.mergeStyles('w-1/3 bg-gray-300/70 rounded h-1', {
            'bg-yellow': !isPasswordTooShort && (isPasswordGood || isPasswordStrong),
          })}
        ></div>
        <div
          className={StyleHelper.mergeStyles('w-1/3 bg-gray-300/70 rounded h-1', {
            'bg-green': !isPasswordTooShort && isPasswordStrong,
          })}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-1xs text-gray-300">{t('label')}</span>
        <span
          className={StyleHelper.mergeStyles('text-1xs font-bold text-gray-100', {
            'text-pink': !isPasswordTooShort || isPasswordGood || isPasswordStrong,
            'text-yellow': !isPasswordTooShort && (isPasswordGood || isPasswordStrong),
            'text-green': !isPasswordTooShort && isPasswordStrong,
          })}
        >
          {password.length === 0
            ? t('none')
            : isPasswordTooShort
              ? t('tooShort')
              : isPasswordStrong
                ? t('strong')
                : isPasswordGood
                  ? t('good')
                  : t('weak')}
        </span>
      </div>
    </div>
  )
}
