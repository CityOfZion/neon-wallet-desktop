import { type ComponentProps, lazy, Suspense } from 'react'

import { createHashRouter } from 'react-router'

import { Loader } from '@renderer/components/Loader'
import { ScreenLoader } from '@renderer/components/ScreenLoader'
import { Sidebar } from '@renderer/components/Sidebar'

import PrivatePage from './pages/Private'
import PublicPage from './pages/Public'
import RootPage from './pages/Root'

const BuyAndSellTokensPage = lazy(() => import('@renderer/routes/pages/BuyAndSellTokens'))
const ForgottenPasswordPage = lazy(() => import('@renderer/routes/pages/ForgottenPassword'))
const ForgottenPasswordConfirmPage = lazy(() => import('@renderer/routes/pages/ForgottenPassword/Confirm'))

const ContactsPage = lazy(() => import('./pages/Contacts'))
const ForgottenPasswordSuccessPage = lazy(() => import('./pages/ForgottenPassword/Success'))
const LoginPage = lazy(() => import('./pages/Login'))
const LoginHardwarePage = lazy(() => import('./pages/Login/LoginHardware'))
const LoginKeyPage = lazy(() => import('./pages/Login/LoginKey'))
const LoginKeySelectAccountPage = lazy(() => import('./pages/LoginKeySelectAccount'))
const LoginPasswordPage = lazy(() => import('./pages/Login/LoginPassword'))
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
const LoginPasswordImportWalletStep1Page = lazy(() => import('./pages/Login/LoginPasswordImportWallet/Step1'))
const LoginPasswordImportWalletStep2Page = lazy(() => import('./pages/Login/LoginPasswordImportWallet/Step2'))
const LoginPasswordImportWalletStep3Page = lazy(() => import('./pages/Login/LoginPasswordImportWallet/Step3'))
const LoginPasswordImportWalletStep4Page = lazy(() => import('./pages/Login/LoginPasswordImportWallet/Step4'))
const LoginPasswordImportWalletStep5Page = lazy(() => import('./pages/Login/LoginPasswordImportWallet/Step5'))
const LoginPasswordSecuritySetupPage = lazy(() => import('./pages/Login/LoginPasswordSecuritySetup'))
const LoginPasswordSecuritySetupStep1Page = lazy(() => import('./pages/Login/LoginPasswordSecuritySetup/Step1'))
const LoginPasswordSecuritySetupStep2Page = lazy(() => import('./pages/Login/LoginPasswordSecuritySetup/Step2'))
const LoginPasswordSecuritySetupStep3Page = lazy(() => import('./pages/Login/LoginPasswordSecuritySetup/Step3'))

const PublicPageSuspense = (props: ComponentProps<typeof Suspense>) => {
  return <Suspense {...props} fallback={<ScreenLoader />} />
}

const PrivatePageSuspense = (props: ComponentProps<typeof Suspense>) => {
  return (
    <Suspense
      {...props}
      fallback={
        <div className="flex h-full w-full">
          <Sidebar className="pointer-events-none" />
          <ScreenLoader />
        </div>
      }
    />
  )
}

