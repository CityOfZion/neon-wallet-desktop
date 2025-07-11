import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import { Button, TButtonProps } from '@renderer/components/Button'

export const PrepareHardwareWalletContinueButton = (props: TButtonProps) => {
  return (
    <Button
      variant="contained"
      colorSchema="neon"
      iconsOnEdge={false}
      clickableProps={{ className: 'px-16' }}
      rightIcon={<TbArrowRight aria-hidden={true} />}
      {...props}
    />
  )
}
