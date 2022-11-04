# event-driven-coffee

Full stack coffee ordering app with Svelte for frontend and event driven architecture for backend using AWS services. This is just a demo app to showcase the event driven integration pattern.

## Architecture

![Architecture Diagram](./architecture.png)

### Components

- **Frontend**: Svelte
- **Backend**:
  - GraphQL API (GraphQL Yoga Server + Prisma on ECS)
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
  profile: np-nonprod-1 # replace dina with your profile name or delete this if default profile is used
```

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
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_IN_PROGRESS = 'ORDER_IN_PROGRESS',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  FULFILMENT_CREATED = 'FULFILMENT_CREATED',
  FULFILMENT_COMPLETED = 'FULFILMENT_COMPLETED',
  FULFILMENT_FAILED = 'FULFILMENT_FAILED'
}
```
