import * as RadioSwitch from '@radix-ui/react-switch'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  label: string
  name: string
  checked: boolean
  className?: string
  labelClassName?: string
  onChange: (checked: boolean) => void
}

export const Switch = ({ label, name, checked, className, labelClassName, onChange }: TProps) => {
  const id = `switch-${name}`

  return (
    <div className={StyleHelper.mergeStyles('flex items-center gap-x-1.5', className)}>
      <RadioSwitch.Root
        id={id}
        className="bg-asphalt data-[state=checked]:bg-green relative box-content h-5 w-9 cursor-pointer rounded-full px-0.5 shadow-lg"
        checked={checked}
        onCheckedChange={onChange}
      >
        <RadioSwitch.Thumb className="block h-4 w-4 translate-x-0 transform rounded-full bg-white shadow-lg transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-5" />
      </RadioSwitch.Root>
      <label
        htmlFor={id}
        className={StyleHelper.mergeStyles(
          'cursor-pointer text-xs font-normal text-gray-100 select-none',
          labelClassName
        )}
      >
        {label}
      </label>
    </div>
  )
}
