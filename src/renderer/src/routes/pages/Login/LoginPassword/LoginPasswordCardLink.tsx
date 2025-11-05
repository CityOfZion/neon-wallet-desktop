import { ReactNode } from 'react'

import { Link, LinkProps } from 'react-router'

type TProps = {
  title: string
  text: ReactNode
  icon: ReactNode
} & LinkProps

export const LoginPasswordCardLink = ({ title, text, icon, ...props }: TProps) => (
  <Link
    className="flex items-center gap-x-4 rounded-sm border border-gray-300/15 p-4 text-xs text-white transition-colors hover:border-gray-300 hover:bg-gray-700/60 focus:border-gray-300 focus:bg-gray-700/60"
    {...props}
  >
    <div className="text-neon text-2xl">{icon}</div>
    <div className="flex flex-col gap-y-1">
      <strong className="text-sm uppercase">{title}</strong>
      <span className="text-gray-100">{text}</span>
    </div>
  </Link>
)
