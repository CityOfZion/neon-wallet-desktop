const packageJson = require('../package.json')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const process = require('process')

const version = packageJson.version

const BUILDS = [
  {
    platformName: 'MacOS universal',
    fileName: `NeonWallet-${packageJson.version}.dmg`,
    platform: 'mac',
  },
  {
    platform: 'win',
    platformName: 'Windows 64-bit',
    fileName: `NeonWallet-${packageJson.version}.exe`,
  },
]

function downloadBuilds() {
  try {
    console.log('Downloading builds from GitHub...')

    const patternBuilds = BUILDS.map(build => `--pattern '${build.fileName}'`).join(' ')

    execSync(
      `gh release download v${version} --repo cityofzion/neon-wallet-desktop --dir temp --clobber ${patternBuilds}`
    )
    console.log('Builds downloaded successfully!')
  } catch (error) {
    console.error(`Error to download builds from GitHub: \nError: ${error}\n`)
    process.exit(1)
  }
}

function getCurrentReleaseNotes() {
  try {
    console.log('Getting current release notes...')

    let notes = ''

    const actualRelease = execSync(`gh release view v${version} --repo cityofzion/neon-wallet-desktop --json body`)
    if (actualRelease) {
      const actualReleaseJson = JSON.parse(actualRelease.toString('utf-8'))
      if (actualReleaseJson.body) {
        notes = actualReleaseJson.body
      }
    }

    return notes
  } catch (error) {
    console.error(`Error to get current release notes: \nError: ${error}\n`)
    process.exit(1)
  }
}

function verifyIfChecksumsAlreadyExists(currentReleaseNotes = '') {
  if (currentReleaseNotes.includes('## **Build checksums:**')) {
    console.log('Checksums already exists in release notes!')
    process.exit(0)
  }
}

function generateChecksums() {
  try {
    console.log('Generating checksums...')

    let output = '## **Build checksums:**'

    for (let index = 0; index < BUILDS.length; index++) {
      const { fileName, platformName, platform } = BUILDS[index]

      const hash = crypto.createHash('sha256')
      const fileBuffer = fs.readFileSync(path.resolve(__dirname, '..', 'temp', fileName))

      hash.update(fileBuffer)

      const checksum = hash.digest('hex')

      output += `\n\n### **${platformName}**:\n&emsp;Checksum: \`${checksum}\``

      if (platform === 'win') {
        output += `\n&emsp;Command: \`certutil -hashfile ${fileName} SHA256\``
      } else {
        output += `\n&emsp;Command: \`sha256sum ${fileName}\``
      }
    }

    console.log('Checksums generated successfully!')

    return output
  } catch (error) {
    console.error(`Error to generate checksum: \nError: ${error}\n`)
    process.exit(1)
  }
}

function uploadChecksums(checksums = '', currentReleaseNotes = '') {
  try {
    console.log('Uploading checksums to GitHub...')

    checksums = currentReleaseNotes + '\n\n\n' + checksums

    execSync(`gh release edit v${version} --notes '${checksums}' --repo cityofzion/neon-wallet-desktop`)
    console.log('Checksums uploaded successfully!')
  } catch (error) {
    console.error(`Error to upload checksums to GitHub: \nError: ${error}\n`)
    process.exit(1)
  }
}

downloadBuilds()
const currentReleaseNotes = getCurrentReleaseNotes()
verifyIfChecksumsAlreadyExists(currentReleaseNotes)
const checksums = generateChecksums()
uploadChecksums(checksums, currentReleaseNotes)
