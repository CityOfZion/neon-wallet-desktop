import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'

import type { TBlockchainServiceKey } from '@shared/types/blockchain'

// If you need to add more constants, please verify if they fit better in other helper or in your own helper.
export class ConstantsHelper {
  static readonly cozWebsiteUrl = 'https://coz.io'
  static readonly mobileAppStoreUrl = 'https://apps.apple.com/my/app/neon-wallet-mobile/id1530111452'
  static readonly mobilePlayStoreUrl = 'https://play.google.com/store/apps/details?id=io.cityofzion.neon&hl=en_US&gl=US'
  static readonly latestReleaseUrl = 'https://github.com/CityOfZion/neon-wallet-desktop/releases/latest'
  static readonly cozDiscordUrl = 'https://discord.gg/M7jGtEpjH4'
  static readonly neonIconsUrl = 'https://raw.githubusercontent.com/CityOfZion/neon-icons/main'

  static readonly defaultNetworkProfileId = 'default'

  static fraudulentTokenHashesByBlockchain: Map<TBlockchainServiceKey, Set<string>> = new Map([
    ['neo3', new Set(['0x42e6b0379e39a428362e08cf9d7e40903cdb0fe7'])],
  ])

  static voteNeo3CozPubKey = '02946248f71bdf14933e6735da9867e81cc9eea0b5895329aa7f71e7745cf40659'

  static tipPercentageBn = BSBigNumberHelper.fromNumber('0.01') // 1%
  static tipConfigByBlockchain = new Map([
    [
      'neo3',
      {
        address: 'Na6zQi9giUtftPGbLeFn9nfuWjEMP98Trq',
        token: BSNeo3Constants.GAS_TOKEN,
        minBn: BSBigNumberHelper.fromNumber('0.00000001'), // GAS has 8 decimals
      },
    ],
  ])
}
