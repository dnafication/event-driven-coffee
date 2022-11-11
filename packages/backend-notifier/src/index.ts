import { SQSEvent } from 'aws-lambda'
import { BaseModel, logger } from 'common'
import { createClient, gql } from '@urql/core'

const { GRAPHQL_API_URL } = process.env

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrder($orderId: ID!) {
    publishOrderStatus(orderId: $orderId)
  }
`

const UPDATE_PAYMENT_STATUS = gql`
  mutation PublishPaymentStatus($paymentId: ID!) {
    publishPaymentStatus(paymentId: $paymentId)
  }
`

const UPDATE_FULFILMENT_STATUS = gql`
  mutation UpdateFulfilmentStatus($fulfilmentId: ID!) {
    publishFulfilmentStatus(fulfilmentId: $fulfilmentId)
  }
`

export const handler = async (event: SQSEvent) => {
  const { Records } = event
  const log = logger('notifier')

  log('Number of messages received', Records.length)

  const client = createClient({
    url: GRAPHQL_API_URL
  })

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttributes } = record
    const parsedBody = JSON.parse(body)
    const message: BaseModel = JSON.parse(parsedBody.Message)
    log('Received event', attributes.MessageDeduplicationId)

    // call graphql mutation to update order|payment|fulfilment status
    if (message.source === 'order-service') {
      log('Notifying order status', message.orderId)
      try {
        await client
          .mutation(UPDATE_ORDER_STATUS, {
            orderId: message.orderId
          })
          .toPromise()
      } catch (error) {
        log('Error notifying order status', error)
      }
    }
    if (message.source === 'payment-service') {
      log('Notifying payment status', message.paymentId)
      try {
        await client
          .mutation(UPDATE_PAYMENT_STATUS, {
            paymentId: message.paymentId
          })
          .toPromise()
      } catch {
        await client
          .mutation(UPDATE_PAYMENT_STATUS, {
            paymentId: message.paymentId
          })
          .toPromise()
      }
    }
    if (message.source === 'fulfilment-service') {
      log('Notifying fulfilment status', message.fulfilmentId)
      try {
        await client
          .mutation(UPDATE_FULFILMENT_STATUS, {
            fulfilmentId: message.fulfilmentId
          })
          .toPromise()
      } catch (error) {
        log('Error notifying fulfilment status', error)
      }
    }
  }
}
