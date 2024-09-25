import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  contentClassName?: string
}

export const SettingsLayout = ({ children, actions, title, contentClassName }: TProps) => {
  return (
    <section className="flex flex-col px-5 w-full h-full">
      <header className="w-full h-[3.25rem] min-h-[3.25rem] border-b border-gray-300/30 items-center flex justify-between">
        <h1 className="text-white text-sm">{title}</h1>

        {actions}
      </header>

      <main className={StyleHelper.mergeStyles('py-7 flex flex-col min-h-0 flex-grow', contentClassName)}>
        {children}
      </main>
    </section>
  )
}
