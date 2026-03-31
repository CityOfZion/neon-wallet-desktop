import { DateHelper } from '@renderer/helpers/DateHelper'

import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import NeonWalletIcon from '@renderer/assets/images/neon-wallet-icon.svg?react'
import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'

import { TNewsArticle } from '@shared/types/query'

type TProps = {
  article: TNewsArticle
  onSelect: () => void
}

export const ArticleListItem = ({ article, onSelect }: TProps) => {
  const { language } = useLanguageSelector()
  const formattedDate = DateHelper.formatLocalized(new Date(article.created_at), { language, format: 'PP' })

  const handleKeyDown = ({ code }: React.KeyboardEvent<HTMLLIElement>) => {
    if (code === 'Enter' || code === 'Space') {
      onSelect()
    }
  }

  return (
    <li
      className="flex cursor-pointer items-center gap-4 rounded-sm px-4 py-3 transition-colors hover:bg-gray-300/15"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="h-14 w-20 min-w-20 overflow-hidden rounded-sm">
        {article.previewImage ? (
          <img src={article.previewImage} alt={article.title} className="my-3 max-w-full rounded-lg" />
        ) : (
          <div className="bg-asphalt flex h-13.5 items-center justify-center rounded">
            <NeonWalletIcon aria-hidden className="text-neon size-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <div className="flex items-center gap-6">
            <p className="truncate">COZ</p>
          </div>
          <p className="text-blue ml-auto">{formattedDate}</p>
        </div>

        <p className="truncate text-sm font-medium text-white">{article.title}</p>
      </div>

      <div>
        <TbChevronRight className="size-6 text-gray-300" aria-hidden />
      </div>
    </li>
  )
}
