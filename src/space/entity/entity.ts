export interface IEntity {
  entityId: number
  process: (delta: number) => void
}
