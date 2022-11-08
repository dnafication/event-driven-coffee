import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import Stripe from 'stripe'
import { snsPublish, nanoid, logger } from 'common'
import { Payment } from '../Payment'

const {
  PAYMENT_TABLE_NAME,
  ORDERS_SNS_TOPIC_ARN,
  STRIPE_API_KEY,
  STRIPE_ENDPOINT_SECRET
} = process.env

const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01'
})

// create express app
const app = express()
const router = express.Router()

router.use(cors())
router.use(compression())
router.use(express.json())

const log = logger('payment-api')

router.post('/payment', async (req: Request, res: Response) => {
  const { coffee, customerId, customerName, orderId } = req.body
  const paymentId = nanoid()
  const payment = new Payment(PAYMENT_TABLE_NAME, paymentId)
  payment.coffee = coffee
  payment.customerId = customerId
  payment.customerName = customerName
  payment.orderId = orderId

  const paymentIntent = await stripe.paymentIntents.create({
    amount: coffee.price,
    currency: 'aud',
    automatic_payment_methods: {
      enabled: true
    },
    metadata: {
      coffeeId: coffee.id,
      coffeeName: coffee.name,
      customerId,
      customerName,
      orderId,
      paymentId: payment.id
    }
  })

  payment.paymentIntentId = paymentIntent.id
  await payment.save()
  log('Payment created', payment.paymentId)

  return res.json({
    ...payment,
    clientSecret: paymentIntent.client_secret
  })
})

router.get('/payment', async (req: Request, res: Response) => {
  const { date } = req.query
  try {
    const payments = await Payment.query({
      TableName: PAYMENT_TABLE_NAME,
      IndexName: 'orderDateIndex',
      KeyConditionExpression: '#date = :date',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':date': date
      }
    })
    return res.json(payments)
  } catch (error) {
    log('getPaymentByDate: Failed', error)
    return res.status(500).json({ msg: error.message })
  }
})

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    const log = logger('payment-webhook')
    const sig = request.headers['stripe-signature']
    let event
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        STRIPE_ENDPOINT_SECRET
      )
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`)
      return
    }

    // Handle the event
    const paymentIntentEvent: Stripe.PaymentIntent = event.data.object
    const paymentId = paymentIntentEvent.metadata?.paymentId
    switch (event.type) {
      case 'payment_intent.canceled':
        // Then define and call a function to handle the event payment_intent.canceled
        log('payment_intent.canceled', paymentId)
        const payment = new Payment(PAYMENT_TABLE_NAME, paymentId)
        await payment.load()
        payment.paymentStatus = 'PAYMENT_FAILED'
        payment.paymentNote = 'Payment was cancelled'
        await payment.save()
        log('saved payment status for', payment.id)
        await snsPublish({
          MessageGroupId: payment.orderId,
          MessageDeduplicationId: `${payment.orderId}-${payment.paymentStatus}`,
          MessageAttributes: {},
          Message: JSON.stringify(payment),
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
        log('payment cancelled event published', payment.id)

        break
      case 'payment_intent.created':
        // Then define and call a function to handle the event payment_intent.created
        log('payment.idpayment_intent.created')
        break
      case 'payment_intent.payment_failed':
        // Then define and call a function to handle the event payment_intent.payment_failed
        log('payment_intent.payment_failed', paymentId)
        const paymentFailed = new Payment(PAYMENT_TABLE_NAME, paymentId)
        await paymentFailed.load()
        paymentFailed.paymentStatus = 'PAYMENT_FAILED'
        paymentFailed.paymentNote = 'Payment failed'
        await paymentFailed.save()
        log('saved payment status for', paymentFailed.id)
        await snsPublish({
          MessageGroupId: paymentFailed.orderId,
          MessageDeduplicationId: `${paymentFailed.orderId}-${paymentFailed.paymentStatus}`,
          MessageAttributes: {},
          Message: JSON.stringify(paymentFailed),
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
        log('payment failed event published', paymentFailed.id)
        break
      case 'payment_intent.processing':
        // Then define and call a function to handle the event payment_intent.processing
        log('webook: payment_intent.processing', paymentId)
        break
      case 'payment_intent.requires_action':
        // Then define and call a function to handle the event payment_intent.requires_action
        log('payment_intent.requires_action', paymentId)
        break
      case 'payment_intent.succeeded':
        // Then define and call a function to handle the event payment_intent.succeeded
        log('payment_intent.succeeded', paymentId)
        const paymentSucceeded = new Payment(PAYMENT_TABLE_NAME, paymentId)
        await paymentSucceeded.load()
        paymentSucceeded.paymentStatus = 'PAYMENT_SUCCESSFUL'
        paymentSucceeded.paymentNote = 'Payment succeeded'
        await paymentSucceeded.save()
        log('saved payment status for', paymentSucceeded.id)
        await snsPublish({
          MessageGroupId: paymentSucceeded.orderId,
          MessageDeduplicationId: `${paymentSucceeded.orderId}-${paymentSucceeded.paymentStatus}`,
          MessageAttributes: {},
          Message: JSON.stringify(paymentSucceeded),
          TopicArn: ORDERS_SNS_TOPIC_ARN
        })
        log('payment succeeded event published', paymentSucceeded.id)
        break
      // ... handle other event types
      default:
        log(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send()
  }
)

app.use('/', router)
export { app }
