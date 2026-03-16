import {
  ChangeEvent,
  cloneElement,
  forwardRef,
  type JSX,
  MouseEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { FieldActionsMenu } from '@renderer/components/FieldActionsMenu'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import MdCancel from '@renderer/assets/images/md-cancel.svg?react'
import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import MdContentPasteGo from '@renderer/assets/images/md-content-paste-go.svg?react'
import MdVisibility from '@renderer/assets/images/md-visibility.svg?react'
import MdVisibilityOff from '@renderer/assets/images/md-visibility-off.svg?react'

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
  type?: 'text' | 'password' | 'number' | 'email'
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
      ClipboardHelper.write(internalRef.current?.value || '')
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

      if (!!internalRef.current && internalRef.current.type !== 'number') {
        internalRef.current.setSelectionRange(internalRef.current.value.length, internalRef.current.value.length)
      }
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
        {label && <label className="mb-2 block text-xs font-bold text-gray-100 uppercase">{label}</label>}

        <div
          aria-disabled={disabled}
          className={StyleHelper.mergeStyles(
            'bg-asphalt flex w-full cursor-text items-center gap-x-1.5 rounded-sm px-5 font-medium text-white ring-2 ring-transparent outline-hidden transition-colors placeholder:text-white/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
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
                  'min-w-5 min-h-5 max-w-5 max-h-5': compacted,
                  'min-w-6 min-h-6 max-w-6 max-h-6': !compacted,
                },
                leftIcon.props.className
              ),
            })}

          <FieldActionsMenu
            value={['string', 'number'].includes(typeof props.value) ? props.value!.toString() : ''}
            disabled={disabled}
            readOnly={readOnly}
            onChange={setValue}
          >
            <input
              ref={internalRef}
              className={StyleHelper.mergeStyles(
                'w-full grow [appearance:textfield] bg-transparent outline-hidden disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                className
              )}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
              onChange={handleChange}
              type={realType}
              spellCheck="false"
              autoComplete="off"
              readOnly={readOnly}
              disabled={disabled}
              {...props}
              {...TestHelper.buildTestObject(testId)}
            />
          </FieldActionsMenu>

          {(loading || isTypePassword || pastable || copyable || clearable || rightElement) && (
            <div className={StyleHelper.mergeStyles('flex items-center gap-x-2', actionsClassName)}>
              {loading && <Loader className="mr-1 h-4 w-4" />}

              {isTypePassword && (
                <IconButton
                  icon={hidden ? <MdVisibility aria-hidden /> : <MdVisibilityOff aria-hidden />}
                  onClick={toggleHidden}
                  type="button"
                  disabled={disabled}
                  compacted
                />
              )}

              {pastable && (
                <IconButton
                  aria-label={tCommonGeneral('pasteFromClipboard')}
                  icon={<MdContentPasteGo aria-hidden />}
                  onClick={handlePaste}
                  colorSchema="neon"
                  type="button"
                  disabled={disabled}
                  compacted
                />
              )}

              {copyable && (
                <IconButton
                  icon={<MdContentCopy aria-hidden />}
                  onClick={handleCopyInput}
                  colorSchema="neon"
                  type="button"
                  compacted
                  disabled={disabled}
                />
              )}

              {clearable && (
                <IconButton
                  icon={<MdCancel aria-hidden />}
                  type="button"
                  onClick={clear}
                  compacted
                  disabled={disabled}
                />
              )}

              {rightElement}
            </div>
          )}
        </div>

        {match({ errorMessage, hint })
          .with({ errorMessage: P.when(value => !!value && typeof value === 'string') }, () => (
            <span className="text-pink mt-1 block truncate text-xs" {...TestHelper.buildTestObject(testId, 'error')}>
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
