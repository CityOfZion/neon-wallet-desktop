import { cloneElement, forwardRef, MouseEvent, useImperativeHandle, useRef, useState } from 'react'
import { MdCancel, MdContentCopy, MdContentPasteGo, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { IconButton } from './IconButton'
import { Loader } from './Loader'

export type TInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'ref'> & {
  containerClassName?: string
  errorMessage?: string
  error?: boolean
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
      type,
      errorMessage,
      error,
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
    const internalRef = useRef<HTMLInputElement>(null)
    const [hidden, setHidden] = useState(type === 'password')
    const realType = type === 'password' ? (hidden ? 'password' : 'text') : type

    const toggleHidden: React.MouseEventHandler<HTMLButtonElement> = event => {
      event.stopPropagation()
      setHidden(prev => !prev)
    }

    const handleCopyInput = () => {
      navigator.clipboard.writeText(internalRef.current?.value ?? '')
    }

    const handlePaste = async () => {
      if (internalRef.current) {
        const text = await navigator.clipboard.readText()
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        nativeInputValueSetter.call(internalRef.current, text)
        const inputEvent = new Event('input', { bubbles: true })
        internalRef.current.dispatchEvent(inputEvent)
        internalRef.current.focus()
      }
    }

    const clear = () => {
      if (internalRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        nativeInputValueSetter.call(internalRef.current, '')
        const inputEvent = new Event('input', { bubbles: true })
        internalRef.current.dispatchEvent(inputEvent)
        internalRef.current.focus()
      }
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
              'pr-3': type === 'password' || clearable,
            },
            className
          )}
          onClick={handleContainerClick}
        >
          {leftIcon &&
            cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles(
                {
                  'w-5 h-5': compacted,
                  'w-6 h-6': !compacted,
                },
                leftIcon.props.className
              ),
            })}

          <input
            ref={internalRef}
            className={StyleHelper.mergeStyles(
              'bg-transparent disabled:cursor-not-allowed flex-grow outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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

          <div className="flex items-center gap-x-2">
            {loading && <Loader className="w-4 h-4 mr-1" />}

            {type === 'password' && (
              <IconButton
                icon={hidden ? <MdVisibility /> : <MdVisibilityOff />}
                onClick={toggleHidden}
                type="button"
                disabled={props.disabled}
                compacted
              />
            )}

            {pastable && (
              <IconButton
                icon={<MdContentPasteGo />}
                onClick={handlePaste}
                colorSchema="neon"
                type="button"
                disabled={props.disabled}
                compacted
              />
            )}

            {copyable && (
              <IconButton
                icon={<MdContentCopy />}
                onClick={handleCopyInput}
                colorSchema="neon"
                type="button"
                compacted
                disabled={props.disabled}
              />
            )}

            {clearable && (
              <IconButton icon={<MdCancel />} type="button" onClick={clear} compacted disabled={props.disabled} />
            )}

            {buttons}
          </div>
        </div>

        {errorMessage && (
          <span className="block mt-1 text-xs text-pink" {...TestHelper.buildTestObject(testId, 'error')}>
            {errorMessage}
          </span>
        )}
      </div>
    )
  }
)
