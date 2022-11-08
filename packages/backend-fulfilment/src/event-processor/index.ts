import { SQSEvent } from 'aws-lambda'
import { BaseModel, logger, nanoid, snsPublish } from 'common'
import { Fulfilment } from '../Fulfilment'

const log = logger('fulfilment-event-processor')
const { FULFILMENT_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env

export const handler = async (event: SQSEvent) => {
  const { Records } = event

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, attributes } = record
    const parsedBody = JSON.parse(body)
    const message: BaseModel = JSON.parse(parsedBody.Message)
    log('Received event', message)

    if (message.source === 'fulfilment-service') {
      log('Ignoring event from fulfilment-service')
      return
    }

    if (
      message.paymentStatus === 'PAYMENT_SUCCESSFUL' &&
      message.source === 'payment-service'
    ) {
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
      fulfilment.paymentId = message.paymentId
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
      return log('Fulfilment created event published', fulfilment.fulfilmentId)
    }
  }
}
