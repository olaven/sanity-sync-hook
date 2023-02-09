/**
 * Abstraction for storage systems.
 * I.e. the thing that sanity should sync to.
 */
export interface StorageEngine<T> {
  get: (id: string) => Promise<T | null>;
  save: (obj: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
  update: (obj: T) => Promise<void>;
}
