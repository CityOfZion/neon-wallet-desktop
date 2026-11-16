import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Tooltip } from '@renderer/components/Tooltip'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  data: string | number
  children: ReactNode
  className?: string
}

export const TransactionActivityListTooltip = ({ data, className, children }: TProps) => {
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const dataText = data.toString()
  const title = !dataText || tCommonGeneral('emptyColumn') === dataText ? '' : dataText

  return (
    <Tooltip
      title={title}
      delayDuration={0}
      variant="black"
      contentProps={{
        className: StyleHelper.mergeStyles('inline-block max-w-44', className),
      }}
    >
      {children}
    </Tooltip>
  )
}
