import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  contentClassName?: string
}

export const SettingsLayout = ({ children, actions, title, contentClassName }: TProps) => {
  return (
    <section className="flex h-full w-full flex-col px-5">
      <header className="flex h-[3.25rem] min-h-[3.25rem] w-full items-center justify-between border-b border-gray-300/30">
        <h1 className="text-sm text-white">{title}</h1>

        {actions}
      </header>

      <main className={StyleHelper.mergeStyles('flex min-h-0 flex-grow flex-col py-7', contentClassName)}>
        {children}
      </main>
    </section>
  )
}
