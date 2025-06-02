import { Calendar, TCalendarProps } from './Calendar'
import { Popover, TPopoverContentProps } from './Popover'

const Root = Popover.Root

const Trigger = Popover.Trigger

type TPickerProps = TCalendarProps & {
  popoverContentProps?: TPopoverContentProps
}

const Picker = ({ popoverContentProps, ...props }: TPickerProps) => (
  <Popover.Content className="w-auto bg-gray-900 p-0" {...popoverContentProps}>
    <Calendar {...props} />
  </Popover.Content>
)

export const DatePicker = { Root, Trigger, Picker }
