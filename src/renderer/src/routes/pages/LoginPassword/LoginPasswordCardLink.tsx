import { ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'

type TProps = {
  title: string
  text: ReactNode
  icon: ReactNode
} & LinkProps

export const LoginPasswordCardLink = ({ title, text, icon, ...props }: TProps) => (
  <Link
    className="flex gap-x-4 items-center border border-gray-300/15 focus:border-gray-300 hover:border-gray-300 rounded text-xs text-white focus:bg-gray-700/60 hover:bg-gray-700/60 p-4 transition-colors"
    {...props}
  >
    <div className="text-neon text-2xl">{icon}</div>
    <div className="flex flex-col gap-y-1">
      <strong className="uppercase text-sm">{title}</strong>
      <span className="text-gray-100">{text}</span>
    </div>
  </Link>
)
