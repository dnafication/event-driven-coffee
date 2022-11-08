import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import { snsPublish, logger } from 'common'
import { Fulfilment } from '../Fulfilment'

const { FULFILMENT_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env
const log = logger('fulfilment-api')

// create express app
const app = express()
const router = express.Router()

router.use(cors())
router.use(compression())
router.use(express.json())

router.get('/fulfilment/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const fulfilment = new Fulfilment(FULFILMENT_TABLE_NAME, id)
  try {
    await fulfilment.load()
    return res.json(fulfilment)
  } catch (error) {
    log('getFulfilment: Failed', error)
    return res.status(500).json({ msg: error.message })
  }
})

// get fulfilment by date
router.get('/fulfilment', async (req: Request, res: Response) => {
  const { date } = req.query
  try {
    const data = await Fulfilment.query({
      TableName: FULFILMENT_TABLE_NAME,
      IndexName: 'orderDateIndex',
      KeyConditionExpression: '#date = :date',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':date': date
      }
    })
    return res.json(data)
  } catch (error) {
    log('getFulfilmentByDate: Failed', error)
    return res.status(500).json({ msg: error.message })
  }
})

// mark fulfilment as complete or failed
router.patch('/fulfilment/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, note } = req.body
  const fulfilment = new Fulfilment(FULFILMENT_TABLE_NAME, id)
  try {
    await fulfilment.load()
    fulfilment.fulfilmentStatus = status
    fulfilment.fulfilmentNote = note
    await fulfilment.save()
    log('Fulfilment updated', fulfilment.fulfilmentId)
    // publish fulfilment updated event
    await snsPublish({
      MessageGroupId: fulfilment.orderId,
      MessageDeduplicationId: `${fulfilment.orderId}}-${fulfilment.fulfilmentStatus}`,
      MessageAttributes: {},
      Message: JSON.stringify(fulfilment),
      TopicArn: ORDERS_SNS_TOPIC_ARN
    })
    log('Fulfilment updated event published', fulfilment)
    return res.json(fulfilment)
  } catch (error) {
    log('Failed', error)
    return res.status(500).json({ msg: error.message })
  }
})

app.use('/', router)
export { app }
