import { lazy } from 'react'

import { createHashRouter, redirect } from 'react-router'

import PrivatePage from './pages/Private'
import PublicPage from './pages/Public'
import RootPage from './pages/Root'

const BuyAndSellTokensPage = lazy(() => import('@renderer/routes/pages/BuyAndSellTokens'))
const ForgottenPasswordPage = lazy(() => import('@renderer/routes/pages/ForgottenPassword'))
const ForgottenPasswordConfirmPage = lazy(() => import('@renderer/routes/pages/ForgottenPassword/Confirm'))

const ContactsPage = lazy(() => import('./pages/Contacts'))
const ForgottenPasswordSuccessPage = lazy(() => import('./pages/ForgottenPassword/Success'))
const LoginPage = lazy(() => import('./pages/Login'))
const LoginKeySelectAccountPage = lazy(() => import('./pages/LoginKeySelectAccount'))
const Neo3NeoXBridgePage = lazy(() => import('./pages/Neo3NeoXBridge'))
const PortfolioPage = lazy(() => import('./pages/Portfolio'))
const PortfolioActivityPage = lazy(() => import('./pages/Portfolio/Activity'))
const PortfolioConnectionsPage = lazy(() => import('./pages/Portfolio/Connections'))
const PortfolioOverviewPage = lazy(() => import('./pages/Portfolio/Overview'))
const ReceivePage = lazy(() => import('./pages/Receive'))
const SendPage = lazy(() => import('./pages/Send'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const SettingsBackupWalletPage = lazy(() => import('./pages/Settings/SettingsBackupWallet'))
const SettingsChangePasswordPage = lazy(() => import('./pages/Settings/SettingsChangePassword'))
const ChangePasswordStep1Page = lazy(() => import('./pages/Settings/SettingsChangePassword/ChangePasswordStep1'))
const ChangePasswordStep2Page = lazy(() => import('./pages/Settings/SettingsChangePassword/ChangePasswordStep2'))
const ChangePasswordStep3Page = lazy(() => import('./pages/Settings/SettingsChangePassword/ChangePasswordStep3'))
const SettingsCurrencyPage = lazy(() => import('./pages/Settings/SettingsCurrency'))
const SettingsEncryptKeyPage = lazy(() => import('./pages/Settings/SettingsEncryptKey'))
const SettingsLanguagePage = lazy(() => import('./pages/Settings/SettingsLanguage'))
const SettingsMigrateWalletsPage = lazy(() => import('./pages/Settings/SettingsMigrateWallets'))
const SettingsMobileAppPage = lazy(() => import('./pages/Settings/SettingsMobileApp'))
const SettingsNetworkPage = lazy(() => import('./pages/Settings/SettingsNetwork'))
const SettingsRecoverWalletPage = lazy(() => import('./pages/Settings/SettingsRecoverWallet'))
const SettingsReleaseNotesPage = lazy(() => import('./pages/Settings/SettingsReleaseNotes'))
const SwapPage = lazy(() => import('./pages/Swap'))
const VoteNeo3Page = lazy(() => import('./pages/VoteNeo3'))
const WalletsPage = lazy(() => import('./pages/Wallets'))
const AccountConnectionsPage = lazy(() => import('./pages/Wallets/AccountConnection'))
const AccountNftListPage = lazy(() => import('./pages/Wallets/AccountNftList'))
const AccountOverviewPage = lazy(() => import('./pages/Wallets/AccountOverview'))
const AccountTokensListPage = lazy(() => import('./pages/Wallets/AccountTokensList'))
const AccountTransactionsListPage = lazy(() => import('./pages/Wallets/AccountTransactionsList'))
const WelcomePage = lazy(() => import('./pages/Welcome'))
const LoginPasswordImportWalletPage = lazy(() => import('./pages/Login/LoginPasswordImportWallet'))
const LoginPasswordSecuritySetupPage = lazy(() => import('./pages/Login/LoginPasswordSecuritySetup'))

export const pagesRouter = createHashRouter([
  {
    path: '/',
    element: <RootPage />,
    children: [
      {
        element: <PrivatePage />,
        children: [
          {
            path: 'portfolio',
            element: <PortfolioPage />,
            children: [
              {
                path: '',
                loader: () => redirect('overview'),
              },
              {
                path: 'overview',
                element: <PortfolioOverviewPage />,
              },
              {
                path: 'activity',
                element: <PortfolioActivityPage />,
              },
              {
                path: 'connections',
                element: <PortfolioConnectionsPage />,
              },
            ],
          },
          {
            path: 'wallets',
            element: <WalletsPage />,
            children: [
              {
                path: '',
                loader: () => redirect('overview'),
              },
              {
                path: 'overview',
                element: <AccountOverviewPage />,
              },
              {
                path: 'tokens',
                element: <AccountTokensListPage />,
              },
              {
                path: 'nfts',
                element: <AccountNftListPage />,
              },
              {
                path: 'transactions',
                element: <AccountTransactionsListPage />,
              },
              {
                path: 'connections',
                element: <AccountConnectionsPage />,
              },
            ],
          },
          {
            path: 'send',
            element: <SendPage />,
          },
          {
            path: 'receive',
            element: <ReceivePage />,
          },
          {
            path: 'swap',
            element: <SwapPage />,
          },
          {
            path: 'buy-and-sell-tokens/:tab?',
            element: <BuyAndSellTokensPage />,
          },
          {
            path: 'vote-neo3',
            element: <VoteNeo3Page />,
          },
          {
            path: 'neo3-neox-bridge',
            element: <Neo3NeoXBridgePage />,
          },
          {
            path: 'contacts',
            element: <ContactsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
            children: [
              { path: '', loader: () => redirect('personalisation/network-configuration') },
              {
                path: 'personalisation',
                children: [
                  {
                    path: 'network-configuration',
                    element: <SettingsNetworkPage />,
                  },
                  {
                    path: 'currency',
                    element: <SettingsCurrencyPage />,
                  },
                  {
                    path: 'release-notes',
                    element: <SettingsReleaseNotesPage />,
                  },
                  {
                    path: 'mobile-app',
                    element: <SettingsMobileAppPage />,
                  },
                  {
                    path: 'language',
                    element: <SettingsLanguagePage />,
                  },
                ],
              },
              {
                path: 'security',
                children: [
                  {
                    path: 'change-password',
                    element: <SettingsChangePasswordPage />,
                    children: [
                      {
                        path: '1?',
                        element: <ChangePasswordStep1Page />,
                      },
                      {
                        path: '2',
                        element: <ChangePasswordStep2Page />,
                      },
                      {
                        path: '3',
                        element: <ChangePasswordStep3Page />,
                      },
                    ],
                  },
                  {
                    path: 'encrypt-key',
                    element: <SettingsEncryptKeyPage />,
                  },
                  {
                    path: 'recover-wallet',
                    element: <SettingsRecoverWalletPage />,
                  },
                  {
                    path: 'backup-wallet',
                    element: <SettingsBackupWalletPage />,
                  },
                  {
                    path: 'migrate-accounts',
                    element: <SettingsMigrateWalletsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        element: <PublicPage />,
        children: [
          {
            path: 'welcome',
            element: <WelcomePage />,
          },
          {
            path: 'login/:loginType?',
            element: <LoginPage />,
          },
          {
            path: 'login-security-setup/:step?',
            element: <LoginPasswordSecuritySetupPage />,
          },
          {
            path: 'login-import-wallet-setup/:step?',
            element: <LoginPasswordImportWalletPage />,
          },
          {
            path: 'login-key-select-account',
            element: <LoginKeySelectAccountPage />,
          },
          {
            path: 'forgotten-password',
            children: [
              {
                path: 'form',
                element: <ForgottenPasswordPage />,
              },
              {
                path: 'confirm',
                element: <ForgottenPasswordConfirmPage />,
              },
              {
                path: 'success',
                element: <ForgottenPasswordSuccessPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
