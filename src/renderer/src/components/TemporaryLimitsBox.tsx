import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { TbX } from 'react-icons/tb'

type TProps = ComponentProps<'div'>

export const TemporaryLimitsBox = (props: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'temporaryLimitsBox' })

  const limits = t('limits', { returnObjects: true })

  return (
    <div {...props}>
      <p className="text-center text-xs text-gray-100">{t('description')}</p>

      <div className="mt-3.5 grid w-full grid-cols-2 gap-y-2.5 rounded bg-gray-900/50 px-8 py-2">
        {limits.map((limit, index) => (
          <div className="flex items-center gap-1.5" key={`limits-${index}`}>
            <TbX aria-hidden={true} className="h-4 w-4 stroke-[3px] text-pink" />
            <p className="relative -top-px text-xs text-gray-100">{limit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
