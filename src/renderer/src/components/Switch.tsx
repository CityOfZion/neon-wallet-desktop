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
        className="relative rounded-full shadow-lg w-9 h-5 bg-asphalt data-[state=checked]:bg-green cursor-pointer px-0.5 box-content"
        checked={checked}
        onCheckedChange={onChange}
      >
        <RadioSwitch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-100 transform translate-x-0 data-[state=checked]:translate-x-5 will-change-transform" />
      </RadioSwitch.Root>
      <label
        htmlFor={id}
        className={StyleHelper.mergeStyles(
          'font-normal select-none cursor-pointer text-xs text-gray-100',
          labelClassName
        )}
      >
        {label}
      </label>
    </div>
  )
}
