import { forwardRef } from 'react'
import { FiCheck } from 'react-icons/fi'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TCheckboxProps = Omit<RadixCheckbox.CheckboxProps, 'onCheckedChange'> & {
  onCheckedChange?(checked: boolean): void
}

export const Checkbox = forwardRef<HTMLButtonElement, TCheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
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
          'flex max-h-[1.125rem] min-h-[1.125rem] min-w-[1.125rem] max-w-[1.125rem] items-center justify-center rounded-sm border-2',
          {
            'cursor-not-allowed border-gray-300': props.disabled,
            'border-neon data-[state=checked]:bg-neon data-[state=unchecked]:bg-transparent': !props.disabled,
          },
          className
        )}
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
