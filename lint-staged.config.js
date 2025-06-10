module.exports = {
  '**/*.ts?(x)': files => [`npm run lint -- ${files.join(' ')}`, 'npm run typecheck:web', 'npm run typecheck:node'],
}
