import { revalidateMigration } from './revalidateMigration'
import { waitMigration } from './waitMigration'
import { waitTransaction } from './waitTransaction'

export const thunks = {
  waitTransaction,
  waitMigration,
  revalidateMigration,
}
