import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import { ddbPut, snsPublish, nanoid } from 'common'

const { FULFILMENT_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env
console.log('FULFILMENT_TABLE_NAME', FULFILMENT_TABLE_NAME)
console.log('ORDERS_SNS_TOPIC_ARN', ORDERS_SNS_TOPIC_ARN)

// create express app
const app = express()
const router = express.Router()

router.use(cors())
router.use(compression())
router.use(express.json())

router.post('/order', async (req: Request, res: Response) => {
  const { coffee, price, customerName } = req.body
  const orderId = nanoid()
  const orderStatus = 'ORDER_CREATED'

  try {
    // save order to db
    console.log('Saving order to db', FULFILMENT_TABLE_NAME)
    const ddbOrder = await ddbPut({
      TableName: FULFILMENT_TABLE_NAME,
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
    return res.json({
      orderId,
      orderStatus,
      coffee,
      price,
      customerName
    })
  } catch (error) {
    console.log('placeOrder: Failed', error)
    return res.status(500).json(error)
  }
})

app.use('/', router)
export { app }
