import { BaseModel, Coffee, OrderStatus, PaymentStatus } from 'common'

export class Payment extends BaseModel {
  createdTimestamp: number
  paymentIntentId: string

  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.source = 'payment-service'
    this.paymentId = id
    this.paymentStatus = 'PAYMENT_PENDING'
    this.createdTimestamp = this.createdAt
  }
}
