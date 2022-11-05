import { SQSEvent } from 'aws-lambda'

export const handler = async (event: SQSEvent) => {
  const { Records } = event

  console.log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttributes } = record
    const orderPayload = JSON.parse(body)
    console.log('Processing event', orderPayload)
    console.log(
      `Message ID: ${messageId}, Message Attributes: ${JSON.stringify(
        messageAttributes
      )} \n attributes: ${JSON.stringify(attributes)}`
    )

    // process order
  }
}
