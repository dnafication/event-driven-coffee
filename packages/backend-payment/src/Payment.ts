import { BaseModel, Coffee, OrderStatus, PaymentStatus } from 'common'

export class Payment extends BaseModel {
  orderStatus: OrderStatus
  orderNote = ''
  paymentStatus: PaymentStatus = 'PAYMENT_PENDING'
  paymentNote = ''
  coffee: Coffee
  customerId: string
  customerName: string
  orderId: string
  paymentIntentId: string

  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.source = 'payment-service'
  }
}
