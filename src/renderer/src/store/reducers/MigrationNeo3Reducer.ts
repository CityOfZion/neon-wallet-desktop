import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TMigrationNeo3, TMigrationsNeo3 } from '@shared/@types/store'
import { cloneDeep } from 'lodash'
import { PersistConfig, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export interface IMigrationNeo3Reducer {
  migrationsNeo3: TMigrationsNeo3
}

export const migrationNeo3ReducerConfig: PersistConfig<IMigrationNeo3Reducer> = {
  key: 'migrationNeo3Reducer',
  storage,
}

const initialState: IMigrationNeo3Reducer = {
  migrationsNeo3: {},
}

const saveMigrationNeo3: CaseReducer<IMigrationNeo3Reducer, PayloadAction<TMigrationNeo3>> = (state, action) => {
  const migrationNeo3 = cloneDeep(action.payload)

  state.migrationsNeo3[migrationNeo3.hash] = migrationNeo3
}

const mergeMigrationsNeo3: CaseReducer<IMigrationNeo3Reducer, PayloadAction<TMigrationsNeo3>> = (state, action) => {
  const migrationsNeo3 = cloneDeep(action.payload)

  state.migrationsNeo3 = { ...state.migrationsNeo3, ...migrationsNeo3 }
}

const MigrationNeo3Reducer = createSlice({
  name: migrationNeo3ReducerConfig.key,
  initialState,
  reducers: {
    saveMigrationNeo3,
    mergeMigrationsNeo3,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState)
  },
})

export const migrationNeo3ReducerActions = { ...MigrationNeo3Reducer.actions }

export default MigrationNeo3Reducer.reducer
