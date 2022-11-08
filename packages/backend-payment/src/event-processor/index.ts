import { SQSEvent } from 'aws-lambda'
import { FulfilmentStatus, logger, OrderStatus, PaymentStatus } from 'common'

const log = logger('payment-event-processor')

export const handler = async (event: SQSEvent) => {
  const { Records } = event

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, attributes } = record
    const message: {
      source: string
      paymentStatus: PaymentStatus
      fulfilmentStatus: FulfilmentStatus
      orderStatus: OrderStatus
    } = JSON.parse(body)
    log('Received event', attributes.MessageDeduplicationId)
    if (message.source !== 'payment-service') {
      // if fulfilment is rejected we'll refund the payment
      if (message.fulfilmentStatus === 'FULFILMENT_REJECTED') {
        log(
          'Fulfilment rejected, refunding payment',
          attributes.MessageDeduplicationId
        )
      }
      // if customer cancels the order we'll refund the payment and cancel the fulfilment
      // only if fulfilment is not already completed
      if (message.orderStatus === 'ORDER_CANCELLED') {
        if (message.fulfilmentStatus !== 'FULFILMENT_COMPLETED') {
          log(
            'Order cancelled, cancelling fulfilment and refuding payment',
            attributes.MessageDeduplicationId
          )
        } else {
          log(
            'Order cancelled, refunding payment',
            attributes.MessageDeduplicationId
          )
        }
      }
    }
  }
}
