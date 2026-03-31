import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Button } from '@renderer/components/Button'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import TbArrowLeft from '@renderer/assets/images/tb-arrow-left.svg?react'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'

import { TNewsArticle } from '@shared/types/query'

type TProps = {
  article: TNewsArticle
  onBack: () => void
  onPrevious?: () => void
  onNext?: () => void
}

export const ViewArticle = ({ article, onBack, onPrevious, onNext }: TProps) => {
  const { language } = useLanguageSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'news.viewArticle' })

  const formattedDate = DateHelper.formatLocalized(new Date(article.created_at), { language, format: 'PP' })

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 overflow-y-auto bg-gray-700/35">
      <div className="flex w-full items-center justify-between rounded bg-gray-800 text-sm text-white">
        <Button
          onClick={onBack}
          variant="text"
          label={t('backToNewsButtonLabel')}
          leftIcon={<TbArrowLeft aria-hidden />}
        />

        <h2 className="truncate">{article.title}</h2>

        <div className="flex items-center gap-1">
          <Button
            variant="text"
            label={t('previousArticleButtonLabel')}
            leftIcon={<TbArrowLeft aria-hidden />}
            onClick={onPrevious}
            colorSchema="gray"
            disabled={!onPrevious}
          />

          <Button
            variant="text"
            label={t('nextArticleButtonLabel')}
            rightIcon={<TbArrowRight aria-hidden />}
            onClick={onNext}
            disabled={!onNext}
          />
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-2xl flex-col items-center gap-y-2.5 pb-8">
        <div className="flex w-full items-center justify-between text-xs">
          <p className="text-blue">{formattedDate}</p>
          <p className="text-gray-100">COZ</p>
        </div>

        <h1 className="text-2xl break-all">{article.title}</h1>

        {article.previewImage && (
          <img src={article.previewImage} alt={article.title} className="my-3 max-w-full rounded-lg" />
        )}

        <div className="markdown-body w-full flex-1 overflow-y-auto text-xs">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {article.body}
          </Markdown>
        </div>
      </div>
    </div>
  )
}
