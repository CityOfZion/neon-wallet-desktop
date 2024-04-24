import { FormEvent, MouseEvent, useCallback, useMemo, useRef, useState } from 'react'
import { TUseActionsActionState, TUseActionsChanged, TUseActionsData, TUseActionsErrors } from '@renderer/@types/hooks'
import { cloneDeep } from 'lodash'

export const useActions = <T extends TUseActionsData>(initialData: T) => {
  const initialState = useMemo(() => {
    const initialDataKeys = Object.keys(initialData) as (keyof T)[]

    return {
      isValid: false,
      isActing: false,
      hasActed: false,
      errors: {} as TUseActionsErrors<T>,
      changed: initialDataKeys.reduce(
        (acc, key) => ({ ...acc, [key]: !!initialData[key] }),
        {} as TUseActionsChanged<T>
      ),
    }
  }, [initialData])

  const [actionData, setPrivateActionData] = useState<T>(initialData)
  const [actionState, setPrivateActionState] = useState<TUseActionsActionState<T>>(initialState)

  const actionDataRef = useRef<T>(actionData)
  const actionStateRef = useRef<TUseActionsActionState<T>>(actionState)

  const setState = useCallback(
    (
      values:
        | Partial<TUseActionsActionState<T>>
        | ((prev: TUseActionsActionState<T>) => Partial<TUseActionsActionState<T>>)
    ) => {
      let newValues: Partial<TUseActionsActionState<T>>

      if (typeof values === 'function') {
        newValues = values(actionStateRef.current)
      } else {
        newValues = values
      }

      setPrivateActionState(prev => ({ ...prev, ...newValues }))
      actionStateRef.current = { ...actionStateRef.current, ...newValues }
    },
    []
  )

  const checkIsValid = useCallback(() => {
    const hasSomeError = Object.keys(actionStateRef.current.errors).length > 0
    const hasSomeNotChanged = Object.values(actionStateRef.current.changed).some(value => value !== true)
    if (hasSomeError || hasSomeNotChanged) {
      setState({ isValid: false })
      return
    }

    setState({ isValid: true })
  }, [setState])

  const clearErrors = useCallback(
    (key?: keyof T | (keyof T)[]) => {
      let newErrors = {} as TUseActionsErrors<T>
      const keys = key ? (Array.isArray(key) ? key : [key]) : undefined

      if (keys) {
        newErrors = cloneDeep(actionStateRef.current.errors)
        keys.forEach(k => {
          delete newErrors[k]
        })
      }

      setState({ errors: newErrors })
      checkIsValid()
    },
    [setState, checkIsValid]
  )

  const setData = useCallback(
    (values: Partial<T> | ((prev: T) => Partial<T>)) => {
      let newValues: Partial<T>

      if (typeof values === 'function') {
        newValues = values(actionDataRef.current)
      } else {
        newValues = values
      }

      setPrivateActionData({ ...actionDataRef.current, ...newValues })
      actionDataRef.current = { ...actionDataRef.current, ...newValues }

      setState(prev => ({
        hasActed: false,
        changed: {
          ...prev.changed,
          ...Object.keys(newValues).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>),
        },
      }))

      clearErrors(Object.keys(newValues) as (keyof T)[])
    },
    [clearErrors, setState]
  )

  const setDataFromEventWrapper = useCallback(
    (key: keyof T) => {
      return (event: any) => {
        let value: string
        if (typeof event === 'object' && event.target.value) {
          value = event.target.value
        } else {
          value = event
        }

        setData({ [key]: value } as Partial<T>)
      }
    },
    [setData]
  )

  const setError = useCallback(
    (key: keyof T, error: string) => {
      setState(prev => ({ errors: { ...prev.errors, [key]: error } }))
      checkIsValid()
    },
    [setState, checkIsValid]
  )

  const handleAct = useCallback((callback: (data: T) => void | Promise<void>) => {
    return async (event: FormEvent | MouseEvent) => {
      event.preventDefault()

      try {
        setPrivateActionState(prev => ({ ...prev, isActing: true }))
        await callback(actionDataRef.current)
      } finally {
        setPrivateActionState(prev => ({ ...prev, isActing: false, hasActed: true }))
      }
    }
  }, [])

  const reset = useCallback(() => {
    setPrivateActionData(initialData)
    actionDataRef.current = initialData
  }, [initialData])

  return { actionData, setData, setError, setDataFromEventWrapper, clearErrors, actionState, handleAct, reset }
}
