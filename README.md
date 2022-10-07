# event-driven-coffee

Full stack coffee ordering app with Svelte for frontend and event driven architecture for backend using AWS services. This is just a demo app to showcase the event driven integration pattern.

## Architecture

![Architecture Diagram](./architecture.png)

### Components

- Frontend: Svelte
- Backend:
  - GraphQL API (Apollo Server running in ECS Fargate)
  - Order management service (AWS Lambda)
  - Payment service (AWS Lambda)
  - Fulfilment service (AWS Lambda)
