# Neon Wallet Desktop

**Our New NEON Wallet Desktop** is a fast, secure, and user-friendly cryptocurrency wallet, designed to empower users with an enhanced experience for managing their digital assets across multiple blockchains.

## Features

- **Ethereum & NEO X Support**: Manage both Ethereum and NEO assets seamlessly within the same wallet.
- **New Product Design**: Enjoy a fresh, modern design focused on usability and aesthetics.
- **Common Platform Code**: Unified codebase across all supported platforms, ensuring consistent performance and faster updates.
- **Multi-Wallet Architecture**: Easily manage multiple wallets from a single interface, perfect for users with diverse asset portfolios.
- **Enhanced Interface Customization**: Tailor your wallet experience with customizable themes and layouts.
- **Global Login**: Securely log in to all your wallets with a single global login, simplifying access and management.
- **Account Import Scanning**: Effortlessly import accounts from various sources with our smart scanning feature.
- **Improved WalletConnect Experience**: A more seamless and reliable integration with WalletConnect, enhancing your interaction with decentralized applications.

## Getting Started

### Installation

1. **Download the latest release** from the [Releases](https://github.com/CityOfZion/neon-wallet-desktop/releases/latest) page.
2. **Install** the application on your platform:
   - **Windows**: Download the `.exe` installer and follow the installation wizard.
   - **macOS**: Download the `.dmg` file, open it, and drag NEON to your Applications folder (this is an universal build, compatible with both Intel and ARM devices).
   - **Linux**: Download the `.deb` or `.AppImage` installer and follow the installation wizard.

## Roadmap
We are continuously working to improve NEON 3 Wallet. Check out our [Roadmap](https://medium.com/proof-of-working/coz-presents-the-neon-wallet-roadmap-0a092742709e) for upcoming features and enhancements.


## Community and Support
Join our community to stay updated with the latest news and developments:

[Discord](https://discord.gg/M7jGtEpjH4) - For support and community engagement.


## Technologies Used
- **React**
- **TypeScript**
- **Electron**

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
VITE_UNLIMIT_MERCHANT_ID=your-unlimit-merchant-id
VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL=your-unlimit-buy-iframe-url
VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL=your-unlimit-sell-iframe-url

VITE_CLICK_UP_KEY=your-clickup-api-key
VITE_CLICK_UP_LIST_ID=your-clickup-list-id
VITE_CLICK_UP_ASSIGNEE_ID=your-clickup-assignee-id

VITE_GA_MEASUREMENT_ID=your-google-analytics-measurement-id
VITE_GA_API_SECRET=your-google-analytics-api-secret
```

## Translation

This project uses a [Claude Code](https://claude.ai/code) skill to keep all locale files up-to-date.

**Prerequisites**
- Claude Code CLI installed and authenticated

**Running translations**

After modifying English locale files in `src/shared/locales/en/`, run:

```bash
npm run translate
```

The skill detects changed keys via `git diff`, then translates additions, updates, and deletions into all supported languages (`de`, `pt-br`, `zh`, `zh-Hant`).

**Important**
- Only modify files in the `en/` locale directory — other language files are managed automatically
- Commit your English changes before running the script (it will refuse to run if non-English locales have uncommitted changes)
