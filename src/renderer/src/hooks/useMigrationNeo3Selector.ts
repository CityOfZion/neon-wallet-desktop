import { useAppSelector } from '@renderer/hooks/useRedux'

export const useMigrationsNeo3Selector = () => {
  const { value: migrationsNeo3, ref: migrationsNeo3Ref } = useAppSelector(state => state.migrationNeo3.migrationsNeo3)

  return { migrationsNeo3, migrationsNeo3Ref }
}

export const useMigrationNeo3Selector = (hash: string) => {
  const { value: migrationNeo3, ref: migrationNeo3Ref } = useAppSelector(
    state => state.migrationNeo3.migrationsNeo3[hash]
  )

  return { migrationNeo3, migrationNeo3Ref }
}
