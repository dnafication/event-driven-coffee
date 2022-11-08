import { SQSEvent } from 'aws-lambda'
import {
  Coffee,
  FulfilmentStatus,
  logger,
  nanoid,
  OrderStatus,
  PaymentStatus,
  snsPublish
} from 'common'
import { Fulfilment } from '../Fulfilment'

const log = logger('fulfilment-event-processor')
const { FULFILMENT_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env

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
      coffee: Coffee
      customerName: string
      orderId: string
    } = JSON.parse(body)
    log('Received event', attributes.MessageDeduplicationId, message.source)
    if (message.source !== 'fulfilment-service') {
      if (message.paymentStatus === 'PAYMENT_SUCCESSFUL') {
        log(
          'Payment successful, fulfilling order',
          attributes.MessageDeduplicationId
        )
        const fulfilmentId = nanoid()
        const fulfilment = new Fulfilment(FULFILMENT_TABLE_NAME, fulfilmentId)
        fulfilment.coffee = message.coffee
        fulfilment.customerName = message.customerName
        fulfilment.orderId = message.orderId
        fulfilment.fulfilmentStatus = 'FULFILMENT_CREATED'
        fulfilment.orderStatus = message.orderStatus
        fulfilment.paymentStatus = message.paymentStatus
        await fulfilment.save()
        log('Fulfilment created', fulfilment.fulfilmentId)
        await snsPublish({
          MessageGroupId: fulfilment.orderId,
          MessageDeduplicationId: `${fulfilment.orderId}-${fulfilment.fulfilmentStatus}`,
          Message: JSON.stringify(fulfilment),
          MessageAttributes: {},
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
      }
    }
  }
}
