import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { TbX } from 'react-icons/tb'

type TProps = ComponentProps<'div'>

export const TemporaryLimitsBox = (props: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'temporaryLimitsBox' })

  const limits = t('limits', { returnObjects: true })

  return (
    <div {...props}>
      <p className="text-gray-100 text-xs text-center">{t('description')}</p>

      <div className="bg-gray-900/50 px-8 py-2 rounded w-full grid grid-cols-2 gap-y-2.5 mt-3.5">
        {limits.map((limit, index) => (
          <div className="flex gap-1.5 items-center" key={`limits-${index}`}>
            <TbX className="text-pink w-4 h-4 stroke-[3px]" />
            <p className="text-xs text-gray-100 relative -top-px">{limit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
