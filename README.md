# event-driven-coffee

Full stack coffee ordering app with Svelte for frontend and event driven architecture for backend using AWS services. This is just a demo app to showcase the event driven integration pattern.

## Architecture

![Architecture Diagram](./architecture.png)

### Components

- **Frontend**: Svelte
- **Backend**:
  - GraphQL API (GraphQL Yoga Server + Prisma on ECS)
  - Event Bus (AWS EventBridge)
  - Order management microservice (AWS Lambda)
  - Payment microservice (AWS Lambda)
  - Fulfilment microservice (AWS Lambda)
