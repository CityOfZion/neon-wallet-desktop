/* eslint-disable @typescript-eslint/no-require-imports */
const micromatch = require('micromatch')

module.exports = {
  '*': files => {
    const commands = []

    const tsFiles = micromatch(files, ['**/*.ts?(x)'])
    if (tsFiles.length > 0) {
      commands.push('npm run typecheck:web')
      commands.push('npm run typecheck:node')
    }

    const localeJsonFiles = micromatch(files, ['**/src/shared/locales/**/*.json'])
    if (localeJsonFiles.length > 0) {
      commands.push('npm run translate')
      commands.push('npx eslint src/shared/locales/**/*.json --fix')
      commands.push('git add src/shared/locales/**/*.json')
    }

    const filesToLint = micromatch(files, ['**/*.ts?(x)'])
    if (filesToLint.length > 0) {
      commands.push(`npx eslint ${filesToLint.join(' ')} --fix`)
    }

    return commands
  },
}
