import { BSBigHumanAmount, BSBigNumber, type TBSNetworkType, TBSToken } from '@cityofzion/blockchain-service'
import type { TBSServiceName } from '@cityofzion/bs-multichain'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'
import { BSStellarConstants } from '@cityofzion/bs-stellar'

type TTipConfig = {
  address: string
  token: TBSToken
  minBn: BSBigHumanAmount
}

// If you need to add more constants, please verify if they fit better in other helper or in your own helper.
export class ConstantsHelper {
  static readonly cozWebsiteUrl = 'https://coz.io'
  static readonly mobileAppStoreUrl = 'https://apps.apple.com/my/app/neon-wallet-mobile/id1530111452'
  static readonly mobilePlayStoreUrl = 'https://play.google.com/store/apps/details?id=io.cityofzion.neon'
  static readonly latestReleaseUrl = 'https://github.com/CityOfZion/neon-wallet-desktop/releases/latest'
  static readonly cozDiscordUrl = 'https://discord.gg/M7jGtEpjH4'
  static readonly neonIconsUrl = 'https://raw.githubusercontent.com/CityOfZion/neon-icons/main'

  static readonly fraudulentTokenHashesByBlockchain: Map<TBSServiceName, Set<string>> = new Map([
    ['neo3', new Set(['0x42e6b0379e39a428362e08cf9d7e40903cdb0fe7', '0x90591dbfddd3c5a8e8fd0b5c8eb4a904e13a4c32'])],
  ])

  static readonly bNeoTokenHash = BSNeo3Constants.EXTRA_TOKENS_BY_NETWORK_ID.mainnet!.find(
    token => token.symbol === 'bNEO'
  )!.hash

  static readonly neo3VoteCozPubKey = '02946248f71bdf14933e6735da9867e81cc9eea0b5895329aa7f71e7745cf40659'

  static tipPercentageBn = new BSBigNumber('0.01') // 1%
  static tipConfigByBlockchain = new Map<TBSServiceName, TTipConfig>([
    [
      'neo3',
      {
        address: 'Na6zQi9giUtftPGbLeFn9nfuWjEMP98Trq',
        token: BSNeo3Constants.GAS_TOKEN,
        minBn: new BSBigHumanAmount('0.00000001', BSNeo3Constants.GAS_TOKEN.decimals), // GAS has 8 decimals
      },
    ],
  ])

  static readonly stellarCreateAccountDocumentationUrl =
    'https://developers.stellar.org/docs/build/guides/transactions/create-account#create-account'

  static readonly stellarRecommendedTrustlineTokensByNetworkType: Partial<Record<TBSNetworkType, TBSToken[]>> = {
    mainnet: [
      {
        symbol: 'USDC',
        name: 'USDC',
        hash: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        decimals: BSStellarConstants.SAC_TOKEN_DECIMALS,
      },
      {
        symbol: 'EURC',
        name: 'EURC',
        hash: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
        decimals: BSStellarConstants.SAC_TOKEN_DECIMALS,
      },
    ],
    testnet: [
      {
        symbol: 'USDC',
        name: 'USDC',
        hash: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        decimals: BSStellarConstants.SAC_TOKEN_DECIMALS,
      },
      {
        symbol: 'EURC',
        name: 'EURC',
        hash: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
        decimals: BSStellarConstants.SAC_TOKEN_DECIMALS,
      },
    ],
  }

  static readonly isLinux = window.electron.process.platform === 'linux'
  static readonly isMac = window.electron.process.platform === 'darwin'
  static readonly isWindows = window.electron.process.platform === 'win32'
}
