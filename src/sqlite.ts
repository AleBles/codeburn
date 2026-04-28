import { Database } from 'bun:sqlite'

type Row = Record<string, unknown>

export type SqliteDatabase = {
  query<T extends Row = Row>(sql: string, params?: unknown[]): T[]
  close(): void
}

export function isSqliteAvailable(): boolean {
  return true
}

export function getSqliteLoadError(): string {
  return ''
}

export function openDatabase(path: string): SqliteDatabase {
  const db = new Database(path, { readonly: true })

  return {
    query<T extends Row = Row>(sql: string, params: unknown[] = []): T[] {
      return db.query(sql).all(...(params as never[])) as T[]
    },
    close() {
      db.close()
    },
  }
}
