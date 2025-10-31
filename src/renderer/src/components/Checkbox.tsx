import { forwardRef } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import FiCheck from '@renderer/assets/images/fi-check.svg?react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = Omit<RadixCheckbox.CheckboxProps, 'onCheckedChange'> & {
  onCheckedChange?(checked: boolean): void
}

export const Checkbox = forwardRef<HTMLButtonElement, TProps>(
  ({ className, disabled, onCheckedChange, ...props }, ref) => {
    const handleCheckedChange = (value: RadixCheckbox.CheckedState) => {
      if (value === 'indeterminate') {
        onCheckedChange?.(false)
      } else {
        onCheckedChange?.(value)
      }
    }

    return (
      <RadixCheckbox.Root
        ref={ref}
        className={StyleHelper.mergeStyles(
          'flex h-4.5 max-h-4.5 min-h-4.5 w-4.5 min-w-4.5 max-w-4.5 items-center justify-center rounded-sm border-2 data-[state=unchecked]:bg-transparent',
          {
            'cursor-not-allowed border-gray-300 data-[state=checked]:bg-gray-300': disabled,
            'border-neon data-[state=checked]:bg-neon': !disabled,
          },
          className
        )}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <RadixCheckbox.Indicator>
          <FiCheck aria-hidden={true} className="h-full w-full stroke-asphalt stroke-2" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    )
  }
)
