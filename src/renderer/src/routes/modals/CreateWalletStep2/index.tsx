import { useEffect, useMemo, useRef, useState } from 'react'

import _ from 'lodash'
import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'

import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'

import type { TModalState } from '@shared/types/modal'

const CreateWalletStep2Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step2' })
  const { words } = useModalState<TModalState<'create-wallet-step-2'>>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  const shuffledWords = useMemo(() => _.shuffle(words), [words])
  const [pressedWordsIndex, setPressedWordsIndex] = useState<number[]>([])

  const isActive = (wordIndex: number) => pressedWordsIndex.some(pressedWord => pressedWord === wordIndex)

  const isDisabled = () => pressedWordsIndex.length !== shuffledWords.length

  const handlePress = (wordIndex: number) => {
    const isWordActive = isActive(wordIndex)

    setPressedWordsIndex(prevState =>
      isWordActive ? prevState.filter(state => state !== wordIndex) : [...prevState, wordIndex]
    )
  }

  const validateAndNext = async () => {
    const mountedPressedWords = pressedWordsIndex.map(wordIndex => shuffledWords[wordIndex]).join(' ')
    const mountedWords = words.join(' ')

    if (mountedPressedWords !== mountedWords) {
      ToastHelper.error({ message: t('tryAgain') })
      setPressedWordsIndex([])
      return
    }

    modalNavigate('create-wallet-step-3', { state: { words } })
  }

  useEffect(() => {
    if (pressedWordsIndex.length === shuffledWords.length) {
      nextButtonRef.current?.focus()
    }
  }, [pressedWordsIndex.length, shuffledWords.length])

  return (
    <CreateWalletModalLayout>
      <header className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-x-2.5">
          <MdLooksTwo aria-hidden className="text-blue h-4.5 w-4.5" />
          <h2 className="text-sm">{t('title')}</h2>
        </div>
        <div className="text-blue text-sm">{t('step2of4')}</div>
      </header>

      <Separator className="mb-9 min-h-px" />

      <div className="flex h-[84%] w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col gap-6">
          <div className="text-xs text-gray-100">{t('description')}</div>
          <div className="mx-5 grid min-h-24 grid-cols-4 justify-center gap-x-8 gap-y-4 rounded-sm px-5 py-5">
            {shuffledWords.map((word, index) => (
              <Button
                clickableProps={{
                  className: isActive(index) ? 'bg-gray-100 text-asphalt border-none hover:bg-gray-100' : '',
                }}
                key={`${word}-${index}`}
                label={word}
                onClick={() => handlePress(index)}
                variant="outlined"
                flat
                type="button"
              />
            ))}
          </div>
          <Banner type="info" message={t('warning')} className="mx-10" />
        </div>

        <div className="flex gap-2">
          <Button label={t('backButtonLabel')} colorSchema="gray" flat wide onClick={modalNavigateWrapper(-1)} />

          <Button
            className="w-48"
            label={t('nextButtonLabel')}
            flat
            disabled={isDisabled()}
            onClick={validateAndNext}
            ref={nextButtonRef}
          />
        </div>
      </div>
    </CreateWalletModalLayout>
  )
}

export default CreateWalletStep2Modal
