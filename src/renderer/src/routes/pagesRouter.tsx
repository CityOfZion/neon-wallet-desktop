import { createRouteHandler } from '@renderer/libs/sentryReact'

import { AppPage } from './pages/AppPage'
import { ContactsPage } from './pages/Contacts'
import { LoginPage } from './pages/Login'
import { PortfolioPage } from './pages/Portfolio'
import { PortfolioActivityPage } from './pages/Portfolio/Activity'
import { PortfolioConnectionsPage } from './pages/Portfolio/Connections'
import { PortfolioOverviewPage } from './pages/Portfolio/Overview'
import { ReceiveYourAddress } from './pages/Receive'
import { RootPage } from './pages/Root'
import { SendPage } from './pages/Send'
import { SettingsPage } from './pages/Settings'
import { SettingsBackupWallet } from './pages/Settings/SettingsBackupWallet'
import { SettingsChangePasswordPage } from './pages/Settings/SettingsChangePassword'
import { ChangePasswordStep1 } from './pages/Settings/SettingsChangePassword/ChangePasswordStep1'
import { ChangePasswordStep2 } from './pages/Settings/SettingsChangePassword/ChangePasswordStep2'
import { ChangePasswordStep3 } from './pages/Settings/SettingsChangePassword/ChangePasswordStep3'
import { SettingsCurrency } from './pages/Settings/SettingsCurrency'
import { SettingsEncryptKeyPage } from './pages/Settings/SettingsEncryptKey'
import { SettingsMigrateWalletsPage } from './pages/Settings/SettingsMigrateWallets'
import { SettingsNetwork } from './pages/Settings/SettingsNetwork'
import { SettingsRecoverWallet } from './pages/Settings/SettingsRecoverWallet'
import { SettingsReleaseNotesPage } from './pages/Settings/SettingsReleaseNotes'
import { WalletsPage } from './pages/Wallets'
import { AccountConnections } from './pages/Wallets/AccountConnection'
import { AccountNftList } from './pages/Wallets/AccountNftList'
import { AccountOverview } from './pages/Wallets/AccountOverview'
import { AccountTokensList } from './pages/Wallets/AccountTokensList'
import { AccountTransactionsList } from './pages/Wallets/AccountTransactionsList'
import { WelcomePage } from './pages/Welcome'
import { WelcomeImportWalletPage } from './pages/WelcomeImportWallet'
import { WelcomeImportWalletStep1Page } from './pages/WelcomeImportWallet/Step1'
import { WelcomeImportWalletStep2Page } from './pages/WelcomeImportWallet/Step2'
import { WelcomeImportWalletStep3Page } from './pages/WelcomeImportWallet/Step3'
import { WelcomeImportWalletStep4Page } from './pages/WelcomeImportWallet/Step4'
import { WelcomeImportWalletStep5Page } from './pages/WelcomeImportWallet/Step5'
import { WelcomeSecuritySetupPage } from './pages/WelcomeSecuritySetup'
import { WelcomeSecuritySetupStep1Page } from './pages/WelcomeSecuritySetup/Step1'
import { WelcomeSecuritySetupStep2Page } from './pages/WelcomeSecuritySetup/Step2'
import { WelcomeSecuritySetupStep3Page } from './pages/WelcomeSecuritySetup/Step3'

const routeHandler = createRouteHandler()

export const pagesRouter = routeHandler([
  {
    path: '/',
    element: <RootPage />,
    children: [
      {
        path: 'app',
        element: <AppPage />,
        children: [
          {
            path: 'portfolio',
            element: <PortfolioPage />,
            children: [
              {
                path: 'overview?',
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
                path: ':address',
                children: [
                  {
                    path: 'overview?',
                    element: <AccountOverview />,
                  },
                  {
                    path: 'tokens',
                    element: <AccountTokensList />,
                  },
                  {
                    path: 'nfts',
                    element: <AccountNftList />,
                  },
                  {
                    path: 'transactions',
                    element: <AccountTransactionsList />,
                  },
                  {
                    path: 'connections',
                    element: <AccountConnections />,
                  },
                ],
              },
            ],
          },
          {
            path: 'send',
            element: <SendPage />,
          },
          {
            path: 'receive',
            element: <ReceiveYourAddress />,
          },
          {
            path: 'contacts',
            element: <ContactsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
            children: [
              {
                path: 'personalisation?',
                children: [
                  {
                    path: 'network-configuration?',
                    element: <SettingsNetwork />,
                  },
                  {
                    path: 'currency',
                    element: <SettingsCurrency />,
                  },
                  {
                    path: 'release-notes',
                    element: <SettingsReleaseNotesPage />,
                  },
                ],
              },
              {
                path: 'security',
                children: [
                  {
                    path: 'change-password?',
                    element: <SettingsChangePasswordPage />,
                    children: [
                      {
                        path: 'step-1?',
                        element: <ChangePasswordStep1 />,
                      },
                      {
                        path: 'step-2',
                        element: <ChangePasswordStep2 />,
                      },
                      {
                        path: 'step-3',
                        element: <ChangePasswordStep3 />,
                      },
                    ],
                  },
                  {
                    path: 'encrypt-key',
                    element: <SettingsEncryptKeyPage />,
                  },
                  {
                    path: 'recover-wallet',
                    element: <SettingsRecoverWallet />,
                  },
                  {
                    path: 'backup-wallet',
                    element: <SettingsBackupWallet />,
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
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'welcome-security-setup',
        element: <WelcomeSecuritySetupPage />,
        children: [
          {
            path: '1?',
            element: <WelcomeSecuritySetupStep1Page />,
          },
          {
            path: '2',
            element: <WelcomeSecuritySetupStep2Page />,
          },
          {
            path: '3',
            element: <WelcomeSecuritySetupStep3Page />,
          },
        ],
      },
      {
        path: 'welcome-import-wallet',
        element: <WelcomeImportWalletPage />,
        children: [
          {
            path: '1?',
            element: <WelcomeImportWalletStep1Page />,
          },
          {
            path: '2',
            element: <WelcomeImportWalletStep2Page />,
          },
          {
            path: '3',
            element: <WelcomeImportWalletStep3Page />,
          },
          {
            path: '4',
            element: <WelcomeImportWalletStep4Page />,
          },
          {
            path: '5',
            element: <WelcomeImportWalletStep5Page />,
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
])
