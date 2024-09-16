import React from 'react'
import { TbDiscountCheck } from 'react-icons/tb'

export const SuccessIcon: React.FC = () => {
  const size = '118px'

  return (
    <TbDiscountCheck
      style={{ width: size, height: size }}
      className={'text-blue stroke-1 bg-asphalt rounded-[50%] p-1.5 mt-8'}
      aria-hidden={true}
    />
  )
}
