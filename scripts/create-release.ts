import { exec } from 'child_process'
import { format } from 'date-fns'
import fs from 'fs/promises'
import inquirer from 'inquirer'
import path from 'path'
import { promisify } from 'util'

import packageJson from '../package.json'
import changelog from '../src/shared/locales/en/changelog.json'

const execAsync = promisify(exec)

async function verifyIfGitIsClean() {
  const { stdout } = await execAsync('git status --porcelain')

  if (stdout) {
    console.error('Git is not clean. It may cause issues with the release process.')
    process.exit(1)
  }
}

async function verifyIfTagAlreadyExists(version: string) {
  try {
    await execAsync(`git rev-parse v${version}`)
    return true
  } catch {
    return false
  }
}

async function bumpVersion(npmCliBumpType: string) {
  let newVersion: string | null = null

  do {
    const { stdout } = await execAsync(
      `npm version ${npmCliBumpType} --no-git-tag-version --no-commit-hooks --preid rc --json`
    )
    const bumpedVersion = stdout.slice(1, -1)

    const tagAlreadyExists = await verifyIfTagAlreadyExists(bumpedVersion)

    if (tagAlreadyExists) {
      const { value } = await inquirer.prompt([
        {
          type: 'confirm',
          message: `The tag v${bumpedVersion} already exists. Do you want to run again?`,
          name: 'value',
        },
      ])

      if (!value) {
        await execAsync('git restore .')
        console.error(
          `All changes were reverted, try to remove the tag 'v${bumpedVersion}' manually and run again.\nIt may cause issues to trigger the CI process.`
        )
        process.exit(0)
      }

      continue
    }

    newVersion = bumpedVersion
  } while (!newVersion)

  return newVersion
}

async function createOrUpdateChangelog(bumpedVersion: string, actualVersion: string) {
  let lastChangelog: (typeof changelog.notes)[0] | undefined

  // Should not get the last changelog if the actual version is a stable version
  if (actualVersion.includes('rc')) {
    const lastChangelogIndex = changelog.notes.findIndex(item => item.version === actualVersion)
    lastChangelog = changelog.notes[lastChangelogIndex]

    if (lastChangelogIndex >= 0) {
      changelog.notes.splice(lastChangelogIndex, 1)
    }
  }

  const { value } = await inquirer.prompt([
    {
      type: 'editor',
      message: 'Enter the release notes',
      name: 'value',
      default: JSON.stringify(
        {
          version: bumpedVersion,
          date: format(new Date(), 'dd MMM yyyy'),
          changes: lastChangelog?.changes ?? [],
          url: `https://github.com/CityOfZion/neon-wallet-desktop/releases/tag/v${bumpedVersion}`,
        },
        null,
        2
      ),
      postfix: '.json',
    },
  ])

  const updatedChangelog = JSON.parse(value)

  changelog.notes.unshift(updatedChangelog)

  await fs.writeFile(
    path.join(__dirname, '../src/shared/locales/en/changelog.json'),
    JSON.stringify(changelog, null, 2),
    'utf-8'
  )
}

async function main() {
  await verifyIfGitIsClean()

  const { value: selectedReleaseType } = await inquirer.prompt([
    {
      type: 'select',
      message: 'What type of release do you wanna create?',
      default: 'release-candidate',
      choices: [
        { value: 'release-candidate', name: 'Release Candidate' },
        { value: 'stable', name: 'Stable' },
      ],
      name: 'value',
    },
  ])

  const packageJsonVersion = packageJson.version
  const actualVersionIsReleaseCandidate = packageJsonVersion.includes('rc')
  const isReleaseCandidate = selectedReleaseType === 'release-candidate'

  let npmCliBumpType: string

  if (isReleaseCandidate && actualVersionIsReleaseCandidate) {
    npmCliBumpType = 'prerelease'
  } else {
    const { value: selectedBumpType } = await inquirer.prompt([
      {
        type: 'select',
        message: 'Select the bump type',
        name: 'value',
        loop: false,
        default: 'patch',
        choices: [
          { value: 'patch', name: 'Patch' },
          { value: 'minor', name: 'Minor' },
          { value: 'major', name: 'Major' },
        ],
      },
    ])

    npmCliBumpType = isReleaseCandidate ? `pre${selectedBumpType}` : selectedBumpType
  }

  const bumpedVersion = await bumpVersion(npmCliBumpType)

  await createOrUpdateChangelog(bumpedVersion, packageJsonVersion)

  await execAsync('git add .')
  await execAsync(`git commit -m "Bump version to ${bumpedVersion}" --no-verify`)
  await execAsync('git push origin HEAD --no-verify')

  await execAsync(`git tag v${bumpedVersion}`)
  await execAsync(`git push origin v${bumpedVersion}`)

  console.log(`\n\nVersion ${bumpedVersion} released successfully`)
}

process.on('uncaughtException', error => {
  console.error('\n' + error)
  process.exit(1)
})

main()
