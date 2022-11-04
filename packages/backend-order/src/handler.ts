import {
  PublishCommand,
  PublishCommandInput,
  SNSClient
} from '@aws-sdk/client-sns'
import { successResponse, errorResponse } from 'common'
import { setTimeout } from 'node:timers/promises'

const sns = new SNSClient({ region: 'ap-southeast-2' })

export const processOrder = async (event, context) => {
  const { Records } = event

  console.log('Number of messages received', Records.length)

  for (let i = 0; i < Records.length; i++) {
    const record = Records[i]
    const { body, messageId, attributes, messageAttribute } = record
    const orderPayload = JSON.parse(body)
    console.log('Processing order', orderPayload)
    console.log(
      `Message ID: ${messageId}, Message Attributes: ${JSON.stringify(
        messageAttribute
      )} \n attributes: ${JSON.stringify(attributes)}`
    )
    await setTimeout(1000)

    // process order
  }
}

// test function
export const placeOrder = async () => {
  const params = (id): PublishCommandInput => ({
    MessageGroupId: 'order-123', // order id
    MessageDeduplicationId: 'order-' + id, // orderid + status
    Message: JSON.stringify({
      orderId: '123',
      orderDate: new Date().toISOString(),
      orderItems: [
        {
          productId: '123',
          quantity: 1
        }
      ]
    }),
    TopicArn: process.env.ORDERS_SNS_TOPIC_ARN,
    MessageAttributes: {
      orderType: {
        DataType: 'String',
        StringValue: 'standard'
      }
    },
    Subject: 'New Order'
  })

  try {
    for (let i = 0; i < 15; i += 1) {
      const data = await sns.send(new PublishCommand(params(i)))
    }
    console.log('Success')
  } catch (error) {
    console.log('Error', error)
    return error
  }
}

// get list of available coffees
export const getCoffees = async () => {
  const resp = [
    {
      id: '1',
      name: 'Cappuccino',
      description:
        'A cappuccino is an espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.',
      price: 250
    },
    {
      id: '2',
      name: 'Latte',
      description:
        'A latte is a coffee drink made with espresso and steamed milk.',
      price: 200
    },
    {
      id: '3',
      name: 'Mocha',
      description: 'A mocha is a chocolate-flavored variant of a caffè latte.',
      price: 300
    }
  ]
  return successResponse(resp)
}
