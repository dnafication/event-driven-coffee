import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import { snsPublish, nanoid, logger } from 'common'

const { ORDER_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env

import coffees from './coffees'
import { Order } from '../Order'

// create express app
const app = express()
const router = express.Router()

router.use(cors())
router.use(compression())
router.use(express.json())

const log = logger('order-api')

router.get('/coffees', async (req: Request, res: Response) => {
  return res.json(coffees)
})

// create order
router.post('/order', async (req: Request, res: Response) => {
  const { coffee, customerName, customerId } = req.body
  const orderId = nanoid()

  try {
    // save order to db
    const order = new Order(ORDER_TABLE_NAME, orderId)
    order.coffee = coffee
    order.customerId = customerId
    order.customerName = customerName
    await order.save()

    // publish order created event
    log('Publishing order created event', ORDERS_SNS_TOPIC_ARN)
    const publishResp = await snsPublish({
      MessageGroupId: orderId,
      MessageDeduplicationId: `${orderId}-${order.orderStatus}`,
      MessageAttributes: {},
      Message: JSON.stringify({
        orderId,
        orderStatus: order.orderStatus,
        source: order.source,
        coffee,
        customerId,
        customerName
      }),
      TopicArn: ORDERS_SNS_TOPIC_ARN
    })
    log('placeOrder: Order created event published', order)
    return res.json(order)
  } catch (error) {
    log('placeOrder: Failed', error)
    return res.status(500).json({ msg: error.message })
  }
})

// get order
router.get('/order/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params
  try {
    const order = new Order(ORDER_TABLE_NAME, orderId)
    await order.load()
    return res.json(order)
  } catch (error) {
    log('getOrder: Failed', error)
    return res.status(500).json(error)
  }
})

// get order by customerId or date
router.get('/orders', async (req: Request, res: Response) => {
  const { customerId, date } = req.query
  if (customerId && date) {
    return res.status(400).json({
      error: 'customerId and date cannot be used together'
    })
  }
  try {
    if (customerId) {
      const orders = await Order.query({
        TableName: ORDER_TABLE_NAME,
        IndexName: 'orderCustomerIndex',
        KeyConditionExpression: 'customerId = :customerId',
        ExpressionAttributeValues: {
          ':customerId': customerId
        }
      })
      return res.json(orders)
    }
    if (date) {
      const orders = await Order.query({
        TableName: ORDER_TABLE_NAME,
        IndexName: 'orderDateIndex',
        KeyConditionExpression: '#date = :orderDate',
        ExpressionAttributeNames: {
          '#date': 'date'
        },
        ExpressionAttributeValues: {
          ':date': date
        }
      })
      return res.json(orders)
    }
    return res.status(400).json({
      error: 'customerId or date must be provided'
    })
  } catch (error) {
    log('getOrders: Failed', error)
    return res.status(500).json(error)
  }
})

app.use('/', router)
export { app }
