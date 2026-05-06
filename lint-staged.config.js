module.exports = {
  '**/*.ts?(x)': files => ['npm run typecheck:web', 'npm run typecheck:node', `npx eslint ${files.join(' ')} --fix`],
  '**/src/shared/locales/**/*.json': [
    'npm run translate',
    'npx eslint src/shared/locales/**/*.json --fix',
    'git add src/shared/locales/**/*.json',
  ],
}
