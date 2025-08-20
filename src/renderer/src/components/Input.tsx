import { ChangeEvent, cloneElement, forwardRef, MouseEvent, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MdCancel from '@renderer/assets/images/md-cancel.svg?react'
import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import MdContentPasteGo from '@renderer/assets/images/md-content-paste-go.svg?react'
import MdVisibility from '@renderer/assets/images/md-visibility.svg?react'
import MdVisibilityOff from '@renderer/assets/images/md-visibility-off.svg?react'
import { FieldActionsMenu } from '@renderer/components/FieldActionsMenu'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { match, P } from 'ts-pattern'

import { IconButton } from './IconButton'
import { Loader } from './Loader'

export type TInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'ref'> & {
  containerClassName?: string
  contentClassName?: string
  actionsClassName?: string
  errorMessage?: string
  error?: boolean
  hint?: string
  clearable?: boolean
  compacted?: boolean
  copyable?: boolean
  pastable?: boolean
  type?: 'text' | 'password' | 'number'
  leftIcon?: JSX.Element
  rightElement?: JSX.Element
  loading?: boolean
  label?: string
  testId?: string
  onChangeValue?: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, TInputProps>(
  (
    {
      className,
      containerClassName,
      contentClassName,
      actionsClassName,
      type,
      errorMessage,
      error,
      hint,
      compacted,
      clearable,
      pastable,
      leftIcon,
      readOnly,
      copyable,
      loading,
      label,
      testId,
      rightElement,
      onChangeValue,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
    const isTypePassword = type === 'password'
    const internalRef = useRef<HTMLInputElement>(null)
    const [hidden, setHidden] = useState(isTypePassword)
    const realType = isTypePassword ? (hidden ? 'password' : 'text') : type

    const isDisabled = disabled || loading

    const toggleHidden: React.MouseEventHandler<HTMLButtonElement> = event => {
      event.stopPropagation()
      setHidden(prev => !prev)
    }

    const setValue = (value: string) => {
      if (!internalRef.current) return

      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!

      nativeSetter.call(internalRef.current, value)

      const event = new Event('input', { bubbles: true })

      internalRef.current.dispatchEvent(event)
      internalRef.current.focus()
    }

    const handleCopyInput = () => {
      UtilsHelper.copyToClipboard(internalRef.current?.value ?? '')
    }

    const handlePaste = async () => {
      setValue(await navigator.clipboard.readText())
    }

    const clear = () => {
      setValue('')
    }

    const handleContainerClick = () => {
      if (readOnly) return

      internalRef.current?.focus()
      internalRef.current?.setSelectionRange(internalRef.current?.value.length, internalRef.current?.value.length)
    }

    const handleClick = (event: MouseEvent<HTMLInputElement>) => {
      event.stopPropagation()
      props.onClick?.(event)
    }

    const handleMouseDown = (event: MouseEvent<HTMLInputElement>) => {
      if (readOnly) {
        event.preventDefault()
      }

      props.onMouseDown?.(event)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChangeValue?.(event.target.value)
      onChange?.(event)
    }

    useImperativeHandle(ref, () => internalRef.current!, [])

    return (
      <div className={StyleHelper.mergeStyles('relative w-full', containerClassName)}>
        {label && <label className="mb-2 block text-xs font-bold uppercase text-gray-100">{label}</label>}

        <div
          aria-disabled={isDisabled}
          className={StyleHelper.mergeStyles(
            'flex w-full cursor-text items-center gap-x-1.5 rounded bg-asphalt px-5 font-medium text-white outline-none ring-2 ring-transparent transition-colors placeholder:text-white/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
            {
              'h-8.5 py-1.5 text-xs': compacted,
              'h-12 py-2 text-sm': !compacted,
              'ring-pink': !!errorMessage || error === true,
              'focus:ring-neon': !errorMessage || error === false,
              'pl-3': !!leftIcon,
              'pr-3': isTypePassword || clearable || pastable,
            },
            contentClassName
          )}
          onClick={handleContainerClick}
        >
          {leftIcon &&
            cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles(
                'text-gray-300 pointer-events-none',
                {
                  'min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem] max-h-[1.25rem]': compacted,
                  'min-w-[1.5rem] min-h-[1.5rem] max-w-[1.5rem] max-h-[1.5rem]': !compacted,
                },
                leftIcon.props.className
              ),
            })}

          <FieldActionsMenu
            value={['string', 'number'].includes(typeof props.value) ? props.value!.toString() : ''}
            disabled={isDisabled}
            readOnly={readOnly}
            onChange={setValue}
          >
            <input
              ref={internalRef}
              className={StyleHelper.mergeStyles(
                'w-full flex-grow bg-transparent outline-none [appearance:textfield] disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                className
              )}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
              onChange={handleChange}
              type={realType}
              spellCheck="false"
              autoComplete="off"
              readOnly={readOnly}
              disabled={isDisabled}
              {...props}
              {...TestHelper.buildTestObject(testId)}
            />
          </FieldActionsMenu>

          {(loading || isTypePassword || pastable || copyable || clearable || rightElement) && (
            <div className={StyleHelper.mergeStyles('flex items-center gap-x-2', actionsClassName)}>
              {loading && <Loader className="mr-1 h-4 w-4" />}

              {isTypePassword && (
                <IconButton
                  icon={hidden ? <MdVisibility aria-hidden={true} /> : <MdVisibilityOff aria-hidden={true} />}
                  onClick={toggleHidden}
                  type="button"
                  disabled={isDisabled}
                  compacted
                />
              )}

              {pastable && (
                <IconButton
                  aria-label={tCommonGeneral('pasteFromClipboard')}
                  icon={<MdContentPasteGo aria-hidden={true} />}
                  onClick={handlePaste}
                  colorSchema="neon"
                  type="button"
                  disabled={isDisabled}
                  compacted
                />
              )}

              {copyable && (
                <IconButton
                  icon={<MdContentCopy aria-hidden={true} />}
                  onClick={handleCopyInput}
                  colorSchema="neon"
                  type="button"
                  compacted
                  disabled={isDisabled}
                />
              )}

              {clearable && (
                <IconButton
                  icon={<MdCancel aria-hidden={true} />}
                  type="button"
                  onClick={clear}
                  compacted
                  disabled={isDisabled}
                />
              )}

              {rightElement}
            </div>
          )}
        </div>

        {match({ errorMessage, hint })
          .with({ errorMessage: P.when(value => !!value && typeof value === 'string') }, () => (
            <span className="mt-1 block truncate text-xs text-pink" {...TestHelper.buildTestObject(testId, 'error')}>
              {errorMessage}
            </span>
          ))
          .with({ hint: P.when(value => !!value && typeof value === 'string') }, () => (
            <span className="mt-1 block truncate text-xs text-gray-300" {...TestHelper.buildTestObject(testId, 'hint')}>
              {hint}
            </span>
          ))
          .otherwise(() => null)}
      </div>
    )
  }
)
