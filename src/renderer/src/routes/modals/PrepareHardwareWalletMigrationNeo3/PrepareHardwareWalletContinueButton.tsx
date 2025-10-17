import { Button, TButtonProps } from '@renderer/components/Button'

import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'

export const PrepareHardwareWalletContinueButton = (props: TButtonProps) => {
  return (
    <Button
      variant="contained"
      colorSchema="neon"
      iconsOnEdge={false}
      clickableProps={{ className: 'px-16' }}
      rightIcon={<TbArrowRight aria-hidden />}
      {...props}
    />
  )
}
