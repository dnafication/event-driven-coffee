import {
  BaseModel,
  Coffee,
  FulfilmentStatus,
  OrderStatus,
  PaymentStatus
} from 'common'

export class Order extends BaseModel {
  orderStatus: OrderStatus = 'ORDER_CREATED'
  orderNote = ''
  paymentStatus: PaymentStatus = 'PAYMENT_PENDING'
  paymentNote = ''
  fulfilmentStatus: FulfilmentStatus = 'FULFILMENT_PENDING'
  fulfilmentNote = ''
  coffee: Coffee
  customerId: string
  customerName: string

  constructor(ddbTableName: string, id: string) {
    super(ddbTableName, id)
    this.source = 'order-service'
  }
}
