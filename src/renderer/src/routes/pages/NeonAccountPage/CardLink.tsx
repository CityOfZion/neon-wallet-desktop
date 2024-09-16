import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type TProps = {
  title: string
  text: ReactNode
  to: string
  icon: ReactNode
}

export const CardLink = ({ title, text, icon, to }: TProps) => (
  <Link
    className={
      'flex gap-x-4 items-center border border-gray-300/15 focus:border-gray-300 hover:border-gray-300 rounded text-xs text-white focus:bg-gray-700/60 hover:bg-gray-700/60 p-4 transition-colors'
    }
    to={to}
  >
    <div className={'text-neon text-2xl'}>{icon}</div>
    <div className={'flex flex-col gap-y-1'}>
      <strong className={'uppercase text-sm'}>{title}</strong>
      <span className={'text-gray-100'}>{text}</span>
    </div>
  </Link>
)
