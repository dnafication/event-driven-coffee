import { SQSEvent } from 'aws-lambda'
import { BaseModel, logger, snsPublish } from 'common'
import { Order } from '../Order'

const { ORDER_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env

export const handler = async (event: SQSEvent) => {
  const { Records } = event
  const log = logger('order-event-processor')

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttributes } = record
    const parsedBody = JSON.parse(body)
    const message: BaseModel = JSON.parse(parsedBody.Message)

    log('Received event', message)
    if (message.source === 'order-service') {
      return log('Ignoring event from order-service')
    }

    if (
      message.paymentStatus === 'PAYMENT_FAILED' &&
      message.source === 'payment-service'
    ) {
      log('Payment failed, cancelling order', attributes.MessageDeduplicationId)
      const order = new Order(ORDER_TABLE_NAME, message.orderId)
      await order.load()
      order.orderStatus = 'ORDER_CANCELLED'
      order.orderNote = 'Payment failed'
      order.paymentId = message.paymentId
      order.paymentStatus = message.paymentStatus
      order.paymentNote = message.paymentNote
      await order.save()
      log('Order cancelled', order.orderId)
      await snsPublish({
        MessageGroupId: order.orderId,
        MessageDeduplicationId: `${order.orderId}-${order.orderStatus}`,
        Message: JSON.stringify(order),
        MessageAttributes: {},
        TopicArn: ORDERS_SNS_TOPIC_ARN
      })
      return log('Order cancelled event published', order.orderId)
    }
    if (
      message.paymentStatus === 'PAYMENT_SUCCESSFUL' &&
      message.source === 'payment-service'
    ) {
      log(
        'Payment successful, fulfilling order',
        attributes.MessageDeduplicationId
      )
      const order = new Order(ORDER_TABLE_NAME, message.orderId)
      await order.load()
      order.orderStatus = 'ORDER_IN_PROGRESS'
      order.orderNote = 'Payment successful'
      order.paymentId = message.paymentId
      order.paymentStatus = message.paymentStatus
      order.paymentNote = message.paymentNote
      await order.save()
      log('Order fulfilled', order.orderId)
      await snsPublish({
        MessageGroupId: order.orderId,
        MessageDeduplicationId: `${order.orderId}-${order.orderStatus}`,
        Message: JSON.stringify(order),
        MessageAttributes: {},
        TopicArn: ORDERS_SNS_TOPIC_ARN
      })
      return log('Order fulfilled event published', order.orderId)
    }
    if (
      message.fulfilmentStatus === 'FULFILMENT_COMPLETED' &&
      message.source === 'fulfilment-service'
    ) {
      log(
        'Fulfilment completed, completing order',
        attributes.MessageDeduplicationId
      )
      const order = new Order(ORDER_TABLE_NAME, message.orderId)
      await order.load()
      order.orderStatus = 'ORDER_COMPLETED'
      order.orderNote = 'Fulfilment completed'
      order.fulfilmentId = message.fulfilmentId
      order.fulfilmentStatus = message.fulfilmentStatus
      order.fulfilmentNote = message.fulfilmentNote
      await order.save()
      log('Order completed', order.orderId)
      await snsPublish({
        MessageGroupId: order.orderId,
        MessageDeduplicationId: `${order.orderId}-${order.orderStatus}`,
        Message: JSON.stringify(order),
        MessageAttributes: {},
        TopicArn: ORDERS_SNS_TOPIC_ARN
      })
      log('Order completed event published', order.orderId)
      return
    }
    if (
      message.fulfilmentStatus === 'FULFILMENT_REJECTED' &&
      message.source === 'fulfilment-service'
    ) {
      log(
        'Fulfilment rejected, cancelling order',
        attributes.MessageDeduplicationId
      )
      const order = new Order(ORDER_TABLE_NAME, message.orderId)
      await order.load()
      order.orderStatus = 'ORDER_CANCELLED'
      order.orderNote = 'Fulfilment rejected'
      order.fulfilmentId = message.fulfilmentId
      order.fulfilmentStatus = message.fulfilmentStatus
      order.fulfilmentNote = message.fulfilmentNote
      await order.save()
      log('Order cancelled', order.orderId)
      await snsPublish({
        MessageGroupId: order.orderId,
        MessageDeduplicationId: `${order.orderId}-${order.orderStatus}`,
        Message: JSON.stringify(order),
        MessageAttributes: {},
        TopicArn: ORDERS_SNS_TOPIC_ARN
      })
      log('Order cancelled event published', order.orderId)
      return
    }
  }
}
