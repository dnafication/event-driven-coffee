import { SNSEvent } from 'aws-lambda'

export const handler = async (event: SNSEvent) => {
  const { Records } = event

  console.log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { Sns } = record
    const { Message, MessageId, MessageAttributes } = Sns
    const orderPayload = JSON.parse(Message)
    console.log('Processing order', orderPayload)
    console.log(
      `Message ID: ${MessageId}, Message Attributes: ${JSON.stringify(
        MessageAttributes
      )}`
    )

    // process order
  }
}
