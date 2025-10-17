import { Input, TInputProps } from '@renderer/components/Input'

type TProps = TInputProps & {
  step: number
  description: string
  withLine?: boolean
}

export const SettingsEncryptInputStep = ({ step, description, withLine = true, ...props }: TProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <span className="bg-blue text-1xs flex h-5 w-5 items-center justify-center rounded-full text-gray-900">
          {step}
        </span>
        <span className="text-xs text-red-500">{description}</span>
      </div>

      <div className="flex gap-4">
        <div className="flex h-14 w-5 justify-center">{withLine && <div className="h-full w-px bg-gray-300" />}</div>

        <Input {...props} aria-label={description} compacted />
      </div>
    </div>
  )
}
