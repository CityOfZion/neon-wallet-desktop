import { Crisp } from 'crisp-sdk-web'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'

const FOCUSABLE_ELEMENTS =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

const CHAT_ELEMENT_ID = '#crisp-chatbox'

export class CrispHelper {
  private static cachedTabIndices = new Map<HTMLElement, string | null>()

  private static trapFocus() {
    document.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS).forEach(element => {
      if (element.closest(CHAT_ELEMENT_ID)) return

      CrispHelper.cachedTabIndices.set(element, element.getAttribute('tabindex'))

      element.setAttribute('tabindex', '-1')
    })
  }

  private static releaseFocus() {
    CrispHelper.cachedTabIndices.forEach((original, element) => {
      if (original === null) {
        element.removeAttribute('tabindex')

        return
      }

      element.setAttribute('tabindex', original)
    })

    CrispHelper.cachedTabIndices.clear()
  }

  static setup() {
    if (!SharedEnvHelper.VITE_CRISP_WEBSITE_ID) return

    Crisp.configure(SharedEnvHelper.VITE_CRISP_WEBSITE_ID)

    Crisp.chat.hide()

    Crisp.chat.onChatOpened(CrispHelper.trapFocus)

    Crisp.chat.onChatClosed(() => {
      CrispHelper.releaseFocus()

      Crisp.chat.hide()
    })

    const observer = new MutationObserver(() => {
      const chatbox = document.querySelector(CHAT_ELEMENT_ID)

      if (!chatbox) return

      observer.disconnect()

      chatbox.addEventListener('click', event => {
        if (event.target === chatbox) Crisp.chat.close()
      })
    })

    observer.observe(document.body, { childList: true, subtree: false })
  }

  static open() {
    Crisp.chat.show()
    Crisp.chat.open()
  }
}
