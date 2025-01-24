import { exec } from 'child_process'
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

async function bumpVersion(bumpType: string) {
  try {
    if (bumpType === 'none') {
      console.log('No version bump was made.')
      return packageJson.version
    }

    const versionParts = packageJson.version.split('.').map(Number)

    switch (bumpType) {
      case 'patch':
        versionParts[2] = versionParts[2] + 1
        break
      case 'minor':
        versionParts[1] = versionParts[1] + 1
        versionParts[2] = 0
        break
      case 'major':
        versionParts[0] = versionParts[0] + 1
        versionParts[1] = 0
        versionParts[2] = 0
        break
    }

    const bumpedVersion = versionParts.join('.')

    packageJson.version = bumpedVersion

    await fs.writeFile(path.join(__dirname, '../package.json'), JSON.stringify(packageJson, null, 2))

    await execAsync('npm i --package-lock-only --ignore-scripts')
    await execAsync('git add .')
    await execAsync(`git commit -m "Bump version to ${bumpedVersion}" --no-verify`)
    await execAsync('git push origin HEAD --no-verify')

    console.log(`Version bumped to ${bumpedVersion}`)

    return bumpedVersion
  } catch (error) {
    console.error('Error bumping version', error)
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

async function createTag(version: string) {
  try {
    const tagAlreadyExists = await verifyIfTagAlreadyExists(version)

    let shouldForceTag = false

    if (tagAlreadyExists) {
      const { value: shouldResendTag } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Tag already exists. Do you want to force create?',
        },
      ])

      if (!shouldResendTag) {
        process.exit(1)
      }

      shouldForceTag = true
    }

    await execAsync(`git tag v${version} ${shouldForceTag ? '--force' : ''}`)
    await execAsync(`git push origin v${version} --no-verify`)

    console.log('Tag was pushed.')
  } catch (error) {
    console.error('Error creating tag', error)
    process.exit(1)
  }
}

async function main() {
  await verifyIfGitIsClean()

  const { value: bumpType } = await inquirer.prompt([
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
        { value: 'none', name: 'Do not bump' },
      ],
    },
  ])

  const bumpedVersion = await bumpVersion(bumpType)
  await createTag(bumpedVersion)
}

main()
