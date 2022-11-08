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
- `GET /order?customerId={id}` - Get all orders
- `PATCH /order/:id` - Update an order by id, eg: cancel order

### Payment Microservice
This microservice is responsible for processing payments. It exposes the following endpoints:

- `POST /payment` - Create a payment for an order
- `GET /payment/:id` - Get a payment by id
- `GET /payment?date={today by default}` - Get all payments

### Fulfilment Microservice
This microservice is responsible for fulfilling orders. It exposes the following endpoints:

- `GET /fulfilment/:id` - Get a fulfilment by id
- `GET /fulfilment?date={today by default}` - Get all fulfilments
- `PATCH /fulfilment/:id` - Update status of a fulfilment by id

## Events

Event object will have following interface:

```ts
export type OrderStatus =
  | 'ORDER_CREATED'
  | 'ORDER_IN_PROGRESS'
  | 'ORDER_CANCELLED'
  | 'ORDER_COMPLETED'

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'

export type FulfilmentStatus =
  | 'FULFILMENT_PENDING'
  | 'FULFILMENT_CREATED'
  | 'FULFILMENT_COMPLETED'
  | 'FULFILMENT_REJECTED'

```
