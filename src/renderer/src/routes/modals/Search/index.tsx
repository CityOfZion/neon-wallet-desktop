import { ChangeEvent, useCallback, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { MdChevronRight, MdClose, MdSearch } from 'react-icons/md'
import { TbHelp, TbSearch } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { SynonymsHelper } from '@renderer/helpers/SynonymsHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { search } from 'fast-fuzzy'
import { debounce } from 'lodash'
import { removeStopwords } from 'stopword'
import { match } from 'ts-pattern'
import winkWebModel from 'wink-eng-lite-web-model'
import WinkNLP from 'wink-nlp'

import { functionsByActionId } from './functionByActionId'

const nlp = WinkNLP(winkWebModel)

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

export const SearchModal = () => {
  const { modalEraseWrapper } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'search' })
  const { t: tSearch } = useTranslation('search')
  const modalActions = useModalNavigate()
  const pageNavigate = useNavigate()

  const { actionData, setData } = useActions<TActionData>({ isSearching: false, search: '', foundActions: undefined })

  const searchActions = useMemo<TSearchAction[]>(() => {
    const actions = tSearch('actions', { returnObjects: true })
    return actions
  }, [tSearch])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce(async (text: string) => {
      const doc = nlp.readDoc(text.toLowerCase())
      const tokens = doc.tokens().filter(t => t.out(nlp.its.type) === 'word')
      const verbs = tokens.filter(token => token.out(nlp.its.pos) === 'VERB').out(nlp.its.lemma as any) as string[]
      const nonVerbs = removeStopwords(
        tokens.filter(token => token.out(nlp.its.pos) !== 'VERB').out(nlp.its.lemma as any) as string[]
      )

      try {
        if (verbs.length === 0 && nonVerbs.length === 0) {
          setData({ foundActions: [] })
          return
        }

        const foundActions: TSearchAction[] = []

        for (const action of searchActions) {
          const allVerbsSynonyms = await SynonymsHelper.getAllSynonyms(action.verbs)
          const allNonVerbsSynonyms = await SynonymsHelper.getAllSynonyms(action.nonVerbs)

          const allVerbs = [...action.verbs, ...allVerbsSynonyms]
          const allNonVerbs = [...action.nonVerbs, ...allNonVerbsSynonyms]

          const hasVerb = verbs.some(value => search(value, allVerbs).length > 0)
          const hasNonVerb = nonVerbs.some(item => search(item, allNonVerbs).length > 0)

          if (verbs.length > 0 && nonVerbs.length > 0) {
            if (hasVerb && hasNonVerb) {
              foundActions.push(action)
            }
          } else if (nonVerbs.length > 0 && hasNonVerb) {
            foundActions.push(action)
          } else if (verbs.length > 0 && hasVerb) {
            foundActions.push(action)
          }
        }

        setData({ foundActions })
      } catch (error) {
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
      console.error(error)
      ToastHelper.error({ message: t('errors.errorToExecute') })
    }
  }

  return (
    <CenterModalLayout
      contentClassName="px-0 pt-7 flex flex-col"
      headerComponent={
        <Fragment>
          <header className="flex items-center justify-between pt-6 pb-2.5">
            <div className="flex gap-2.5 items-center">
              <MdSearch aria-hidden className="w-6 h-6 text-neon" />

              <h1 className="text-sm text-white">{t('title')}</h1>
            </div>

            <IconButton
              aria-label={t('closeButtonLabel')}
              icon={<MdClose aria-hidden className="fill-gray-100" />}
              size="md"
              compacted
              onClick={modalEraseWrapper('center')}
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
        rightElement={<TbSearch aria-hidden className="w-6 h-6 text-neon" />}
        onChange={handleChange}
        value={actionData.search}
        clearable
        autoFocus
        {...TestHelper.buildTestObject('search-input')}
      />

      {match(actionData)
        .with({ isSearching: true }, () => (
          <Loader containerClassName="flex-grow items-center" className="w-10 h-10 text-gray-300" />
        ))
        .with({ foundActions: undefined }, () => (
          <div className="flex items-center gap-2.5  flex-grow justify-center">
            <TbSearch aria-hidden className="w-10 h-10 text-gray-300" />
            <h2 className="text-2xl text-gray-300">{t('idleResultDescription')}</h2>
          </div>
        ))
        .with({ foundActions: [] }, () => (
          <div className="flex items-center flex-grow justify-center">
            <h2 className="text-2xl text-gray-300">{t('emptyResultDescription')}</h2>
          </div>
        ))
        .otherwise(({ foundActions }) => (
          <div className="flex flex-col flex-grow min-h-0">
            <h2 className="text-sm text-gray-100 py-2.5">{t('resultDescription')}</h2>

            <ul className="flex flex-col flex-grow  min-h-0 overflow-auto">
              {foundActions!.map((action, index) => (
                <li key={`search-action-${index}`} className="w-full">
                  <Button
                    onClick={() => handleClick(action)}
                    className="w-full"
                    variant="text"
                    textClassName="text-left"
                    label={action.label}
                    colorSchema="white"
                    leftIcon={<TbHelp aria-hidden className="text-blue w-5 h-5" />}
                    rightIcon={<MdChevronRight aria-hidden className="w-5 h-5 text-white" />}
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
