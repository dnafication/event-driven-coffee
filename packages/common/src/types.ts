export interface Coffee {
  id: string
  name: string
  price: number
  description: string
}

export type OrderStatus =
  | 'ORDER_CREATED'
  | 'ORDER_IN_PROGRESS'
  | 'ORDER_CANCELLED'
  | 'ORDER_COMPLETED'

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'

export type FulfilmentStatus =
  | 'FULFILMENT_PENDING'
  | 'FULFILMENT_CREATED'
  | 'FULFILMENT_COMPLETED'
  | 'FULFILMENT_REJECTED'
