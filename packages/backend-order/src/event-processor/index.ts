import { SQSEvent } from 'aws-lambda'
import {
  FulfilmentStatus,
  logger,
  OrderStatus,
  PaymentStatus,
  snsPublish
} from 'common'
import { Order } from '../Order'

const { ORDER_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env

export const handler = async (event: SQSEvent) => {
  const { Records } = event
  const log = logger('order-event-processor')

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttributes } = record
    const message: {
      source: string
      orderId: string
      paymentStatus: PaymentStatus
      fulfilmentStatus: FulfilmentStatus
      orderStatus: OrderStatus
    } = JSON.parse(body)
    log('Received event', attributes.MessageDeduplicationId)

    if (message.source !== 'order-service') {
      if (message.paymentStatus === 'PAYMENT_FAILED') {
        log(
          'Payment failed, cancelling order',
          attributes.MessageDeduplicationId
        )
        const order = new Order(ORDER_TABLE_NAME, message.orderId)
        await order.load()
        order.orderStatus = 'ORDER_CANCELLED'
        order.orderNote = 'Payment failed'
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
      }
      if (message.paymentStatus === 'PAYMENT_SUCCESSFUL') {
        log(
          'Payment successful, fulfilling order',
          attributes.MessageDeduplicationId
        )
        const order = new Order(ORDER_TABLE_NAME, message.orderId)
        await order.load()
        order.orderStatus = 'ORDER_IN_PROGRESS'
        order.orderNote = 'Payment successful'
        await order.save()
        log('Order fulfilled', order.orderId)
        await snsPublish({
          MessageGroupId: order.orderId,
          MessageDeduplicationId: `${order.orderId}-${order.orderStatus}`,
          Message: JSON.stringify(order),
          MessageAttributes: {},
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
        log('Order fulfilled event published', order.orderId)
      }
      if (message.fulfilmentStatus === 'FULFILMENT_COMPLETED') {
        log(
          'Fulfilment completed, completing order',
          attributes.MessageDeduplicationId
        )
        const order = new Order(ORDER_TABLE_NAME, message.orderId)
        await order.load()
        order.orderStatus = 'ORDER_COMPLETED'
        order.orderNote = 'Fulfilment completed'
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
      }
      if (message.fulfilmentStatus === 'FULFILMENT_REJECTED') {
        log(
          'Fulfilment rejected, cancelling order',
          attributes.MessageDeduplicationId
        )
        const order = new Order(ORDER_TABLE_NAME, message.orderId)
        await order.load()
        order.orderStatus = 'ORDER_CANCELLED'
        order.orderNote = 'Fulfilment rejected'
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
      }
    }
  }
}
