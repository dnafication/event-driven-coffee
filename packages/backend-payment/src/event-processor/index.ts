import { SQSEvent } from 'aws-lambda'
import { BaseModel, logger, snsPublish } from 'common'
import { Payment } from '../Payment'

const log = logger('payment-event-processor')
const {
  PAYMENT_TABLE_NAME,
  ORDERS_SNS_TOPIC_ARN,
  STRIPE_API_KEY,
  STRIPE_ENDPOINT_SECRET
} = process.env

export const handler = async (event: SQSEvent) => {
  const { Records } = event

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, attributes } = record
    const parsedBody = JSON.parse(body)
    const message: BaseModel = JSON.parse(parsedBody.Message)
    log('Received event', message)

    if (message.source === 'payment-service') {
      log('Ignoring event from payment-service')
      return
    }

    // if fulfilment is rejected we'll refund the payment
    if (message.fulfilmentStatus === 'FULFILMENT_REJECTED') {
      log(
        'Fulfilment rejected, refunding payment',
        attributes.MessageDeduplicationId
      )
      const payment = new Payment(PAYMENT_TABLE_NAME, message.paymentId)
      // await payment.refund()
      await payment.load()
      payment.paymentStatus = 'PAYMENT_REFUNDED'
      payment.paymentNote = 'Payment will be refunded to your account'
      await payment.save()
      log('Payment refunded', payment.paymentId)
      await snsPublish({
        MessageGroupId: payment.orderId,
        MessageDeduplicationId: `${payment.orderId}-${payment.paymentStatus}`,
        Message: JSON.stringify(payment),
        MessageAttributes: {},
        TopicArn: ORDERS_SNS_TOPIC_ARN
      })
      return
    }
    // if customer cancels the order we'll refund the payment and cancel the fulfilment
    // only if fulfilment is not already completed
    if (message.orderStatus === 'ORDER_CANCELLED') {
      if (message.fulfilmentStatus !== 'FULFILMENT_COMPLETED') {
        log(
          'Order cancelled, cancelling fulfilment and refuding payment',
          attributes.MessageDeduplicationId
        )
        const payment = new Payment(PAYMENT_TABLE_NAME, message.paymentId)
        // await payment.refund()
        await payment.load()
        payment.paymentStatus = 'PAYMENT_REFUNDED'
        payment.paymentNote = 'Payment will be refunded to your account'
        await payment.save()
        log('Payment refunded', payment.paymentId)
        await snsPublish({
          MessageGroupId: payment.orderId,
          MessageDeduplicationId: `${payment.orderId}-${payment.paymentStatus}`,
          Message: JSON.stringify(payment),
          MessageAttributes: {},
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
        // Not implemented
        return
      } else {
        log(
          'Order cannot be cancelled, fulfilment already completed',
          attributes.MessageDeduplicationId
        )

        return
      }
    }
  }
}
