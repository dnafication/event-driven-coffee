import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import { snsPublish, nanoid } from 'common'

const { FULFILMENT_TABLE_NAME, ORDERS_SNS_TOPIC_ARN } = process.env
console.log('FULFILMENT_TABLE_NAME', FULFILMENT_TABLE_NAME)
console.log('ORDERS_SNS_TOPIC_ARN', ORDERS_SNS_TOPIC_ARN)

// create express app
const app = express()
const router = express.Router()

router.use(cors())
router.use(compression())
router.use(express.json())

router.post('/fulfilment', async (req: Request, res: Response) => {
  const { coffee, customerId, customerName } = req.body
})

app.use('/', router)
export { app }
