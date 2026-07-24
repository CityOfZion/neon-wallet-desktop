import { readdirSync, rmSync } from 'fs'
import { join } from 'path'

export default function globalSetup() {
  const filesDir = join(__dirname, './files')

  for (const file of readdirSync(filesDir)) {
    if (file !== '.gitkeep') {
      rmSync(join(filesDir, file), { recursive: true, force: true })
    }
  }
}
