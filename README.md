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

# Translation Script Guide

This project includes an automated translation script to keep all locale files up-to-date across supported languages using the Google Cloud Translation API v3.

## Prerequisites

- **Google Cloud Project** with the Cloud Translation API enabled
- **Service Account Key** (JSON) with permissions for the Translation API

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
GCP_PROJECT_ID=your-google-cloud-project-id
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your-service-account.json
```

### Google Cloud Setup
- Go to the [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one.
- Enable the Cloud Translation API for your project.
- Create a Service Account with the "Cloud Translation API User" role.
- Download the service account key as a JSON file.
- Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of this file.

## Setting a Budget to Prevent Unexpected Charges
To ensure you never exceed the free tier of the Google Cloud Translation API and avoid unexpected charges, you can set a budget and configure alerts in your Google Cloud project.

### How to Set Up a Budget and Alerts
- Go to [Google Cloud Billing Budgets & alerts](https://console.cloud.google.com/billing/budgets)
- Make sure you are in the correct billing account for your project.
- Click **"CREATE BUDGET"**.
- Name your budget (e.g., "Translation API Free Tier Limit").
- Set the **Scope** to your project or all projects as needed.
- Enter the amount that matches the free tier for the Translation API (e.g., $0.01 if you want to be alerted before any charges, or the USD equivalent of the free tier quota).
- Set alert thresholds (e.g., 50%, 90%, 100% of your budget).
- Add your email to receive notifications when your usage approaches or exceeds your budget.
- Review your settings and click **"Finish"**.

### Important Notes

- Only modify translation files in the `en` (English) locale directory
- The script will fail if there are uncommitted changes in other locale directories to prevent accidental overwrites
- New translation keys are automatically added to all languages
- Removed keys are automatically deleted from all languages
- Updated translations are re-translated to maintain consistency
