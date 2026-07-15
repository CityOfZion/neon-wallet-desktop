import { Separator } from '@renderer/components/Separator'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { TLanguage } from '@shared/types/store'

type TProps = {
  date: string
  language: TLanguage
}

export const AssistantMessageSeparator = ({ date, language }: TProps) => {
  const label = DateHelper.formatLocalized(date, { format: 'EEEE, d MMMM yyyy', language })

  return (
    <div className="flex items-center gap-x-2">
      <Separator />

      <p className="text-xs whitespace-nowrap text-gray-200">{label}</p>

      <Separator />
    </div>
  )
}
