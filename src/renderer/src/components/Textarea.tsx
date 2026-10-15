import { ChangeEventHandler, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { useTranslation } from 'react-i18next'

import { FieldActionsMenu } from '@renderer/components/FieldActionsMenu'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdCancel from '@renderer/assets/images/md-cancel.svg?react'
import MdContentPasteGo from '@renderer/assets/images/md-content-paste-go.svg?react'

import { IconButton } from './IconButton'
import { Tooltip } from './Tooltip'

type TProps = React.ComponentProps<'textarea'> & {
  containerClassName?: string
  errorMessage?: string
  error?: boolean
  clearable?: boolean
  pastable?: boolean
  compacted?: boolean
  multiline?: boolean
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TProps>(
  (
    {
      className,
      containerClassName,
      errorMessage,
      pastable,
      error,
      compacted,
      clearable,
      onChange,
      multiline = true,
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
    const internalRef = useRef<HTMLTextAreaElement>(null)

    const setValue = (value: string) => {
      if (!internalRef.current) return

      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!

      nativeSetter.call(internalRef.current, value)

      const event = new Event('input', { bubbles: true })

      internalRef.current.dispatchEvent(event)
      internalRef.current.focus()
    }

    const handlePaste = async () => {
      setValue(await navigator.clipboard.readText())
    }

    const clear = () => {
      setValue('')
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
      onChange?.(event)
    }

    useImperativeHandle(ref, () => internalRef.current!, [])

    useEffect(() => {
      if (!internalRef.current) return

      internalRef.current.style.height = '0px'

      const scrollHeight = internalRef.current.scrollHeight

      internalRef.current.style.height = scrollHeight + 'px'
    }, [multiline, props.value])

    return (
      <div className={StyleHelper.mergeStyles('w-full', containerClassName)}>
        {label && <label className="mb-2 block text-xs font-bold text-gray-100 uppercase">{label}</label>}

        <div
          className={StyleHelper.mergeStyles(
            'bg-asphalt flex w-full items-center gap-x-1 rounded-sm px-5 font-medium text-white ring-2 ring-transparent outline-hidden placeholder:text-white/50',
            {
              'py-1.25 text-xs': compacted,
              'py-3 text-sm': !compacted,
              'ring-pink': !!errorMessage || error === true,
              'focus:ring-neon': !errorMessage || error === false,
              'pr-3': clearable,
            }
          )}
        >
          <FieldActionsMenu
            value={['string', 'number'].includes(typeof props.value) ? props.value!.toString() : ''}
            disabled={disabled}
            readOnly={props.readOnly}
            onChange={setValue}
          >
            <textarea
              className={StyleHelper.mergeStyles(
                'min-h-4 w-full grow resize-none overflow-hidden bg-transparent outline-hidden',
                {
                  'whitespace-nowrap': !multiline,
                },
                className
              )}
              ref={internalRef}
              rows={1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              disabled={disabled}
              {...props}
            />
          </FieldActionsMenu>

          {pastable && (
            <Tooltip title={disabled ? '' : tCommonGeneral('pasteFromClipboard')}>
              <IconButton
                aria-label={tCommonGeneral('pasteFromClipboard')}
                type="button"
                colorSchema="neon"
                compacted
                disabled={disabled}
                icon={<MdContentPasteGo aria-hidden className="text-neon" />}
                onClick={handlePaste}
              />
            </Tooltip>
          )}

          {clearable && (
            <Tooltip title={tCommonGeneral('clear')}>
              <IconButton
                aria-label={tCommonGeneral('clear')}
                icon={<MdCancel aria-hidden />}
                type="button"
                onClick={clear}
                compacted
              />
            </Tooltip>
          )}
        </div>

        {errorMessage && <span className="text-pink mt-1 block text-xs">{errorMessage}</span>}
      </div>
    )
  }
)
