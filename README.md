# event-driven-coffee

Full stack coffee ordering app with Svelte for frontend and event driven architecture for backend using AWS services. This is just a demo app to showcase the event driven integration pattern.

## Architecture

![Architecture Diagram](./architecture.png)

### Components

- **Frontend**: Svelte
- **Backend API**:
  - GraphQL API (Apollo on ECS)

- **Backend Internal Services**:
  - SNS - SQS Fanout Architecture to handle asynchronous events
  - Event Bus (AWS EventBridge)
  - Order management microservice (AWS Lambda)
  - Payment microservice (AWS Lambda)
  - Fulfilment microservice (AWS Lambda)

## Deployment

For serverless deployment, serverless framework is used. I am using my custom AWS profile for deployment. You can change it in `serverless.yml` file.

```yml
provider:
  name: aws
  runtime: nodejs16.x
  stage: dev
  region: ap-southeast-2
  profile: dina # replace dina with your profile name or delete this if default profile is used
```

## Microservices
There are multiple disparate microservices that are deployed as AWS Lambda functions. These microservices expose sync HTTP endpoints that allow consumers to interact with them. They also listen to events published on an SNS topic and perform actions based on the event.

### Order Management Microservice
This microservice is responsible for managing orders. It exposes the following endpoints:

- `GET /coffees` - Get all coffees
- `POST /order` - Create a new order
- `GET /order/:id` - Get an order by id
- `GET /order?date={today by default}` - Get all orders
- `GET /order?customerName={name}` - Get all orders

### Payment Microservice
This microservice is responsible for processing payments. It exposes the following endpoints:

- `POST /payment` - Create a payment for an order
- `GET /payment/:id` - Get a payment by id
- `GET /payment?date={today by default}` - Get all payments

### Fulfilment Microservice
This microservice is responsible for fulfilling orders. It exposes the following endpoints:

- `GET /fulfilment/:id` - Get a fulfilment by id
- `GET /fulfilment?date={today by default}` - Get all fulfilments
- `UPDATE /fulfilment/:id` - Update status of a fulfilment by id

## Events

Event object will have following interface:

```ts
interface Event {
  id: string // event id
  type: Type // event type
  created: number // timestamp
  data: {
    orderId: string // order id
    orderStatus: string // order status
    paymentId: string // payment id
    paymentStatus: string // payment status
    fulfilmentId: string // fulfilment id
    fulfilmentStatus: string // fulfilment status
  }
}

enum Type {
  ORDER_CREATED = 'ORDER_CREATED', // explicitly created by GQL API
  ORDER_IN_PROGRESS = 'ORDER_IN_PROGRESS', // order ms emits this after PAYMENT_SUCCESSFUL event
  ORDER_COMPLETED = 'ORDER_COMPLETED', // order ms emits this after FULFILMENT_SUCCESSFUL event
  ORDER_CANCELLED = 'ORDER_CANCELLED', // order ms emits this after PAYMENT_FAILED|FULFILMENT_FAILED event or customer cancels order
  PAYMENT_CREATED = 'PAYMENT_CREATED', // explicitly created by GQL API
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL', // payment ms emits this after successful payment processing in stripe
  PAYMENT_FAILED = 'PAYMENT_FAILED', // payment ms emits this after payment fails in stripe
  FULFILMENT_CREATED = 'FULFILMENT_CREATED', // set after PAYMENT_SUCCESSFUL event
  FULFILMENT_COMPLETED = 'FULFILMENT_COMPLETED', // fulfilment ms emits this after successful fulfilment
  FULFILMENT_FAILED = 'FULFILMENT_FAILED' // fulfilment ms emits this after fulfilment fails
}
```
