import { ChangeEvent, useCallback, useMemo } from 'react'

import { search } from 'fast-fuzzy'
import { debounce, orderBy } from 'lodash'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { removeStopwords } from 'stopword'
import { match } from 'ts-pattern'
import winkWebModel from 'wink-eng-lite-web-model'
import WinkNLP from 'wink-nlp'

import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { SynonymsHelper } from '@renderer/helpers/SynonymsHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdSearch from '@renderer/assets/images/md-search.svg?react'
import TbHelp from '@renderer/assets/images/tb-help.svg?react'
import TbSearch from '@renderer/assets/images/tb-search.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'

import { functionsByActionId } from './functionByActionId'

const nlp = WinkNLP(winkWebModel)

type TItem = {
  action: TSearchAction
  verbsMatchedQuantity: number
  nonVerbsMatchedQuantity: number
}

type TActionData = {
  isSearching: boolean
  foundActions?: TSearchAction[]
  search: string
}

type TSearchAction = {
  label: string
  verbs: string[]
  nonVerbs: string[]
  id: string
}

const SearchModal = () => {
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const { modalEraseWrapper } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'search' })
  const { t: tSearch } = useTranslation('search')
  const modalActions = useModalNavigate()
  const pageNavigate = useNavigate()

  const { actionData, setData } = useActions<TActionData>({ isSearching: false, search: '', foundActions: undefined })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchActions = useMemo<TSearchAction[]>(() => tSearch('actions', { returnObjects: true }), [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce(async (text: string) => {
      const hidePasswordAccessMethods = currentLoginSession?.type !== 'password'
      const doc = nlp.readDoc(text.toLowerCase())
      const tokens = doc.tokens().filter(t => t.out(nlp.its.type) === 'word')
      const verbs = tokens.filter(token => token.out(nlp.its.pos) === 'VERB').out(nlp.its.lemma as any) as string[]
      const nonVerbs = removeStopwords(
        tokens.filter(token => token.out(nlp.its.pos) !== 'VERB').out(nlp.its.lemma as any) as string[]
      )

      const passwordAccessMethods = ['createWallet', 'createBackup', 'restoreBackup', 'import']

      const verbsQuantity = verbs.length
      const nonVerbsQuantity = nonVerbs.length

      const hasVerbs = verbsQuantity > 0
      const hasNonVerbs = nonVerbsQuantity > 0

      try {
        if (!hasVerbs && !hasNonVerbs) {
          setData({ foundActions: [] })

          return
        }

        const items: TItem[] = []

        for (const action of searchActions) {
          if (hidePasswordAccessMethods && passwordAccessMethods.includes(action.id)) continue

          const allVerbsSynonyms = await SynonymsHelper.getAllSynonyms(action.verbs)
          const allNonVerbsSynonyms = await SynonymsHelper.getAllSynonyms(action.nonVerbs)

          const lowerCaseLabels = action.label.toLowerCase().split(' ')
          const allVerbs = [...lowerCaseLabels, ...action.verbs, ...allVerbsSynonyms]
          const allNonVerbs = [...lowerCaseLabels, ...action.nonVerbs, ...allNonVerbsSynonyms]

          const filteredVerbs = verbs.filter(
            verb =>
              allVerbs.some(value => value.startsWith(verb)) || search(verb, allVerbs, { threshold: 0.8 }).length > 0
          )

          const filteredNonVerbs = nonVerbs.filter(
            nonVerb =>
              allNonVerbs.some(value => value.startsWith(nonVerb)) ||
              search(nonVerb, allNonVerbs, { threshold: 0.8 }).length > 0
          )

          const verbsMatchedQuantity = filteredVerbs.length
          const nonVerbsMatchedQuantity = filteredNonVerbs.length

          const hasVerbsMatchedQuantity = verbsMatchedQuantity > 0
          const hasNonVerbsMatchedQuantity = nonVerbsMatchedQuantity > 0

          if (hasVerbs && hasNonVerbs) {
            if (hasVerbsMatchedQuantity && hasNonVerbsMatchedQuantity)
              items.push({ action, verbsMatchedQuantity, nonVerbsMatchedQuantity })
          } else if (hasVerbs) {
            if (hasVerbsMatchedQuantity) items.push({ action, verbsMatchedQuantity, nonVerbsMatchedQuantity })
          } else if (hasNonVerbs && hasNonVerbsMatchedQuantity)
            items.push({ action, verbsMatchedQuantity, nonVerbsMatchedQuantity })
        }

        setData({
          foundActions: orderBy(items, ['verbsMatchedQuantity', 'nonVerbsMatchedQuantity'], ['desc', 'desc']).map(
            ({ action }) => action
          ),
        })
      } catch {
        setData({ foundActions: [] })
      } finally {
        setData({ isSearching: false })
      }
    }, 1500),
    []
  )

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({ search: value, isSearching: true })

    if (value.length <= 0) {
      setData({ foundActions: undefined, isSearching: false })
      handleSearch.cancel()
      return
    }

    await handleSearch(value)
  }

  const handleClick = async (action: TSearchAction) => {
    try {
      const func = functionsByActionId[action.id]
      if (!func) {
        ToastHelper.error({ message: t('errors.noFunction') })
        return
      }

      await func({ modalActions, pageNavigate })
    } catch (error) {
      LoggerHelper.error(error, { where: 'SearchModal', operation: 'clickSearchOption' })
      ToastHelper.error({ message: AppError.wrap(error, t('errors.errorToExecute')).displayMessage })
    }
  }

  return (
    <CenterModalLayout
      contentClassName="px-0 pt-7 flex flex-col pb-2"
      headerComponent={
        <Fragment>
          <header className="flex items-center justify-between pt-6 pb-2.5">
            <div className="flex items-center gap-2.5">
              <MdSearch aria-hidden className="text-neon h-6 w-6" />

              <h1 className="text-sm text-white">{t('title')}</h1>
            </div>

            <IconButton
              aria-label={t('closeButtonLabel')}
              icon={<MdClose aria-hidden className="fill-gray-100" />}
              size="md"
              compacted
              onClick={modalEraseWrapper()}
            />
          </header>

          <Separator />
        </Fragment>
      }
      {...TestHelper.buildTestObject('search-modal')}
    >
      <Input
        placeholder={t('inputPlaceholder')}
        className="placeholder:text-gray-100"
        contentClassName="bg-gray-300/30 mb-7"
        containerClassName="w-full"
        rightElement={<TbSearch aria-hidden className="text-neon h-6 w-6" />}
        onChange={handleChange}
        value={actionData.search}
        clearable
        autoFocus
        maxLength={200}
        {...TestHelper.buildTestObject('search-input')}
      />

      {match(actionData)
        .with({ isSearching: true }, () => (
          <Loader containerClassName="grow items-center" className="h-10 w-10 text-gray-300" />
        ))
        .with({ foundActions: undefined }, () => (
          <div className="mb-8 flex grow items-center justify-center gap-2.5">
            <TbSearch aria-hidden className="h-10 w-10 text-gray-300" />
            <h2 className="text-2xl text-gray-300">{t('idleResultDescription')}</h2>
          </div>
        ))
        .with({ foundActions: [] }, () => (
          <div className="flex grow items-center justify-center">
            <h2 className="text-2xl text-gray-300">{t('emptyResultDescription')}</h2>
          </div>
        ))
        .otherwise(({ foundActions }) => (
          <div className="flex min-h-0 grow flex-col">
            <h2 className="py-2.5 text-sm text-gray-100">{t('resultDescription')}</h2>

            <ul className="flex min-h-0 grow flex-col overflow-auto">
              {foundActions!.map((action, index) => (
                <li key={`search-action-${index}`} className="w-full">
                  <Button
                    onClick={() => handleClick(action)}
                    className="w-full"
                    variant="text"
                    textClassName="text-left"
                    label={action.label}
                    colorSchema="white"
                    leftIcon={<TbHelp aria-hidden className="text-blue h-5 w-5" />}
                    rightIcon={<MdChevronRight aria-hidden className="h-5 w-5 text-white" />}
                    {...TestHelper.buildTestObject(`search-item-${index}`)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </CenterModalLayout>
  )
}

export default SearchModal
