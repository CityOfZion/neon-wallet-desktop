import { exec } from 'child_process'
import { format } from 'date-fns'
import fs from 'fs/promises'
import inquirer from 'inquirer'
import path from 'path'
import { promisify } from 'util'

import packageJson from '../package.json'

const execAsync = promisify(exec)

process.on('uncaughtException', error => {
  console.error('\n' + error)
  process.exit(1)
})

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
  const { stdout } = await execAsync(
    `npm version ${npmCliBumpType} --no-git-tag-version --no-commit-hooks --preid rc --json`
  )

  return stdout.slice(1, -1)
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
  const actualVersionIsPreRelease = packageJsonVersion.includes('rc')
  const isReleaseCandidate = selectedReleaseType === 'release-candidate'

  let npmCliBumpType: string

  if (isReleaseCandidate && actualVersionIsPreRelease) {
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

  let newVersion: string | null = null

  do {
    const bumpedVersion = await bumpVersion(npmCliBumpType)
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

  if (!isReleaseCandidate) {
    const { value } = await inquirer.prompt([
      {
        type: 'editor',
        message: 'Enter the release notes',
        name: 'value',
        default: JSON.stringify(
          {
            version: newVersion,
            date: format(new Date(), 'dd MMM yyyy'),
            changes: [],
            url: `https://github.com/CityOfZion/neon-wallet-desktop/releases/tag/v${newVersion}`,
          },
          null,
          2
        ),
        postfix: '.json',
      },
    ])
    const releaseNotes = JSON.parse(value)

    const actualChangelog = await fs.readFile(path.join(__dirname, '../src/shared/locales/en/changelog.json'), 'utf-8')
    const parsedChangelog = JSON.parse(actualChangelog)

    parsedChangelog.notes.unshift(releaseNotes)

    await fs.writeFile(
      path.join(__dirname, '../src/shared/locales/en/changelog.json'),
      JSON.stringify(parsedChangelog, null, 2),
      'utf-8'
    )
  }

  await execAsync('git add .')
  await execAsync(`git commit -m "Bump version to ${newVersion}" --no-verify`)
  await execAsync('git push origin HEAD --no-verify')

  await execAsync(`git tag v${newVersion}`)
  await execAsync(`git push origin v${newVersion}`)

  console.log(`\n\nVersion ${newVersion} released successfully`)
}

main()
