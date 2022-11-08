import { BaseModel, FulfilmentStatus } from 'common'

export class Fulfilment extends BaseModel {
  createdTimestamp: number

  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.source = 'fulfilment-service'
    this.fulfilmentId = id
    this.fulfilmentStatus = 'FULFILMENT_PENDING'
    this.createdTimestamp = this.createdAt
  }
}
