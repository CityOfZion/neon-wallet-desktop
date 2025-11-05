import { lazy as reactLazy } from 'react'

import type { ComponentType, LazyExoticComponent } from 'react'

export class LazyHelper {
  static delayedLazy<T extends ComponentType<any>>(
    importCallback: () => Promise<{ default: T }>,
    delayMs: number = 0
  ): LazyExoticComponent<T> {
    return reactLazy<T>(() => {
      return new Promise<{ default: T }>(resolve => {
        requestIdleCallback(() => {
          setTimeout(() => {
            resolve(importCallback())
          }, delayMs)
        })
      })
    })
  }
}
