import { APIGatewayEvent, Context } from 'aws-lambda'
import {
  successResponse,
  errorResponse,
  ddbPut,
  snsPublish,
  nanoid
} from 'common'
import { setTimeout } from 'node:timers/promises'

const { ORDER_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env
console.log(process.env)

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
export const placeOrder = async (event: APIGatewayEvent, context: Context) => {
  const { body } = event
  const { awsRequestId } = context
  const { coffee, price, customerName } = JSON.parse(body)
  // generate order id
  const orderId = nanoid()
  const orderStatus = 'ORDER_CREATED'

  try {
    // save order to db
    console.log('Saving order to db', ORDER_TABLE_NAME)
    const ddbOrder = await ddbPut({
      TableName: ORDER_TABLE_NAME,
      Item: {
        orderId,
        orderStatus,
        coffee,
        price,
        customerName
      }
    })
    console.log('Order saved to db', ddbOrder)

    // publish order created event
    console.log('Publishing order created event', ORDERS_SNS_TOPIC_ARN)
    const order = await snsPublish({
      MessageGroupId: orderId,
      MessageDeduplicationId: `${orderId}-${orderStatus}`,
      MessageAttributes: {
        service: {
          DataType: 'String',
          StringValue: 'order'
        }
      },
      Message: JSON.stringify({
        orderId,
        orderStatus,
        coffee,
        price,
        customerName
      }),
      TopicArn: ORDERS_SNS_TOPIC_ARN
    })
    console.log('placeOrder: Order created event published', order)
    return successResponse({
      orderId,
      orderStatus,
      coffee,
      price,
      customerName
    })
  } catch (error) {
    console.log('placeOrder: Failed', error)
    return errorResponse(error.message, awsRequestId)
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
