import type { CreateCredentialOptions } from 'electron-webauthn-mac'
import webauthn from 'electron-webauthn-mac'

import { mainApi } from '@shared/api/main'
import type { TIpcMainBaseOptions } from '@shared/types/api'

export class MainWebAuthHelper {
  static async #onCreateCredential({ args }: TIpcMainBaseOptions<CreateCredentialOptions>) {
    const credential = await webauthn.createCredential({ ...args })
    return credential
  }

  static setupHandlers() {
    mainApi.listenAsync('webAuth:createCredential', this.#onCreateCredential.bind(this))
  }
}
