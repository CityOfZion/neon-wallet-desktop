import { cloneElement, forwardRef, MouseEvent, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdCancel, MdContentCopy, MdContentPasteGo, MdVisibility, MdVisibilityOff } from 'react-icons/md'
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
  loading?: boolean
  label?: string
  testId?: string
  buttons?: JSX.Element
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
      buttons,
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

    useImperativeHandle(ref, () => internalRef.current!, [])

    return (
      <div className={StyleHelper.mergeStyles('w-full relative', containerClassName)}>
        {label && <label className="block text-gray-100 text-xs uppercase mb-2 font-bold">{label}</label>}

        <div
          aria-disabled={props.disabled}
          className={StyleHelper.mergeStyles(
            'flex items-center gap-x-1.5 rounded bg-asphalt ring-2 ring-transparent w-full px-5 outline-none font-medium placeholder:text-white/50 text-white aria-disabled:opacity-50 aria-disabled:cursor-not-allowed transition-colors cursor-text',
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
            disabled={props.disabled}
            readOnly={readOnly}
            onChange={setValue}
          >
            <input
              ref={internalRef}
              className={StyleHelper.mergeStyles(
                'bg-transparent w-full disabled:cursor-not-allowed flex-grow outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                className
              )}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
              type={realType}
              spellCheck="false"
              autoComplete="off"
              readOnly={readOnly}
              {...props}
              {...TestHelper.buildTestObject(testId)}
            />
          </FieldActionsMenu>

          {(loading || isTypePassword || pastable || copyable || clearable || buttons) && (
            <div className={StyleHelper.mergeStyles('flex items-center gap-x-2', actionsClassName)}>
              {loading && <Loader className="w-4 h-4 mr-1" />}

              {isTypePassword && (
                <IconButton
                  icon={hidden ? <MdVisibility aria-hidden={true} /> : <MdVisibilityOff aria-hidden={true} />}
                  onClick={toggleHidden}
                  type="button"
                  disabled={props.disabled}
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
                  disabled={props.disabled}
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
                  disabled={props.disabled}
                />
              )}

              {clearable && (
                <IconButton
                  icon={<MdCancel aria-hidden={true} />}
                  type="button"
                  onClick={clear}
                  compacted
                  disabled={props.disabled}
                />
              )}

              {buttons}
            </div>
          )}
        </div>

        {match({ errorMessage, hint })
          .with({ errorMessage: P.when(value => !!value && typeof value === 'string') }, () => (
            <span className="block mt-1 text-xs text-pink" {...TestHelper.buildTestObject(testId, 'error')}>
              {errorMessage}
            </span>
          ))
          .with({ hint: P.when(value => !!value && typeof value === 'string') }, () => (
            <span className="block mt-1 text-xs text-gray-300" {...TestHelper.buildTestObject(testId, 'hint')}>
              {hint}
            </span>
          ))
          .otherwise(() => null)}
      </div>
    )
  }
)