const ChildrenPageSuspense = (props: ComponentProps<typeof Suspense>) => {
  return <Suspense {...props} fallback={<Loader containerClassName="h-full items-center text-white" />} />
}

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
            element: (
              <PrivatePageSuspense key="portfolio">
                <PortfolioPage />
              </PrivatePageSuspense>
            ),
            children: [
              {
                path: 'overview',
                element: (
                  <ChildrenPageSuspense key="portfolio.overview">
                    <PortfolioOverviewPage />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: 'activity',
                element: (
                  <ChildrenPageSuspense key="portfolio.activity">
                    <PortfolioActivityPage />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: 'connections',
                element: (
                  <ChildrenPageSuspense key="portfolio.connection">
                    <PortfolioConnectionsPage />
                  </ChildrenPageSuspense>
                ),
              },
            ],
          },
          {
            path: 'wallets',
            element: (
              <PrivatePageSuspense key="wallets">
                <WalletsPage />
              </PrivatePageSuspense>
            ),
            children: [
              {
                path: ':id',
                children: [
                  {
                    path: 'overview',
                    element: (
                      <ChildrenPageSuspense key="wallets.overview">
                        <AccountOverviewPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'tokens',
                    element: (
                      <ChildrenPageSuspense key="wallets.tokens">
                        <AccountTokensListPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'nfts',
                    element: (
                      <ChildrenPageSuspense key="wallets.nfts">
                        <AccountNftListPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'transactions',
                    element: (
                      <ChildrenPageSuspense key="wallets.transactions">
                        <AccountTransactionsListPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'connections',
                    element: (
                      <ChildrenPageSuspense key="wallets.connections">
                        <AccountConnectionsPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: 'send',
            element: (
              <PrivatePageSuspense key="send">
                <SendPage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'receive',
            element: (
              <PrivatePageSuspense key="receive">
                <ReceivePage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'swap',
            element: (
              <PrivatePageSuspense key="swap">
                <SwapPage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'buy-and-sell-tokens',
            element: (
              <PrivatePageSuspense key="buy-and-sell-tokens">
                <BuyAndSellTokensPage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'vote-neo3',
            element: (
              <PrivatePageSuspense key="vote-neo3">
                <VoteNeo3Page />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'neo3-neox-bridge',
            element: (
              <PrivatePageSuspense key="neo3-neox-bridge">
                <Neo3NeoXBridgePage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'contacts',
            element: (
              <PrivatePageSuspense key="contacts">
                <ContactsPage />
              </PrivatePageSuspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <PrivatePageSuspense key="settings">
                <SettingsPage />
              </PrivatePageSuspense>
            ),
            children: [
              {
                path: 'personalisation',
                children: [
                  {
                    path: 'network-configuration',
                    element: (
                      <ChildrenPageSuspense key="settings.network">
                        <SettingsNetworkPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'currency',
                    element: (
                      <ChildrenPageSuspense key="settings.currency">
                        <SettingsCurrencyPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'release-notes',
                    element: (
                      <ChildrenPageSuspense key="settings.release-notes">
                        <SettingsReleaseNotesPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'mobile-app',
                    element: (
                      <ChildrenPageSuspense key="settings.mobile-app">
                        <SettingsMobileAppPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'language',
                    element: (
                      <ChildrenPageSuspense key="settings.language">
                        <SettingsLanguagePage />
                      </ChildrenPageSuspense>
                    ),
                  },
                ],
              },
              {
                path: 'security',
                children: [
                  {
                    path: 'change-password',
                    element: (
                      <ChildrenPageSuspense key="settings.change-password">
                        <SettingsChangePasswordPage />
                      </ChildrenPageSuspense>
                    ),
                    children: [
                      {
                        path: '1?',
                        element: (
                          <ChildrenPageSuspense key="settings.change-password.1">
                            <ChangePasswordStep1Page />
                          </ChildrenPageSuspense>
                        ),
                      },
                      {
                        path: '2',
                        element: (
                          <ChildrenPageSuspense key="settings.change-password.2">
                            <ChangePasswordStep2Page />
                          </ChildrenPageSuspense>
                        ),
                      },
                      {
                        path: '3',
                        element: (
                          <ChildrenPageSuspense key="settings.change-password.3">
                            <ChangePasswordStep3Page />
                          </ChildrenPageSuspense>
                        ),
                      },
                    ],
                  },
                  {
                    path: 'encrypt-key',
                    element: (
                      <ChildrenPageSuspense key="settings.encrypt-key">
                        <SettingsEncryptKeyPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'recover-wallet',
                    element: (
                      <ChildrenPageSuspense key="settings.recover-wallet">
                        <SettingsRecoverWalletPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'backup-wallet',
                    element: (
                      <ChildrenPageSuspense key="settings.backup-wallet">
                        <SettingsBackupWalletPage />
                      </ChildrenPageSuspense>
                    ),
                  },
                  {
                    path: 'migrate-accounts',
                    element: (
                      <ChildrenPageSuspense key="settings.migrate-accounts">
                        <SettingsMigrateWalletsPage />
                      </ChildrenPageSuspense>
                    ),
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
            element: (
              <PublicPageSuspense key="welcome">
                <WelcomePage />
              </PublicPageSuspense>
            ),
          },
          {
            path: 'login',
            element: (
              <PublicPageSuspense key="login">
                <LoginPage />
              </PublicPageSuspense>
            ),
            children: [
              {
                path: 'password',
                element: (
                  <ChildrenPageSuspense key="login.password">
                    <LoginPasswordPage />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: 'hardware',
                element: (
                  <ChildrenPageSuspense key="login.hardware">
                    <LoginHardwarePage />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: 'key',
                element: (
                  <ChildrenPageSuspense key="login.key">
                    <LoginKeyPage />
                  </ChildrenPageSuspense>
                ),
              },
            ],
          },
          {
            path: 'login-security-setup',
            element: (
              <PublicPageSuspense key="login-security-setup">
                <LoginPasswordSecuritySetupPage />
              </PublicPageSuspense>
            ),
            children: [
              {
                path: '1',
                element: (
                  <ChildrenPageSuspense key="login-security-setup.1">
                    <LoginPasswordSecuritySetupStep1Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '2',
                element: (
                  <ChildrenPageSuspense key="login-security-setup.2">
                    <LoginPasswordSecuritySetupStep2Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '3',
                element: (
                  <ChildrenPageSuspense key="login-security-setup.3">
                    <LoginPasswordSecuritySetupStep3Page />
                  </ChildrenPageSuspense>
                ),
              },
            ],
          },
          {
            path: 'login-import-wallet-setup',
            element: (
              <PublicPageSuspense key="login-import-wallet-setup">
                <LoginPasswordImportWalletPage />
              </PublicPageSuspense>
            ),
            children: [
              {
                path: '1',
                element: (
                  <ChildrenPageSuspense key="login-import-wallet-setup.1">
                    <LoginPasswordImportWalletStep1Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '2',
                element: (
                  <ChildrenPageSuspense key="login-import-wallet-setup.2">
                    <LoginPasswordImportWalletStep2Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '3',
                element: (
                  <ChildrenPageSuspense key="login-import-wallet-setup.3">
                    <LoginPasswordImportWalletStep3Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '4',
                element: (
                  <ChildrenPageSuspense key="login-import-wallet-setup.4">
                    <LoginPasswordImportWalletStep4Page />
                  </ChildrenPageSuspense>
                ),
              },
              {
                path: '5',
                element: (
                  <ChildrenPageSuspense key="login-import-wallet-setup.5">
                    <LoginPasswordImportWalletStep5Page />
                  </ChildrenPageSuspense>
                ),
              },
            ],
          },
          {
            path: 'login-key-select-account',
            element: (
              <PublicPageSuspense key="login-key-select-account">
                <LoginKeySelectAccountPage />
              </PublicPageSuspense>
            ),
          },
          {
            path: 'forgotten-password',
            children: [
              {
                path: 'form',
                element: (
                  <PublicPageSuspense key="forgotten-password.form">
                    <ForgottenPasswordPage />
                  </PublicPageSuspense>
                ),
              },
              {
                path: 'confirm',
                element: (
                  <PublicPageSuspense key="forgotten-password.confirm">
                    <ForgottenPasswordConfirmPage />
                  </PublicPageSuspense>
                ),
              },
              {
                path: 'success',
                element: (
                  <PublicPageSuspense key="forgotten-password.success">
                    <ForgottenPasswordSuccessPage />
                  </PublicPageSuspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
])
