import { ComponentProps, ReactNode } from 'react'
import { cloneElement } from 'react'
import { TbArrowLeft } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

export type TMainLayoutProps = {
  children?: ReactNode
  title: string
  titleIcon?: JSX.Element
  contentClassName?: string
  headerClassName?: string
} & ComponentProps<'div'>

export const ContentLayout = ({
  title,
  titleIcon,
  children,
  contentClassName,
  headerClassName,
  className,
  ...props
}: TMainLayoutProps): JSX.Element => {
  const navigate = useNavigate()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { className: titleIconClassName = '', ...titleIconProps } = titleIcon ? titleIcon.props : {}

  const hasTestnet = Object.values(networkByBlockchain).some(({ type }) => type === 'testnet')

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className={StyleHelper.mergeStyles('flex h-screen-minus-drag-region', className)} {...props}>
      <div
        className={StyleHelper.mergeStyles('flex-grow flex flex-col bg-asphalt text-white px-7 py-4', {
          'pt-10': hasTestnet,
        })}
      >
        <header
          className={StyleHelper.mergeStyles('border-b border-b-gray-300/30 min-h-12 flex pb-4', headerClassName)}
        >
          <button type="button" onClick={handleBackClick}>
            <TbArrowLeft className="w-5 h-5 text-gray-100" />
          </button>
          <div className="flex items-center mx-auto pr-6 gap-x-2">
            {titleIcon &&
              cloneElement(titleIcon, {
                className: StyleHelper.mergeStyles('text-neon', titleIconClassName),
                ...titleIconProps,
              })}
            <h1 className="text-sm">{title}</h1>
          </div>
        </header>

        <main className={StyleHelper.mergeStyles('flex flex-col flex-grow pt-5', contentClassName)}>{children}</main>
      </div>
    </div>
  )
}
