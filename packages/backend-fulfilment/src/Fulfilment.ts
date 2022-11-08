import { BaseModel, Coffee, FulfilmentStatus, OrderStatus } from 'common'

export class Fulfilment extends BaseModel {
  orderStatus: OrderStatus
  orderNote = ''
  fulfilmentStatus: FulfilmentStatus = 'FULFILMENT_CREATED'
  fulfilmentNote = ''
  coffee: Coffee
  customerId: string
  customerName: string

  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.source = 'fulfilment-service'
  }
}
