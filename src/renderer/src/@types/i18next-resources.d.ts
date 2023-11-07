interface Resources {
  common: {
    general: {
      continue: 'Continue'
    }
    wallet: {
      importedName: 'Imported Wallet'
      firstWalletName: 'My First Wallet'
      firstWalletNameBackupFile: 'My First Wallet Backup'
      firstWalletNameBackupFileTitle: 'YOUR MNEMONIC PHRASE:'
    }
    account: {
      defaultName: 'Account {{accountNumber}}'
    }
  }
  components: {
    sidebar: {
      portfolio: 'Portfolio'
      wallets: 'Wallets'
      settings: 'Settings'
      logout: 'Logout'
      send: 'Send'
      receive: 'Receive'
      nfts: 'NFTs'
      contacts: 'Contacts'
      news: 'News'
      mobile: 'Mobile app'
      link: {
        isNew: 'New'
      }
    }
    walletSelect: {
      title: 'Wallets'
      placeholder: 'Select a wallet...'
      createWalletButtonLabel: 'Create New wallet'
    }
  }
  modals: {
    import: {
      title: 'Import'
      subtitle: 'IMPORT'
      description: 'Enter an address, encrypted key or private key'
      inputPlaceholder: 'Please ender an address or key...'
      buttonContinueLabel: 'Continue'
      errors: {
        invalid: 'Invalid text'
        empty: 'Please enter some text'
        allAddressesAlreadyImported: 'All addresses are already imported'
      }
    }
  }
  pages: {
    welcome: {
      title: 'Welcome to Neon Wallet'
      skipSecurityButtonLabel: 'Skip security'
      setupSecurityButtonLabel: 'Setup security'
    }
    securitySetup: {
      title: 'Welcome to Neon Wallet'
      steps: ['Create Password', 'Confirm Password', 'Complete']
    }
    securitySetupStep1: {
      formTitle: 'Please create a password to secure your wallet'
      passwordPlaceholder: 'Create a password'
      passwordError: 'Password must be at least {{length}} characters long'
    }
    securitySetupStep2: {
      formTitle: 'Please confirm your password'
      confirmPasswordPlaceholder: 'Confirm your password'
      confirmPasswordError: 'Passwords do not match'
    }
    securitySetupStep3: {
      description: 'Your security setup is now complete, please back up your password below. Failure to backup may result in loss of access to your wallet'
      buttonDownloadLabel: 'Download backup'
      buttonPrintLabel: 'Print backup'
      buttonContinueLabel: 'Open your new wallet'
      firstWalletName: 'My First Wallet'
    }
    portfolio: {
      title: 'Portfolio'
      buttonRefreshLabel: 'Refresh'
    }
    login: {
      title: 'Welcome to Neon Wallet'
      loginPassword: 'Login Password'
      passwordPlaceholder: 'Please enter your password'
      buttonLoginLabel: 'Login'
      invalidPassword: 'Invalid password'
    }
    wallets: {
      title: 'Wallets'
      addAccountButtonLabel: 'Add Account'
      editWalletButtonLabel: 'Edit Wallet'
      reorderAccountsButtonLabel: 'Reorder Accounts'
      buttonRefreshLabel: 'Refresh'
      addWatchAccountButtonLabel: 'Add Watch'
      importButtonLabel: 'Import'
      newWalletButtonLabel: 'New Wallet'
      manageButtonLabel: 'Manage'
      reorder: {
        cancelButtonLabel: 'Cancel'
        saveButtonLabel: 'Save'
      }
    }
  }
}

export default Resources
