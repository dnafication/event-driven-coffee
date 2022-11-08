import { BaseModel } from 'common'

export class Order extends BaseModel {
  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.orderId = id
    this.source = 'order-service'
    this.orderStatus = 'ORDER_CREATED'
  }
}
