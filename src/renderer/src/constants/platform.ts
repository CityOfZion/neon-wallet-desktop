const PLATFORM = window.electron.process.platform
export const IS_LINUX = PLATFORM === 'linux'
export const IS_MAC = PLATFORM === 'darwin'
