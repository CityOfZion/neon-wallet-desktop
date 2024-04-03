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
        <span className="rounded-full flex justify-center items-center w-5 h-5 bg-blue text-gray-900 text-1xs">
          {step}
        </span>
        <span className="text-red-500 text-xs">{description}</span>
      </div>

      <div className="flex gap-4">
        <div className="w-5 h-14 flex justify-center">{withLine && <div className="w-px h-full bg-gray-300" />}</div>

        <Input {...props} compacted />
      </div>
    </div>
  )
}
