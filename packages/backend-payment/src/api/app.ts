import cors from 'cors'
import express, { Request, Response } from 'express'
import compression from 'compression'
import Stripe from 'stripe'
import { snsPublish, nanoid } from 'common'
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
    payment_method_types: ['card'],
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

  return res.json({
    ...payment,
    clientSecret: paymentIntent.client_secret
  })
})

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
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
    const paymentIntentEvent = event.data.object
    switch (event.type) {
      case 'payment_intent.canceled':
        // Then define and call a function to handle the event payment_intent.canceled
        console.log('payment_intent.canceled', paymentIntentEvent)
        break
      case 'payment_intent.created':
        // Then define and call a function to handle the event payment_intent.created
        console.log('payment_intent.created', paymentIntentEvent)
        break
      case 'payment_intent.payment_failed':
        // Then define and call a function to handle the event payment_intent.payment_failed
        console.log('payment_intent.payment_failed', paymentIntentEvent)
        break
      case 'payment_intent.processing':
        // Then define and call a function to handle the event payment_intent.processing
        console.log('payment_intent.processing', paymentIntentEvent)
        break
      case 'payment_intent.requires_action':
        // Then define and call a function to handle the event payment_intent.requires_action
        console.log('payment_intent.requires_action', paymentIntentEvent)
        break
      case 'payment_intent.succeeded':
        // Then define and call a function to handle the event payment_intent.succeeded
        console.log('payment_intent.succeeded', paymentIntentEvent)
        break
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send()
  }
)

app.use('/', router)
export { app }
