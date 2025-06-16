import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'

export const NEO3_GAS_TOKEN = BSNeo3Constants.NATIVE_ASSETS.find(({ symbol }) => symbol === 'GAS')!
export const NEO3_NEO_TOKEN = BSNeo3Constants.NATIVE_ASSETS.find(({ symbol }) => symbol === 'NEO')!

export const NEO_LEGACY_GAS_TOKEN = BSNeoLegacyConstants.NATIVE_ASSETS.find(({ symbol }) => symbol === 'GAS')!
export const NEO_LEGACY_NEO_TOKEN = BSNeoLegacyConstants.NATIVE_ASSETS.find(({ symbol }) => symbol === 'NEO')!
