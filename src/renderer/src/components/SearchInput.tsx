import TbSearch from '@renderer/assets/images/tb-search.svg?react'

import { Input, TInputProps } from './Input'

export const SearchInput = (props: TInputProps) => {
  return <Input {...props} leftIcon={<TbSearch className="stroke-neon" />} clearable />
}
