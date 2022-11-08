import { SQSEvent } from 'aws-lambda'
import { logger } from 'common'

export const handler = async (event: SQSEvent) => {
  const { Records } = event
  const log = logger('notifier')

  log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttributes } = record
    const message = JSON.parse(body)
    log('Received event', attributes.MessageDeduplicationId)

    // call graphql mutation to update order|payment|fulfilment status
  }
}
