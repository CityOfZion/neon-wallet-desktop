import { TbArrowRight } from 'react-icons/tb'
import { Button, TButtonProps } from '@renderer/components/Button'

export const PrepareHardwareWalletContinueButton = (props: TButtonProps) => {
  return (
    <div className="flex flex-grow flex-col justify-end mt-8 pb-8">
      <Button
        variant="contained"
        colorSchema="neon"
        iconsOnEdge={false}
        clickableProps={{ className: 'px-16' }}
        rightIcon={<TbArrowRight aria-hidden={true} />}
        {...props}
      />
    </div>
  )
}
